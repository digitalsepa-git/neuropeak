#!/usr/bin/env bash
# verify-schema.sh'in geçici veritabanı içinde çalışan bölümü.
# DATABASE_URL ve psql ortamı with-temp-db.sh tarafından hazırlanır.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ Şema ve RLS testleri" >&2
psql -v ON_ERROR_STOP=1 -q -f "$ROOT/supabase/tests/01_rls_assertions.sql"

# RLS testleri kendi satırlarını bırakıyor; seed temiz bir şemaya
# yazsın diye içerik tabloları boşaltılıyor.
psql -v ON_ERROR_STOP=1 -q -c "truncate table
  public.test_questions, public.questions, public.tests,
  public.games, public.badges, public.daily_task_templates,
  public.measure_steps, public.measure_tests,
  public.profile_traits, public.profile_questions,
  public.profile_outcomes, public.profile_tests cascade;"

echo "→ İçerik seed'i" >&2
"$ROOT/node_modules/.bin/tsx" "$ROOT/scripts/seed-content.ts"

# İkinci kez: seed'in yeniden çalıştırılabilir olduğunu gösterir.
"$ROOT/node_modules/.bin/tsx" "$ROOT/scripts/seed-content.ts" >/dev/null
