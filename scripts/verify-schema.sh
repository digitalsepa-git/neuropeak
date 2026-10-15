#!/usr/bin/env bash
# Migration'ları geçici bir Postgres'e uygulayıp şema kısıtlarını ve
# RLS politikalarını test eder.
#
#   scripts/verify-schema.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

exec "$ROOT/scripts/with-temp-db.sh" \
  bash -c 'echo "→ Şema ve RLS testleri" >&2; psql -v ON_ERROR_STOP=1 -q -f "$0"' \
  "$ROOT/supabase/tests/01_rls_assertions.sql"
