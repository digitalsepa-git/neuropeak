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

insert into public.questions (test_id, kind, prompt_tr, prompt_en, options, correct_index)
values
  ('basic-iq', 'logic', 'Soru', 'Question', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 1),
  ('draft-test', 'logic', 'Taslak soru', 'Draft question', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 0);

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
    insert into public.questions (test_id, kind, prompt_tr, prompt_en, options, correct_index)
    values ('basic-iq', 'logic', 'S', 'Q', '[{"tr":"A"},{"tr":"B"}]'::jsonb, 5);
    raise exception 'beklenen hata alınmadı: questions_correct_index_in_range';
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
  -- Pasif testin sorusu da gizlenmeli.
  assert (select count(*) from public.questions) = 1,
    'anon pasif testin sorusunu görüyor';
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
