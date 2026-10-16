-- CRM ve push bildirimleri.
--
-- Segment kuralları jsonb olarak saklanıyor: kuralların şekli
-- @neuropeak/core'daki `SegmentRule` ile aynı ve orada
-- değerlendiriliyor. Veritabanı kuralı yorumlamıyor, taşıyor.

create type public.push_status as enum ('draft', 'scheduled', 'sending', 'sent', 'failed');

-- ---------------------------------------------------------------- cihaz jetonları

create table public.push_tokens (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Expo push token; cihaz başına bir satır.
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  -- Kullanıcı bildirimi kapatırsa satır silinmez, pasife alınır: hangi
  -- cihazın ne zaman izin verdiğini kaybetmemek için.
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, token)
);

create index push_tokens_active_idx on public.push_tokens (is_active, locale);

-- ---------------------------------------------------------------- segmentler

create table public.segments (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title text not null,
  description text,
  -- 'all' kuralların hepsini, 'any' birini ister.
  match_mode text not null default 'all' check (match_mode in ('all', 'any')),
  -- SegmentRule[] — bkz. packages/core/src/crm/segments.ts
  rules jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger segments_touch_updated_at
before update on public.segments
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- kampanyalar

create table public.push_campaigns (
  id uuid primary key default gen_random_uuid(),
  segment_id text references public.segments (id) on delete restrict,
  title_tr text not null,
  body_tr text not null,
  title_en text not null,
  body_en text not null,
  -- Kullanıcının yerel saatiyle gönderim saati; boşsa hemen gönderilir.
  local_hour smallint check (local_hour between 0 and 23),
  status public.push_status not null default 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  -- Gönderim sonrası sayaçlar; sunucu doldurur.
  recipient_count integer not null default 0 check (recipient_count >= 0),
  delivered_count integer not null default 0 check (delivered_count >= 0),
  opened_count integer not null default 0 check (opened_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Gönderilmiş kampanyanın gönderim zamanı olmalı.
  constraint push_campaigns_sent_has_time check (status <> 'sent' or sent_at is not null)
);

create trigger push_campaigns_touch_updated_at
before update on public.push_campaigns
for each row execute function public.touch_updated_at();

create index push_campaigns_status_idx on public.push_campaigns (status, created_at desc);

-- Aynı kullanıcıya aynı kampanyanın iki kez gitmemesi için.
create table public.push_deliveries (
  campaign_id uuid not null references public.push_campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  primary key (campaign_id, user_id)
);

create index push_deliveries_user_idx on public.push_deliveries (user_id, sent_at desc);

-- ---------------------------------------------------------------- RLS

alter table public.push_tokens enable row level security;
alter table public.segments enable row level security;
alter table public.push_campaigns enable row level security;
alter table public.push_deliveries enable row level security;

-- Kullanıcı yalnızca kendi cihaz jetonunu yazar ve okur.
create policy push_tokens_own on public.push_tokens
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Kullanıcı kendisine gelen bildirimin açıldığını işaretleyebilir.
create policy push_deliveries_select_own on public.push_deliveries
for select to authenticated
using (user_id = (select auth.uid()));

create policy push_deliveries_update_own on public.push_deliveries
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Segmentler ve kampanyalar yalnızca panelin (service role) işi;
-- istemciye hiçbir politika açılmıyor.
