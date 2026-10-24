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

-- Biri gizli iki rozet: gizli olan normal kullanıcıya kapalı,
-- yöneticiye açık olmalı.
insert into public.badges (id, title_tr, title_en, tier, star_reward, is_secret, requirement)
values
  ('level-5', 'İlk Adımlar', 'First Steps', 1, 15, false, '{"kind":"level","value":5}'::jsonb),
  ('secret-owl', 'Gece Kuşu', 'Night Owl', 2, 40, true, '{"kind":"rounds","value":250}'::jsonb);

-- İkinci kullanıcı yönetici; birincisi normal kalıyor.
insert into public.admins (user_id, email)
values ('22222222-2222-2222-2222-222222222222', 'admin@example.com');

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
  -- Gizli rozet kazanılmadan görünmemeli.
  assert (select count(*) from public.badges) = 1,
    'anon gizli rozeti görüyor';
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

-- ---------------------------------------------------------------- yönetici

-- Normal kullanıcı: içeriğin yalnızca yayındaki kısmını görür ve
-- hiçbir şey yazamaz.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

do $$
begin
  assert not public.is_admin(), 'normal kullanıcı yönetici sayılıyor';

  assert (select count(*) from public.badges) = 1,
    'normal kullanıcı gizli rozeti görüyor';
  assert (select count(*) from public.games) = 2,
    'normal kullanıcı pasif oyunu görüyor';
  assert (select count(*) from public.admins) = 0,
    'normal kullanıcı yönetici listesini görüyor';

  begin
    insert into public.games (id, category, mode, title_tr, title_en, total_levels)
    values ('sneaky', 'logic', 'timed', 'Sızma', 'Sneak', 0);
    raise exception 'normal kullanıcı içerik yazabildi';
  exception
    when insufficient_privilege then null;
  end;

  begin
    update public.badges set star_reward = 999 where id = 'level-5';
    assert not found, 'normal kullanıcı rozeti güncelleyebildi';
  end;
end;
$$;

reset role;
reset request.jwt.claims;

-- Yönetici: pasif satırları ve gizli rozetleri de görür, yazabilir.
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

do $$
begin
  assert public.is_admin(), 'yönetici yönetici sayılmıyor';

  assert (select count(*) from public.badges) = 2,
    'yönetici gizli rozeti göremiyor';
  assert (select count(*) from public.games) = 3,
    'yönetici pasif oyunu göremiyor';
  assert (select count(*) from public.tests) = 2,
    'yönetici pasif testi göremiyor';
  assert (select count(*) from public.profile_tests) = 2,
    'yönetici pasif profil testini göremiyor';
  assert (select count(*) from public.admins) = 1,
    'yönetici yönetici listesini göremiyor';

  -- Yazma açık.
  insert into public.games (id, category, mode, title_tr, title_en, total_levels)
  values ('new-game', 'logic', 'timed', 'Yeni', 'New', 0);
  assert (select count(*) from public.games where id = 'new-game') = 1,
    'yönetici oyun ekleyemedi';

  update public.badges set star_reward = 25 where id = 'level-5';
  assert (select star_reward from public.badges where id = 'level-5') = 25,
    'yönetici rozeti güncelleyemedi';

  delete from public.games where id = 'new-game';
  assert (select count(*) from public.games where id = 'new-game') = 0,
    'yönetici oyun silemedi';
end;
$$;

reset role;
reset request.jwt.claims;

-- ---------------------------------------------------------------- push

insert into public.segments (id, title, rules)
values ('everyone', 'Tüm kullanıcılar', '[]'::jsonb);

do $$
begin
  -- Normal kullanıcı segmentleri okur (içerik gibi) ama kampanya
  -- göremez, yazamaz.
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

  assert (select count(*) from public.segments) = 1, 'normal kullanıcı segmenti göremiyor';
  assert (select count(*) from public.push_campaigns) = 0,
    'normal kullanıcı kampanyaları görüyor';

  begin
    insert into public.push_campaigns (title_tr, body_tr, title_en, body_en)
    values ('Sızma', 'Metin', 'Sneak', 'Body');
    raise exception 'normal kullanıcı kampanya yazabildi';
  exception
    when insufficient_privilege then null;
  end;

  reset role;
  reset request.jwt.claims;

  -- Yönetici taslak kaydedebilir.
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

  insert into public.push_campaigns (segment_id, title_tr, body_tr, title_en, body_en)
  values ('everyone', 'Serini koru', 'Bugün bir tur oyna.', 'Keep your streak', 'Play a round today.');

  assert (select count(*) from public.push_campaigns where status = 'draft') = 1,
    'yönetici taslak kaydedemedi';

  -- Ama "gönderildi" diyemez: bunu yalnızca gönderen servis söyler.
  begin
    update public.push_campaigns set status = 'sent';
    raise exception 'panelden gönderildi işaretlenebildi';
  exception
    when raise_exception then
      if sqlerrm not like '%gönderen servis%' then
        raise;
      end if;
  end;
end;
$$;

reset role;
reset request.jwt.claims;

-- ---------------------------------------------------------------- analitik

-- İki kullanıcı: biri huninin tamamını, diğeri yarısını yapmış.
insert into public.analytics_events (user_id, name, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'app_open', now()),
  ('11111111-1111-1111-1111-111111111111', 'onboarding_complete', now()),
  ('11111111-1111-1111-1111-111111111111', 'test_complete', now()),
  ('11111111-1111-1111-1111-111111111111', 'game_complete', now()),
  ('11111111-1111-1111-1111-111111111111', 'paywall_view', now()),
  ('11111111-1111-1111-1111-111111111111', 'purchase_complete', now()),
  ('22222222-2222-2222-2222-222222222222', 'app_open', now()),
  ('22222222-2222-2222-2222-222222222222', 'onboarding_complete', now());

do $$
declare
  overview record;
  funnel record;
begin
  -- Yönetici olmayan çağrı reddedilmeli; sayıları `security definer`
  -- bir işlevden sızdırmak, tabloyu açmakla aynı şey olurdu.
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

  begin
    perform * from public.admin_overview();
    raise exception 'normal kullanıcı analitik okuyabildi';
  exception
    when insufficient_privilege then null;
  end;

  reset role;
  reset request.jwt.claims;

  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

  select * into overview from public.admin_overview();
  assert overview.daily_active = 2, 'günlük aktif yanlış';
  assert overview.weekly_active = 2, 'haftalık aktif yanlış';
  assert overview.paywall_viewers = 1, 'paywall gören sayısı yanlış';

  -- Huni daralıyor: ikisi de açtı ve kurulumu bitirdi, yalnızca biri
  -- sonraki adımları yaptı.
  select * into funnel from public.admin_funnel() where event = 'app_open';
  assert funnel.users = 2, 'app_open adımı yanlış';

  select * into funnel from public.admin_funnel() where event = 'onboarding_complete';
  assert funnel.users = 2, 'onboarding_complete adımı yanlış';

  select * into funnel from public.admin_funnel() where event = 'test_complete';
  assert funnel.users = 1, 'test_complete adımı yanlış';

  select * into funnel from public.admin_funnel() where event = 'purchase_complete';
  assert funnel.users = 1, 'purchase_complete adımı yanlış';

  -- Bugün ilk kez görülenler hiçbir kohorta düşmüyor.
  assert (select sum(cohort) from public.admin_retention()) = 0,
    'tutundurma kohortu bugünün kullanıcılarını sayıyor';
end;
$$;

reset role;
reset request.jwt.claims;

-- ---------------------------------------------------------------- segment kitlesi

-- İki kullanıcıyı birbirinden ayıran bir durum kuruluyor: biri PRO,
-- Türkçe ve bugün aktif; diğeri ücretsiz, İngilizce ve 20 gündür yok.
-- İkisi de altın ligde (yukarıdaki lig bölümünden).
--
-- `is_pro`'yu yalnızca gönderen taraf değiştirebiliyor (profil
-- tetikleyicisi); hazırlık o yüzden service_role iddiasıyla yapılıyor.
set request.jwt.claims = '{"role":"service_role"}';

update public.profiles
set is_pro = true, locale = 'tr'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles
set is_pro = false, locale = 'en'
where id = '22222222-2222-2222-2222-222222222222';

insert into public.streaks (user_id, current_days, longest_days, last_active_date)
values
  ('11111111-1111-1111-1111-111111111111', 10, 10, now()::date),
  ('22222222-2222-2222-2222-222222222222', 0, 3, now()::date - 20)
on conflict (user_id) do update
set current_days = excluded.current_days,
    longest_days = excluded.longest_days,
    last_active_date = excluded.last_active_date;

-- Birinci kullanıcının iki cihazı var, ikincisi bildirimi kapatmış.
insert into public.push_tokens (user_id, token, platform, locale, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'ExponentPushToken[telefon]', 'ios', 'tr', true),
  ('11111111-1111-1111-1111-111111111111', 'ExponentPushToken[tablet]', 'android', 'tr', true),
  ('22222222-2222-2222-2222-222222222222', 'ExponentPushToken[kapali]', 'ios', 'en', false);

reset request.jwt.claims;

insert into public.segments (id, title, match_mode, rules)
values
  ('pro', 'PRO üyeler', 'all', '[{"kind":"is_pro","value":true}]'::jsonb),
  ('sleeping', 'Uykuya dalanlar', 'all', '[{"kind":"inactive_days","value":7}]'::jsonb),
  ('tr-or-gold', 'Türkçe ya da altın', 'any',
    '[{"kind":"locale","value":"tr"},{"kind":"league_tier_at_least","tier":"gold"}]'::jsonb),
  ('gold-pro', 'Altın ve PRO', 'all',
    '[{"kind":"league_tier_at_least","tier":"gold"},{"kind":"is_pro","value":true}]'::jsonb),
  -- Pasif: kuralı veritabanının tanımadığı bir tür. Etkin olsaydı
  -- sayaçların tamamını düşürürdü; burada yalnızca değerlendiricinin
  -- sessiz kalmadığını göstermek için duruyor.
  ('bogus', 'Bilinmeyen kural', 'all', '[{"kind":"astrolojik_burc","value":"koc"}]'::jsonb);

update public.segments set is_active = false where id = 'bogus';

do $$
declare
  row record;
begin
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

  -- Kuralsız segment herkesi kapsıyor; erişilebilir olan yalnızca
  -- etkin jetonu olan kullanıcı. İki sayının ayrı durmasının sebebi
  -- bu: kitle iki kişi, bildirim bir kişiye gidebilir.
  select * into row from public.admin_segment_sizes() where segment_id = 'everyone';
  assert row.audience = 2, 'kuralsız segment herkesi kapsamıyor';
  assert row.reachable = 1, 'erişilebilir sayısı jetona bakmıyor';

  select * into row from public.admin_segment_sizes() where segment_id = 'pro';
  assert row.audience = 1 and row.reachable = 1, 'PRO segmenti yanlış';

  -- 20 gündür girmeyen kullanıcı kitlede ama bildirimi kapalı.
  select * into row from public.admin_segment_sizes() where segment_id = 'sleeping';
  assert row.audience = 1, 'uykuya dalanlar yanlış sayıldı';
  assert row.reachable = 0, 'bildirimi kapalı kullanıcı erişilebilir görünüyor';

  -- 'any': biri Türkçe olduğu için, diğeri altın ligde olduğu için.
  select * into row from public.admin_segment_sizes() where segment_id = 'tr-or-gold';
  assert row.audience = 2, 'any kipinde birleşim alınmıyor';

  -- 'all': ikisi de altın ligde ama yalnızca biri PRO.
  select * into row from public.admin_segment_sizes() where segment_id = 'gold-pro';
  assert row.audience = 1, 'all kipinde kesişim alınmıyor';

  -- Pasif segment sayaçlarda hiç görünmüyor; bilinmeyen kuralı
  -- değerlendirmeye kalksaydı zaten hata verirdi.
  assert not exists (select 1 from public.admin_segment_sizes() where segment_id = 'bogus'),
    'pasif segment sayaçlarda';

  -- Kitle: aynı kullanıcının iki cihazı iki satır.
  assert (select count(*) from public.segment_audience('pro')) = 2,
    'kullanıcının ikinci cihazı kitleye girmiyor';
  assert (select count(*) from public.segment_audience('sleeping')) = 0,
    'pasif jeton kitleye giriyor';
end;
$$;

reset role;
reset request.jwt.claims;

do $$
begin
  -- Normal kullanıcı ne sayıyı ne de jetonları görebilir.
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

  begin
    perform public.admin_segment_sizes();
    raise exception 'normal kullanıcı kitle sayılarını okuyabildi';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform public.segment_audience('everyone');
    raise exception 'normal kullanıcı jetonları okuyabildi';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
reset request.jwt.claims;

do $$
begin
  -- Gönderen servis kendi oturumuyla okuyabilmeli: kitleyi o çözüyor.
  set local role service_role;
  assert (select count(*) from public.segment_audience('everyone')) = 2,
    'gönderen servis kitleyi okuyamıyor';
end;
$$;

reset role;

do $$
begin
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

  -- Olmayan ya da pasif segment sessizce boş kitle dönmüyor: boş
  -- kitle ile yanlış kimlik ayırt edilemezdi.
  begin
    perform public.segment_audience('bogus');
    raise exception 'pasif segment için kitle döndü';
  exception
    when raise_exception then
      if sqlerrm not like '%etkin segment yok%' then raise; end if;
  end;

  -- Tanınmayan kural türü hata veriyor; sessizce false dönseydi
  -- kitle fark edilmeden daralırdı.
  begin
    perform public.segment_rule_matches(
      '{"kind":"astrolojik_burc","value":"koc"}'::jsonb,
      '{"level":5}'::jsonb
    );
    raise exception 'bilinmeyen kural sessizce geçti';
  exception
    when raise_exception then
      if sqlerrm not like '%bilinmeyen segment kuralı%' then raise; end if;
  end;
end;
$$;

reset role;
reset request.jwt.claims;

reset role;
reset request.jwt.claims;

rollback;

\echo 'Tüm şema ve RLS testleri geçti.'
