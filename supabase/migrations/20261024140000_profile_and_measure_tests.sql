-- Profil testleri ve Beyin Yaşı için şema.
--
-- Uygulamada on bir test var ama veritabanı yalnızca yedisini, soru
-- havuzlu olanları tutabiliyordu. Kalan dördü yapısal olarak farklı:
--
--   Beyin Yaşı soru sormuyor, dört ölçüm yaptırıyor.
--   Profil testlerinin doğru cevabı yok — her şık bir ya da birkaç
--   eksene puan yazıyor, sonuç bir arketip ya da eksen haritası.
--
-- Bunları `tests` tablosuna sıkıştırmak mümkündü ama orada
-- `question_count`, `norm_mean` ve `norm_sd` var; üçü de bu testler
-- için anlamsız. `questions` ise `correct_index`i zorunlu tutuyor ve
-- profil sorusunun doğru cevabı yok. Zorlasaydık "bir tür için
-- zorunlu, öbürü için yasak" sütunlar çıkardı; onun yerine her tür
-- kendi tablosunda duruyor.
--
-- Eksen ağırlıkları jsonb: motor @neuropeak/core'daki `scoreProfile`.
-- Veritabanı puanlamıyor, taşıyor — `badges.requirement` ile aynı.

-- ---------------------------------------------------------------- ölçüm testleri

create type public.brain_age_measure as enum ('reaction', 'memory', 'speed', 'focus');

create table public.measure_tests (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title_tr text not null,
  title_en text not null,
  description_tr text,
  description_en text,
  -- Çıkan sayının ne olmadığını söyleyen uyarı; uygulamada hem
  -- girişte hem sonuçta gösteriliyor, bu yüzden içeriğin parçası.
  caveat_tr text not null,
  caveat_en text not null,
  est_minutes_min smallint not null check (est_minutes_min > 0),
  est_minutes_max smallint not null,
  is_pro boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measure_tests_minutes_range check (est_minutes_max >= est_minutes_min)
);

create trigger measure_tests_touch_updated_at
before update on public.measure_tests
for each row execute function public.touch_updated_at();

create table public.measure_steps (
  test_id text not null references public.measure_tests (id) on delete cascade,
  measure public.brain_age_measure not null,
  title_tr text not null,
  title_en text not null,
  instruction_tr text not null,
  instruction_en text not null,
  -- Ölçümün yaklaşık süresi; giriş ekranında toplamı gösteriliyor.
  seconds smallint not null check (seconds > 0),
  sort_order integer not null default 0,
  primary key (test_id, measure)
);

create index measure_steps_test_idx on public.measure_steps (test_id, sort_order);

-- ---------------------------------------------------------------- profil testleri

create table public.profile_tests (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title_tr text not null,
  title_en text not null,
  description_tr text,
  description_en text,
  -- "Bu bir kişilik envanteri değil." Uygulamada gösteriliyor.
  caveat_tr text not null,
  caveat_en text not null,
  est_minutes_min smallint not null check (est_minutes_min > 0),
  est_minutes_max smallint not null,
  is_pro boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_tests_minutes_range check (est_minutes_max >= est_minutes_min)
);

create trigger profile_tests_touch_updated_at
before update on public.profile_tests
for each row execute function public.touch_updated_at();

-- Testin eksenleri. Kimlik test içinde tekil: iki test aynı 'analytic'
-- kimliğini kullanabilir ve bu ikisi farklı eksendir.
create table public.profile_traits (
  test_id text not null references public.profile_tests (id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9-]+$'),
  label_tr text not null,
  label_en text not null,
  description_tr text not null,
  description_en text not null,
  sort_order integer not null default 0,
  primary key (test_id, id)
);

create table public.profile_questions (
  id uuid primary key default gen_random_uuid(),
  test_id text not null references public.profile_tests (id) on delete cascade,
  -- İçerikteki kalıcı kimlik ('arch-1').
  slug text not null,
  prompt_tr text not null,
  prompt_en text not null,
  -- Şıklar ve eksen puanları:
  -- [{ "label": {"tr":"…","en":"…"}, "weights": {"analytic": 2} }, …]
  -- Doğru cevap yok; bu yüzden `correct_index` de yok.
  options jsonb not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_id, slug),
  constraint profile_questions_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint profile_questions_options_min_two check (jsonb_array_length(options) >= 2)
);

create trigger profile_questions_touch_updated_at
before update on public.profile_questions
for each row execute function public.touch_updated_at();

create index profile_questions_test_idx on public.profile_questions (test_id, sort_order)
  where is_active;

-- Arketipler. `is_balanced` olan, hiçbir eksen öne çıkmadığında
-- gösterilen sonuç; sıralamaya girmiyor, bu yüzden ayrı bir bayrakla
-- duruyor ve test başına en fazla bir tane olabiliyor.
create table public.profile_outcomes (
  test_id text not null references public.profile_tests (id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9-]+$'),
  title_tr text not null,
  title_en text not null,
  description_tr text not null,
  description_en text not null,
  -- Bu sonucu temsil eden eksenler: ["analytic", "methodical"].
  -- Eşleşme bunların ortalaması; hesap @neuropeak/core'da.
  traits jsonb not null default '[]'::jsonb,
  is_balanced boolean not null default false,
  sort_order integer not null default 0,
  primary key (test_id, id),
  constraint profile_outcomes_traits_is_array check (jsonb_typeof(traits) = 'array')
);

create unique index profile_outcomes_one_balanced
  on public.profile_outcomes (test_id)
  where is_balanced;

-- ---------------------------------------------------------------- okuma ilkeleri

alter table public.measure_tests enable row level security;
alter table public.measure_steps enable row level security;
alter table public.profile_tests enable row level security;
alter table public.profile_traits enable row level security;
alter table public.profile_questions enable row level security;
alter table public.profile_outcomes enable row level security;

create policy measure_tests_read_active on public.measure_tests
for select to anon, authenticated
using (is_active);

create policy measure_steps_read_active on public.measure_steps
for select to anon, authenticated
using (
  exists (
    select 1 from public.measure_tests t where t.id = measure_steps.test_id and t.is_active
  )
);

create policy profile_tests_read_active on public.profile_tests
for select to anon, authenticated
using (is_active);

create policy profile_traits_read_active on public.profile_traits
for select to anon, authenticated
using (
  exists (
    select 1 from public.profile_tests t where t.id = profile_traits.test_id and t.is_active
  )
);

create policy profile_questions_read_active on public.profile_questions
for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.profile_tests t where t.id = profile_questions.test_id and t.is_active
  )
);

create policy profile_outcomes_read_active on public.profile_outcomes
for select to anon, authenticated
using (
  exists (
    select 1 from public.profile_tests t where t.id = profile_outcomes.test_id and t.is_active
  )
);
