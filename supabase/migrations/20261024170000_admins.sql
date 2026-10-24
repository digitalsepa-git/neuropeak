-- Yönetici kimliği ve panel yetkileri.
--
-- İçerik tabloları bugüne kadar herkese salt okunur, yazmaya kapalıydı;
-- ilk RLS dosyası yazmayı `service_role`e bırakıyordu. O anahtar RLS'i
-- tamamen atlıyor: paneli onunla çalıştırmak, panele giren herkese
-- veritabanının tamamını açmak demek ve kimin ne yaptığı kayda
-- geçmiyor.
--
-- Onun yerine yönetici bir veri: `admins` tablosundaki satır. Panel
-- yöneticinin kendi oturumuyla konuşuyor, RLS açık kalıyor ve yetki
-- de diğer kurallar gibi ilkelerde yazılı.
--
-- Yönetici içerik tablolarının hepsini görüyor — pasif satırları ve
-- gizli rozetleri de. İlkeler OR'lanıyor, yani mevcut "yalnızca
-- yayındaki satır" ilkesi normal kullanıcılar için olduğu gibi
-- duruyor.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- Listeyi okurken kimin yönetici olduğunu görebilmek için.
  -- `auth.users` istemciye kapalı, oradan okunamıyor.
  email text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

alter table public.admins enable row level security;

-- İlkelerin içinden çağrılıyor ve `admins` tablosunun kendi ilkesine
-- takılmaması gerekiyor; `security definer` olmasa ilke kendi kendini
-- çağırıp sonsuz döngüye girerdi.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

-- Kullanıcı kendi satırını görebilir (panel "yönetici miyim" diye
-- buna bakıyor); yöneticiler listenin tamamını görür.
create policy admins_read_self_or_admin on public.admins
for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

-- Yönetici eklemek ve çıkarmak yalnızca yöneticinin işi. İlk yönetici
-- veritabanından elle ekleniyor; README'de yazılı.
create policy admins_write_admin on public.admins
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------- içerik yetkileri

-- Yöneticinin içerik tablolarındaki okuma ve yazma hakkı. Desen her
-- tabloda aynı olduğu için tek yerden kuruluyor — kullanıcı
-- tablolarındaki sahiplik ilkeleriyle aynı yaklaşım.
--
-- Silme yalnızca yöneticide: içerik yönetirken bir eşleşmeyi ya da
-- taslak satırı kaldırmak gerekiyor. Normal kullanıcılar için hiçbir
-- tabloda delete yok, o kural duruyor.
do $$
declare
  content_table text;
begin
  foreach content_table in array array[
    'games',
    'tests',
    'questions',
    'test_questions',
    'badges',
    'daily_task_templates',
    'measure_tests',
    'measure_steps',
    'profile_tests',
    'profile_traits',
    'profile_questions',
    'profile_outcomes',
    'app_config'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_admin())',
      content_table || '_admin_read', content_table
    );

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      content_table || '_admin_insert', content_table
    );

    execute format(
      'create policy %I on public.%I for update to authenticated '
      || 'using (public.is_admin()) with check (public.is_admin())',
      content_table || '_admin_update', content_table
    );

    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      content_table || '_admin_delete', content_table
    );
  end loop;
end;
$$;
