-- Push kampanyalarının yönetici yetkileri ve segment okuması.
--
-- `push_campaigns` ve `segments` RLS açıkken hiçbir ilkesi yoktu,
-- yani kimse okuyup yazamıyordu. Panel kampanyayı taslak olarak
-- saklayabilmeli; göndermek hâlâ ayrı bir servisin işi ve o servis
-- `service_role` ile çalışacak.
--
-- `push_deliveries` kasıtlı olarak açılmıyor: kime ne gittiğinin
-- satır satır kaydı, panelin kampanya hazırlamak için ihtiyaç
-- duyduğu bir şey değil. Özet sayaçlar zaten `push_campaigns`
-- üstünde duruyor.

alter table public.segments enable row level security;
alter table public.push_campaigns enable row level security;

-- Segment tanımı içerik gibi: panelin okuması gerekiyor. Yazma
-- yöneticide; segmentler bugün kodda tanımlı ve seed'le geliyor.
create policy segments_read_active on public.segments
for select to anon, authenticated
using (is_active);

create policy segments_write_admin on public.segments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy push_campaigns_admin on public.push_campaigns
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Taslak dışındaki durumlara panelden geçilemez: kampanyayı
-- "gönderiliyor" ya da "gönderildi" yapmak, gerçekten gönderen
-- servisin söyleyebileceği bir şey. Panelden elle işaretlenirse
-- gönderilmemiş bir kampanya gönderilmiş görünürdü.
create or replace function public.guard_campaign_status()
returns trigger
language plpgsql
as $$
begin
  if current_setting('role', true) is distinct from 'service_role'
     and new.status is distinct from 'draft'
     and new.status is distinct from 'scheduled' then
    raise exception 'push_campaigns: durum yalnızca gönderen servis tarafından değiştirilir';
  end if;

  return new;
end;
$$;

create trigger push_campaigns_guard_status
before insert or update on public.push_campaigns
for each row execute function public.guard_campaign_status();
