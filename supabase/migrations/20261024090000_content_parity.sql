-- Şemayı bugünkü içeriğe denkleştirir.
--
-- Çekirdek şema yazıldığından beri içerik büyüdü ve bir yeri de
-- baştan yanlış varsayılmıştı. İçeriği veritabanına yazmaya kalkınca
-- ikisi de ortaya çıktı:
--
-- 1. Oyunlar yönerge ve yetenek listesi taşıyor, testlerin bir alanı
--    var, görsel sorular şekil şeması taşıyor, rozetlerin koşulu veri
--    olarak tutuluyor. Hiçbirinin tabloda yeri yoktu; yazarken
--    sessizce düşerlerdi.
--
-- 2. `questions.test_id` bir soruyu tek teste bağlıyordu. Oysa soru
--    havuzu paylaşımlı: 182 sorunun 87'si birden fazla testte geçiyor
--    (Temel IQ'nun soruları İleri IQ'da da var). Aynı soruyu her test
--    için kopyalamak, bir soruyu düzeltince öbür kopyayı unutmak
--    demekti; ilişki araya bir tabloya taşındı.
--
-- Kural şekilleri @neuropeak/core'daki tiplerle aynı ve orada
-- yorumlanıyor. Veritabanı kuralı değerlendirmiyor, taşıyor —
-- `segments.rules` ile aynı yaklaşım.

-- ---------------------------------------------------------------- oyunlar

alter table public.games
  -- Oyun ekranının üstündeki tek cümlelik yönerge.
  add column instruction_tr text not null default '',
  add column instruction_en text not null default '',
  -- Brifingde listelenen yetenekler: [{ "tr": "...", "en": "..." }, ...]
  add column skills jsonb not null default '[]'::jsonb;

alter table public.games
  add constraint games_skills_is_array check (jsonb_typeof(skills) = 'array');

-- ---------------------------------------------------------------- testler

-- Tek bir alanı ölçen testler için o alan; genel testlerde boş.
-- Soru türü dağılımı denetlenirken ikisi farklı değerlendiriliyor.
create type public.report_dimension as enum ('verbal', 'numeric', 'visual', 'logical');

alter table public.tests add column focus public.report_dimension;

-- ---------------------------------------------------------------- sorular

alter table public.questions
  -- İçerikteki kalıcı kimlik ('bi-ns-3'). Birincil anahtar uuid
  -- kalıyor; bu sütun aynı soruyu yeniden yazarken eşleştiriyor ve
  -- panelde sorunun hangi içerik satırı olduğunu gösteriyor.
  add column slug text,
  -- Görsel sorularda çizilecek şekil şeması; metin sorularda boş.
  add column visual jsonb;

-- Soru artık bir teste ait değil, havuzda duruyor. Okuma ilkesi
-- `test_id` üzerinden kurulmuştu; sütunu düşürmeden önce o kalkıyor,
-- yerine yenisi aşağıda geliyor.
drop policy if exists questions_read_active on public.questions;
drop index if exists public.questions_test_idx;
alter table public.questions drop column test_id;

create unique index questions_slug_key on public.questions (slug);

-- Hangi soru hangi teste giriyor. Bir soru birden çok testte olabilir;
-- `sort_order` testin içindeki sırayı tutuyor.
create table public.test_questions (
  test_id text not null references public.tests (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (test_id, question_id)
);

create index test_questions_test_idx on public.test_questions (test_id, sort_order);
create index test_questions_question_idx on public.test_questions (question_id);

alter table public.test_questions enable row level security;

-- Soru, yayındaki bir teste giriyorsa okunur; pasif testin soruları
-- sızmaz.
create policy questions_read_active on public.questions
for select to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.test_questions tq
    join public.tests t on t.id = tq.test_id
    where tq.question_id = questions.id and t.is_active
  )
);

create policy test_questions_read_active on public.test_questions
for select to anon, authenticated
using (
  exists (
    select 1 from public.tests t where t.id = test_questions.test_id and t.is_active
  )
);

-- ---------------------------------------------------------------- rozetler

-- Rozetin ne zaman kazanıldığı: { "kind": "level", "value": 5 } gibi.
-- Motor @neuropeak/core'da; buradaki jsonb onun anladığı veri.
alter table public.badges
  add column requirement jsonb not null default '{}'::jsonb;

alter table public.badges
  add constraint badges_requirement_has_kind check (requirement ? 'kind');

-- Varsayılan yalnızca mevcut satırları taşımak için vardı; yeni rozet
-- koşulsuz eklenmesin.
alter table public.badges alter column requirement drop default;
