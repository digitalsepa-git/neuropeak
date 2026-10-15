-- NeuroPeak çekirdek şeması: numaralandırmalar, kullanıcı profili ve içerik tabloları.
-- İçerik tabloları (games, tests, questions) panelden yönetilir, uygulama yalnızca okur.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- numaralandırmalar

create type public.game_category as enum (
  'memory',
  'attention',
  'logic',
  'math',
  'spatial',
  'speed',
  'verbal'
);

create type public.game_mode as enum ('levels', 'timed');

create type public.brain_axis as enum ('memory', 'focus', 'logic', 'speed', 'problem_solving');

create type public.difficulty as enum ('easy', 'medium', 'hard');

create type public.test_kind as enum ('iq', 'fun');

create type public.question_kind as enum (
  'matrix',
  'number_series',
  'shape_analogy',
  'verbal_analogy',
  'logic',
  'spatial',
  'coding',
  'odd_one_out',
  'arithmetic'
);

-- ---------------------------------------------------------------- ortak yardımcılar

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profil

-- Hesap zorunlu değil: uygulama anonim oturum açar, kullanıcı isterse
-- sonradan Apple/Google ile kalıcı hesaba bağlanır. Her iki durumda da
-- auth.users'ta bir satır vardır ve profil ona bağlıdır.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 40),
  country_code char(2),
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  is_anonymous boolean not null default true,
  is_pro boolean not null default false,
  pro_expires_at timestamptz,
  -- stars_ledger'daki hareketlerden tetikleyiciyle türetilir, elle yazılmaz.
  star_balance integer not null default 0 check (star_balance >= 0),
  xp integer not null default 0 check (xp >= 0),
  level smallint not null default 1 check (level >= 1),
  -- Beş eksenin ağırlıklı ortalaması; ağırlıklar @neuropeak/core'da tanımlı.
  neuropeak_score smallint not null default 0 check (neuropeak_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create index profiles_neuropeak_score_idx on public.profiles (neuropeak_score desc);
create index profiles_country_score_idx on public.profiles (country_code, neuropeak_score desc);

-- Yeni kullanıcı için profil ve yan tablolar otomatik açılır; istemcinin
-- kayıt sonrası ayrıca insert atmasına gerek kalmaz.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_anonymous)
  values (new.id, coalesce(new.is_anonymous, true))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- onboarding

create table public.onboarding_answers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  age_range text check (age_range in ('13-17', '18-24', '25-34', '35-44', '45-54', '55+')),
  focus_areas public.game_category[] not null default '{}',
  daily_goal_minutes smallint check (daily_goal_minutes in (5, 10, 20)),
  concern text check (concern in ('forgetfulness', 'distraction', 'slowThinking', 'none')),
  habit text check (habit in ('daily', 'sometimes', 'rarely', 'never')),
  notifications_granted boolean not null default false,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger onboarding_answers_touch_updated_at
before update on public.onboarding_answers
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- içerik: oyunlar

create table public.games (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  category public.game_category not null,
  mode public.game_mode not null,
  title_tr text not null,
  title_en text not null,
  description_tr text,
  description_en text,
  -- Seviyeli oyunlarda seviye sayısı; süreli oyunlarda 0 (sonsuz).
  total_levels integer not null default 0 check (total_levels >= 0),
  xp_per_round integer not null default 10 check (xp_per_round > 0),
  star_reward integer not null default 1 check (star_reward >= 0),
  -- Bu oyunun beslediği beyin haritası eksenleri: {"memory": 0.7, "speed": 0.3}
  axis_weights jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint games_mode_levels_agree check (
    (mode = 'levels' and total_levels > 0) or (mode = 'timed' and total_levels = 0)
  )
);

create trigger games_touch_updated_at
before update on public.games
for each row execute function public.touch_updated_at();

create index games_active_sort_idx on public.games (category, sort_order) where is_active;

-- ---------------------------------------------------------------- içerik: testler

create table public.tests (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  kind public.test_kind not null,
  title_tr text not null,
  title_en text not null,
  description_tr text,
  description_en text,
  -- Bir oturumda sorulan soru sayısı; havuz bundan büyük olabilir.
  question_count smallint not null check (question_count > 0),
  est_minutes_min smallint not null check (est_minutes_min > 0),
  est_minutes_max smallint not null,
  is_pro boolean not null default true,
  -- Norm tabanlı skorlama: ham puan bu ortalama ve sapmaya göre IQ'ya çevrilir.
  norm_mean numeric(6, 2) not null default 100,
  norm_sd numeric(6, 2) not null default 15 check (norm_sd > 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tests_minutes_range check (est_minutes_max >= est_minutes_min)
);

create trigger tests_touch_updated_at
before update on public.tests
for each row execute function public.touch_updated_at();

create index tests_active_sort_idx on public.tests (kind, sort_order) where is_active;

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id text not null references public.tests (id) on delete cascade,
  kind public.question_kind not null,
  prompt_tr text not null,
  prompt_en text not null,
  image_path text,
  -- [{ "tr": "...", "en": "...", "image_path": null }, ...]
  options jsonb not null,
  correct_index smallint not null check (correct_index >= 0),
  -- Skorlamada sorunun ağırlığı; zor sorular daha çok puan getirir.
  difficulty_weight numeric(4, 2) not null default 1 check (difficulty_weight > 0),
  axis public.brain_axis,
  explanation_tr text,
  explanation_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint questions_options_min_two check (jsonb_array_length(options) >= 2),
  constraint questions_correct_index_in_range check (correct_index < jsonb_array_length(options))
);

create trigger questions_touch_updated_at
before update on public.questions
for each row execute function public.touch_updated_at();

create index questions_test_idx on public.questions (test_id) where is_active;
