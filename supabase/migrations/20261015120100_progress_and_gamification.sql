-- İlerleme, skorlar ve oyunlaştırma: oyun ilerlemesi, test sonuçları,
-- beyin haritası, seri, yıldız ekonomisi, rozetler, günlük görevler ve ligler.

create type public.star_reason as enum (
  'game_complete',
  'test_complete',
  'daily_task',
  'daily_login',
  'rewarded_ad',
  'level_up',
  'badge',
  'league_reward',
  'spend_hint',
  'spend_undo',
  'spend_skip',
  'spend_streak_freeze',
  'spend_unlock',
  'admin_grant'
);

create type public.league_tier as enum (
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'legend'
);

-- ---------------------------------------------------------------- oyun ilerlemesi

create table public.game_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id) on delete cascade,
  best_level integer not null default 0 check (best_level >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  rounds_played integer not null default 0 check (rounds_played >= 0),
  total_time_ms bigint not null default 0 check (total_time_ms >= 0),
  last_played_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create trigger game_progress_touch_updated_at
before update on public.game_progress
for each row execute function public.touch_updated_at();

-- Her oynanış ayrı satır: beyin haritası, lig XP'si ve panel metrikleri
-- bu tablodan beslenir. game_progress bunun özetidir.
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id) on delete cascade,
  difficulty public.difficulty not null default 'medium',
  level integer check (level is null or level > 0),
  score integer not null default 0 check (score >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  completed boolean not null default true,
  played_at timestamptz not null default now()
);

create index game_sessions_user_played_idx on public.game_sessions (user_id, played_at desc);
create index game_sessions_game_idx on public.game_sessions (game_id, played_at desc);

-- ---------------------------------------------------------------- test sonuçları

create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  test_id text not null references public.tests (id) on delete cascade,
  raw_score numeric(8, 3) not null,
  iq_score smallint not null check (iq_score between 55 and 145),
  percentile numeric(5, 2) not null check (percentile between 0 and 100),
  correct_count smallint not null check (correct_count >= 0),
  answered_count smallint not null check (answered_count >= 0),
  -- Alt boyut kırılımı: {"verbal": 104, "numeric": 98, ...}
  subscores jsonb not null default '{}'::jsonb,
  duration_ms integer not null check (duration_ms >= 0),
  created_at timestamptz not null default now(),
  constraint test_results_correct_lte_answered check (correct_count <= answered_count)
);

create index test_results_user_created_idx on public.test_results (user_id, created_at desc);

-- ---------------------------------------------------------------- beyin haritası

create table public.brain_map (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  memory smallint not null default 0 check (memory between 0 and 100),
  focus smallint not null default 0 check (focus between 0 and 100),
  logic smallint not null default 0 check (logic between 0 and 100),
  speed smallint not null default 0 check (speed between 0 and 100),
  problem_solving smallint not null default 0 check (problem_solving between 0 and 100),
  updated_at timestamptz not null default now()
);

create trigger brain_map_touch_updated_at
before update on public.brain_map
for each row execute function public.touch_updated_at();

-- Eksen puanlarının haftalık geçmişi; İlerleme sekmesindeki trend grafiği.
create table public.brain_map_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recorded_on date not null default current_date,
  memory smallint not null,
  focus smallint not null,
  logic smallint not null,
  speed smallint not null,
  problem_solving smallint not null,
  neuropeak_score smallint not null,
  unique (user_id, recorded_on)
);

-- ---------------------------------------------------------------- seri

create table public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_days integer not null default 0 check (current_days >= 0),
  longest_days integer not null default 0 check (longest_days >= 0),
  last_active_date date,
  freezes_left smallint not null default 0 check (freezes_left >= 0),
  updated_at timestamptz not null default now(),
  constraint streaks_longest_gte_current check (longest_days >= current_days)
);

create trigger streaks_touch_updated_at
before update on public.streaks
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- yıldız ekonomisi

-- Yalnızca ekleme yapılan defter. profiles.star_balance bu defterden
-- tetikleyiciyle türetilir; bakiye hiçbir zaman elle yazılmaz.
create table public.stars_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason public.star_reason not null,
  -- İlgili kayıt: oyun kimliği, görev kimliği, rozet kimliği…
  ref text,
  created_at timestamptz not null default now()
);

create index stars_ledger_user_created_idx on public.stars_ledger (user_id, created_at desc);

create or replace function public.apply_star_delta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  -- profiles üzerindeki koruma tetikleyicisi star_balance'ın istemciden
  -- değiştirilmesini engeller. Bakiyeyi yazmaya yetkili tek yer burasıdır;
  -- bu bayrak korumaya "bu güncelleme defterden geliyor" der.
  perform set_config('neuropeak.ledger_apply', 'on', true);

  update public.profiles
  set star_balance = star_balance + new.delta
  where id = new.user_id
  returning star_balance into new_balance;

  perform set_config('neuropeak.ledger_apply', 'off', true);

  if not found then
    raise exception 'stars_ledger: profil bulunamadı (%)', new.user_id;
  end if;

  -- Bakiye kontrolü profiles üzerindeki CHECK ile de yakalanır; buradaki
  -- mesaj hatanın nedenini açık eder.
  if new_balance < 0 then
    raise exception 'stars_ledger: yetersiz bakiye (kullanıcı %, istenen %)', new.user_id, new.delta;
  end if;

  return new;
end;
$$;

create trigger stars_ledger_apply_delta
after insert on public.stars_ledger
for each row execute function public.apply_star_delta();

-- ---------------------------------------------------------------- rozetler

create table public.badges (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title_tr text not null,
  title_en text not null,
  description_tr text,
  description_en text,
  tier smallint not null default 1 check (tier between 1 and 4),
  star_reward integer not null default 0 check (star_reward >= 0),
  -- Gizli rozetler kazanılmadan listede görünmez.
  is_secret boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------------------------------------------------------------- günlük görevler

create table public.daily_task_templates (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title_tr text not null,
  title_en text not null,
  -- Görevin neyi saydığı: 'play_games' | 'earn_xp' | 'finish_test' | 'play_category'
  metric text not null,
  target integer not null check (target > 0),
  -- metric = 'play_category' ise hangi kategori.
  category public.game_category,
  star_reward integer not null default 10 check (star_reward >= 0),
  weight smallint not null default 1 check (weight > 0),
  is_active boolean not null default true
);

create table public.user_daily_tasks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_date date not null default current_date,
  template_id text not null references public.daily_task_templates (id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  target integer not null check (target > 0),
  claimed_at timestamptz,
  primary key (user_id, task_date, template_id)
);

create index user_daily_tasks_user_date_idx on public.user_daily_tasks (user_id, task_date desc);

-- ---------------------------------------------------------------- lig

create table public.league_groups (
  id uuid primary key default gen_random_uuid(),
  tier public.league_tier not null,
  -- Haftanın pazartesi tarihi; bir kademede aynı hafta birden çok grup olur.
  week_start date not null,
  created_at timestamptz not null default now()
);

create index league_groups_tier_week_idx on public.league_groups (tier, week_start);

create table public.league_members (
  group_id uuid not null references public.league_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- league_groups.week_start'ın kopyası: "bir kullanıcı bir haftada tek
  -- grupta" kuralını tek bir benzersiz dizinle kurmayı sağlar.
  week_start date not null,
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Kopyalanan week_start'ın grubunkiyle aynı kalmasını garantiler.
alter table public.league_groups add constraint league_groups_id_week_key unique (id, week_start);

alter table public.league_members
add constraint league_members_group_week_fkey
foreign key (group_id, week_start)
references public.league_groups (id, week_start)
on delete cascade;

create unique index league_members_user_week_idx on public.league_members (user_id, week_start);
create index league_members_group_xp_idx on public.league_members (group_id, weekly_xp desc);

-- ---------------------------------------------------------------- uzaktan kontrol

-- Paywall metni, fiyat varyantı, A/B dağılımı ve özellik anahtarları.
-- Panelden değiştirilir, uygulama açılışta okur.
create table public.app_config (
  key text primary key check (key ~ '^[a-z0-9_.]+$'),
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

create trigger app_config_touch_updated_at
before update on public.app_config
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- analitik

create table public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (name ~ '^[a-z0-9_]+$'),
  properties jsonb not null default '{}'::jsonb,
  session_id uuid,
  app_version text,
  platform text check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now()
);

create index analytics_events_name_created_idx on public.analytics_events (name, created_at desc);
create index analytics_events_user_idx on public.analytics_events (user_id, created_at desc);
