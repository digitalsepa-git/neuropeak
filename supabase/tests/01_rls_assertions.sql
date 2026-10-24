-- Şema ve RLS davranış testleri. Her bölüm başarısız olursa betik durur.
-- Çalıştırmak için: scripts/verify-schema.sh

\set ON_ERROR_STOP on

begin;

-- ---------------------------------------------------------------- hazırlık

insert into auth.users (id, is_anonymous)
values
  ('11111111-1111-1111-1111-111111111111', true),
  ('22222222-2222-2222-2222-222222222222', true);

-- Tetikleyici her iki kullanıcı için de profil açmış olmalı.
do $$
begin
  assert (select count(*) from public.profiles) = 2,
    'auth.users eklendiğinde profil otomatik açılmadı';
end;
$$;

insert into public.games (id, category, mode, title_tr, title_en, total_levels)
values
  ('card-match', 'memory', 'levels', 'Kart Eşleme', 'Card Match', 240),
  ('stroop', 'attention', 'timed', 'Renk Tuzağı', 'Color Trap', 0),
  ('hidden-game', 'logic', 'timed', 'Gizli', 'Hidden', 0);

update public.games set is_active = false where id = 'hidden-game';

insert into public.tests
  (id, kind, title_tr, title_en, question_count, est_minutes_min, est_minutes_max, is_pro)
values
  ('basic-iq', 'iq', 'Temel IQ Testi', 'Basic IQ Test', 20, 8, 12, false),
  ('draft-test', 'iq', 'Taslak', 'Draft', 10, 4, 6, true);

update public.tests set is_active = false where id = 'draft-test';

-- Ölçüm ve profil testleri kendi tablolarında; biri pasif.
insert into public.measure_tests
  (id, title_tr, title_en, caveat_tr, caveat_en, est_minutes_min, est_minutes_max)
values
  ('brain-age', 'Beyin Yaşı', 'Brain Age', 'Ölçüm değil.', 'Not a measurement.', 3, 5);

insert into public.measure_steps
  (test_id, measure, title_tr, title_en, instruction_tr, instruction_en, seconds)
values
  ('brain-age', 'reaction', 'Tepki', 'Reaction', 'Dokun', 'Tap', 30);

insert into public.profile_tests
  (id, title_tr, title_en, caveat_tr, caveat_en, est_minutes_min, est_minutes_max)
values
  ('archetype', 'Arketip', 'Archetype', 'Envanter değil.', 'Not an inventory.', 2, 3),
  ('draft-profile', 'Taslak', 'Draft', 'Envanter değil.', 'Not an inventory.', 2, 3);

update public.profile_tests set is_active = false where id = 'draft-profile';

insert into public.profile_traits (test_id, id, label_tr, label_en, description_tr, description_en)
values
  ('archetype', 'analytic', 'Çözümleyici', 'Analytic', 'Parçalara ayırır.', 'Breaks it down.'),
  ('draft-profile', 'analytic', 'Çözümleyici', 'Analytic', 'Taslak.', 'Draft.');

insert into public.profile_questions (test_id, slug, prompt_tr, prompt_en, options)
values
  ('archetype', 'ar-1', 'Soru', 'Question',
    '[{"label":{"tr":"A"},"weights":{"analytic":2}},{"label":{"tr":"B"},"weights":{}}]'::jsonb),
  ('draft-profile', 'dp-1', 'Taslak soru', 'Draft question',
    '[{"label":{"tr":"A"},"weights":{}},{"label":{"tr":"B"},"weights":{}}]'::jsonb);

insert into public.profile_outcomes
  (test_id, id, title_tr, title_en, description_tr, description_en, traits, is_balanced)
values
  ('archetype', 'architect', 'Mimar', 'Architect', 'Yapı kurar.', 'Builds structure.',
    '["analytic"]'::jsonb, false),
  ('archetype', 'balanced', 'Dengeli', 'Balanced', 'Eksenler yakın.', 'Axes are close.',
    '[]'::jsonb, true),
  ('draft-profile', 'architect', 'Mimar', 'Architect', 'Taslak.', 'Draft.',
    '[]'::jsonb, false);

-- Soru havuzu testlerden bağımsız; ilişki `test_questions`'ta.
insert into public.questions (slug, kind, prompt_tr, prompt_en, options, correct_index)
values
  ('q-live', 'logic', 'Soru', 'Question', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 1),
  ('q-draft', 'logic', 'Taslak soru', 'Draft question', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 0),
  -- Hem yayındaki hem taslak teste giren soru: havuz paylaşımlı
  -- olduğu için bu normal ve soru görünür kalmalı.
  ('q-shared', 'logic', 'Ortak soru', 'Shared question', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 0);

insert into public.test_questions (test_id, question_id, sort_order)
select t.test_id, q.id, t.sort_order
from (values
  ('basic-iq', 'q-live', 0),
  ('draft-test', 'q-draft', 0),
  ('basic-iq', 'q-shared', 1),
  ('draft-test', 'q-shared', 1)
) as t (test_id, slug, sort_order)
join public.questions q on q.slug = t.slug;

-- ---------------------------------------------------------------- kısıtlar

do $$
begin
  -- Seviyeli oyun seviye sayısı olmadan tanımlanamaz.
  begin
    insert into public.games (id, category, mode, title_tr, title_en, total_levels)
    values ('bad-levels', 'logic', 'levels', 'Kötü', 'Bad', 0);
    raise exception 'beklenen hata alınmadı: games_mode_levels_agree';
  exception
    when check_violation then null;
  end;

  -- Doğru cevap dizini şık sayısını aşamaz.
  begin
    insert into public.questions (slug, kind, prompt_tr, prompt_en, options, correct_index)
    values ('q-bad', 'logic', 'S', 'Q', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 5);
    raise exception 'beklenen hata alınmadı: questions_correct_index_in_range';
  exception
    when check_violation then null;
  end;

  -- Bir profil testinde en fazla bir "dengeli" sonuç olabilir.
  begin
    insert into public.profile_outcomes
      (test_id, id, title_tr, title_en, description_tr, description_en, is_balanced)
    values ('archetype', 'balanced-2', 'İkinci', 'Second', 'A', 'A', true);
    raise exception 'beklenen hata alınmadı: profile_outcomes_one_balanced';
  exception
    when unique_violation then null;
  end;

  -- Profil sorusunun en az iki şıkkı olmalı.
  begin
    insert into public.profile_questions (test_id, slug, prompt_tr, prompt_en, options)
    values ('archetype', 'ar-bad', 'S', 'Q', '[{"label":{"tr":"A"},"weights":{}}]'::jsonb);
    raise exception 'beklenen hata alınmadı: profile_questions_options_min_two';
  exception
    when check_violation then null;
  end;

  -- IQ skoru geçerli aralığın dışında olamaz.
  begin
    insert into public.test_results
      (user_id, test_id, raw_score, iq_score, percentile, correct_count, answered_count, duration_ms)
    values
      ('11111111-1111-1111-1111-111111111111', 'basic-iq', 10, 200, 99, 18, 20, 1000);
    raise exception 'beklenen hata alınmadı: iq_score aralığı';
  exception
    when check_violation then null;
  end;
end;
$$;

-- ---------------------------------------------------------------- yıldız defteri

insert into public.stars_ledger (user_id, delta, reason)
values ('11111111-1111-1111-1111-111111111111', 50, 'daily_login');

do $$
begin
  assert (
    select star_balance from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'
  ) = 50, 'yıldız bakiyesi defterden güncellenmedi';
end;
$$;

insert into public.stars_ledger (user_id, delta, reason)
values ('11111111-1111-1111-1111-111111111111', -20, 'spend_hint');

do $$
begin
  assert (
    select star_balance from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'
  ) = 30, 'harcama bakiyeden düşülmedi';

  -- Bakiyeden fazlası harcanamaz.
  begin
    insert into public.stars_ledger (user_id, delta, reason)
    values ('11111111-1111-1111-1111-111111111111', -1000, 'spend_unlock');
    raise exception 'beklenen hata alınmadı: yetersiz bakiye';
  exception
    when check_violation or raise_exception then null;
  end;
end;
$$;

-- ---------------------------------------------------------------- lig kurulumu

insert into public.league_groups (id, tier, week_start)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'gold', date '2026-10-12'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'gold', date '2026-10-12');

insert into public.league_members (group_id, user_id, week_start, weekly_xp)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', date '2026-10-12', 900),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', date '2026-10-12', 700);

do $$
begin
  -- Aynı hafta ikinci bir gruba girilemez.
  begin
    insert into public.league_members (group_id, user_id, week_start, weekly_xp)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', date '2026-10-12', 10);
    raise exception 'beklenen hata alınmadı: haftada tek grup';
  exception
    when unique_violation then null;
  end;

  -- Üyelik haftası grubunkiyle uyuşmak zorunda.
  begin
    insert into public.league_members (group_id, user_id, week_start, weekly_xp)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', date '2026-10-19', 10);
    raise exception 'beklenen hata alınmadı: hafta uyuşmazlığı';
  exception
    when foreign_key_violation then null;
  end;
end;
$$;

-- ---------------------------------------------------------------- anonim okuma

set local role anon;

do $$
begin
  assert (select count(*) from public.games) = 2,
    'anon pasif oyunu görüyor';
  assert (select count(*) from public.tests) = 1,
    'anon pasif testi görüyor';
  -- Pasif testin yalnızca ona ait sorusu gizlenmeli; yayındaki teste
  -- de giren ortak soru görünmeye devam etmeli.
  assert (select count(*) from public.questions) = 2,
    'anon soru havuzunu yanlış görüyor';
  assert (select count(*) from public.questions where slug = 'q-draft') = 0,
    'anon yalnızca pasif teste ait soruyu görüyor';
  assert (select count(*) from public.questions where slug = 'q-shared') = 1,
    'anon yayındaki teste de giren ortak soruyu göremiyor';
  -- Eşleşme satırları da pasif testi sızdırmamalı.
  assert (select count(*) from public.test_questions) = 2,
    'anon pasif testin soru eşleşmelerini görüyor';
  -- Ölçüm testi ve adımları yayında.
  assert (select count(*) from public.measure_tests) = 1,
    'anon ölçüm testini göremiyor';
  assert (select count(*) from public.measure_steps) = 1,
    'anon ölçüm adımını göremiyor';
  -- Pasif profil testi ve ona bağlı her şey gizlenmeli.
  assert (select count(*) from public.profile_tests) = 1,
    'anon pasif profil testini görüyor';
  assert (select count(*) from public.profile_traits) = 1,
    'anon pasif profil testinin eksenini görüyor';
  assert (select count(*) from public.profile_questions) = 1,
    'anon pasif profil testinin sorusunu görüyor';
  assert (select count(*) from public.profile_outcomes) = 2,
    'anon pasif profil testinin arketipini görüyor';
  assert (select count(*) from public.profiles) = 0,
    'anon profilleri görüyor';
end;
$$;

reset role;

-- ---------------------------------------------------------------- sahiplik

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.profiles) = 1,
    'kullanıcı kendi profilinden fazlasını görüyor';

  -- Kendi ilerlemesini yazabilir.
  insert into public.game_progress (user_id, game_id, best_level)
  values ('11111111-1111-1111-1111-111111111111', 'card-match', 12);

  -- Başkasının adına yazamaz.
  begin
    insert into public.game_progress (user_id, game_id, best_level)
    values ('22222222-2222-2222-2222-222222222222', 'card-match', 99);
    raise exception 'beklenen hata alınmadı: başkası adına yazma';
  exception
    when insufficient_privilege then null;
  end;

  -- Oynanmış oturum sonradan değiştirilemez (update politikası yok).
  insert into public.game_sessions (user_id, game_id, duration_ms, score)
  values ('11111111-1111-1111-1111-111111111111', 'stroop', 60000, 42);

  assert (
    select count(*) from public.game_sessions
  ) = 1, 'kullanıcı kendi oturumunu göremiyor';
end;
$$;

do $$
declare
  affected integer;
begin
  update public.game_sessions set score = 9999;
  get diagnostics affected = row_count;
  assert affected = 0, 'oynanmış oturum değiştirilebiliyor';
end;
$$;

-- Korumalı alanlar istemciden değiştirilemez.
do $$
begin
  begin
    update public.profiles set is_pro = true
    where id = '11111111-1111-1111-1111-111111111111';
    raise exception 'beklenen hata alınmadı: is_pro istemciden değiştirildi';
  exception
    when raise_exception then null;
  end;

  -- Takma ad serbest.
  update public.profiles set display_name = 'Deniz'
  where id = '11111111-1111-1111-1111-111111111111';
  assert (
    select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'
  ) = 'Deniz', 'takma ad güncellenemedi';
end;
$$;

-- ---------------------------------------------------------------- lig görünürlüğü

do $$
begin
  assert (select count(*) from public.league_members) = 1,
    'kullanıcı başka grubun üyelerini görüyor';
  assert (select count(*) from public.league_groups) = 1,
    'kullanıcı başka grubu görüyor';
end;
$$;

reset role;
reset request.jwt.claims;

rollback;

\echo 'Tüm şema ve RLS testleri geçti.'
