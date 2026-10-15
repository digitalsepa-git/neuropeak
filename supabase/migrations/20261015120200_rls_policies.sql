-- Satır düzeyi güvenlik.
--
-- İki kural bütün tabloları özetler:
--   • İçerik tabloları (oyunlar, testler, sorular, rozetler, görev şablonları,
--     yapılandırma) herkese açık ama yalnızca yayındaki satırlar okunur;
--     yazma izni yalnızca panelin kullandığı service_role'dedir.
--   • Kullanıcı tabloları yalnızca satırın sahibine açıktır.
--
-- Hiçbir tabloya anon/authenticated için delete verilmez; hesap silme
-- auth.users üzerinden cascade ile yapılır.

-- ---------------------------------------------------------------- içerik

alter table public.games enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.badges enable row level security;
alter table public.daily_task_templates enable row level security;
alter table public.app_config enable row level security;

create policy games_read_active on public.games
for select to anon, authenticated
using (is_active);

create policy tests_read_active on public.tests
for select to anon, authenticated
using (is_active);

-- Soru yalnızca yayındaki bir teste aitse okunur; pasif testin soruları sızmaz.
create policy questions_read_active on public.questions
for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.tests t
    where t.id = questions.test_id and t.is_active
  )
);

-- Gizli rozetler yalnızca kazanan kullanıcıya görünür.
create policy badges_read_visible on public.badges
for select to anon, authenticated
using (
  is_active
  and (
    not is_secret
    or exists (
      select 1 from public.user_badges ub
      where ub.badge_id = badges.id and ub.user_id = (select auth.uid())
    )
  )
);

create policy daily_task_templates_read_active on public.daily_task_templates
for select to anon, authenticated
using (is_active);

create policy app_config_read on public.app_config
for select to anon, authenticated
using (true);

-- ---------------------------------------------------------------- profil

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = (select auth.uid()));

-- Sahip yalnızca görünür alanları değiştirebilir. Bakiye, XP, seviye ve
-- PRO durumu sunucu tarafından yazılır; istemci bunlara dokunamaz.
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;

  -- Yıldız defteri tetikleyicisi bakiyeyi kendisi yazar; bayrağı o kurar.
  if coalesce(current_setting('neuropeak.ledger_apply', true), 'off') = 'on' then
    return new;
  end if;

  if new.star_balance is distinct from old.star_balance
    or new.is_pro is distinct from old.is_pro
    or new.pro_expires_at is distinct from old.pro_expires_at
  then
    raise exception 'profiles: bu alanlar istemciden değiştirilemez';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_update
before update on public.profiles
for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------- kullanıcı tabloları

-- Sahiplik deseni aynı olan tablolar için politikaları tek yerden kurar.
do $$
declare
  owned_table text;
begin
  foreach owned_table in array array[
    'onboarding_answers',
    'game_progress',
    'game_sessions',
    'test_results',
    'brain_map',
    'brain_map_history',
    'streaks',
    'user_badges',
    'user_daily_tasks',
    'stars_ledger'
  ]
  loop
    execute format('alter table public.%I enable row level security', owned_table);

    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',
      owned_table || '_select_own', owned_table
    );

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',
      owned_table || '_insert_own', owned_table
    );
  end loop;
end;
$$;

-- Yalnızca ekleme yapılan tablolar güncellenemez: oynanmış bir oturum,
-- alınmış bir test sonucu ya da işlenmiş bir yıldız hareketi değişmez.
do $$
declare
  mutable_table text;
begin
  foreach mutable_table in array array[
    'onboarding_answers',
    'game_progress',
    'brain_map',
    'streaks',
    'user_daily_tasks'
  ]
  loop
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      mutable_table || '_update_own', mutable_table
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------- lig

alter table public.league_groups enable row level security;
alter table public.league_members enable row level security;

-- league_members politikası kendi tablosunu sorgulayamaz: politika
-- değerlendirilirken politika yeniden tetiklenir ve sorgu sonsuz
-- özyinelemeye girer. Üyelikleri RLS dışında çözen bir yardımcı kullanılır.
create or replace function public.my_league_group_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select group_id
  from public.league_members
  where user_id = (select auth.uid());
$$;

revoke all on function public.my_league_group_ids() from public;
grant execute on function public.my_league_group_ids() to authenticated;

-- Kullanıcı yalnızca kendi grubunu ve o gruptaki rakiplerini görür.
create policy league_groups_select_own on public.league_groups
for select to authenticated
using (id in (select public.my_league_group_ids()));

create policy league_members_select_group on public.league_members
for select to authenticated
using (group_id in (select public.my_league_group_ids()));

-- Gruba yerleştirme ve haftalık XP yazımı sunucu işidir; istemci yazamaz.

-- ---------------------------------------------------------------- analitik

alter table public.analytics_events enable row level security;

-- Olay gönderilebilir ama geri okunamaz: ham olay akışı yalnızca panele açık.
create policy analytics_events_insert_own on public.analytics_events
for insert to anon, authenticated
with check (user_id is null or user_id = (select auth.uid()));

-- ---------------------------------------------------------------- küresel sıralama

-- Lider tablosu profiles'a doğrudan erişim vermeden okunur: görünen tek
-- şey takma ad, ülke ve skor.
create or replace view public.global_leaderboard
with (security_invoker = false) as
select
  row_number() over (order by neuropeak_score desc, xp desc, id) as rank,
  id as user_id,
  coalesce(display_name, 'NeuroPeak kullanıcısı') as display_name,
  country_code,
  neuropeak_score,
  level
from public.profiles
where neuropeak_score > 0
order by neuropeak_score desc, xp desc, id
limit 500;

grant select on public.global_leaderboard to anon, authenticated;
