#!/usr/bin/env bash
# Gömülü içerik bankasını veritabanına yazar.
#
#   scripts/seed-content.sh                 → DATABASE_URL'e uygular
#   scripts/seed-content.sh --sql           → SQL'i yazdırır, uygulamaz
#   scripts/seed-content.sh --temp-db       → geçici bir Postgres'e uygular (deneme)
#
# Barındırılan bir Supabase'e uygulamak için proje ayarlarındaki
# bağlantı dizesini verin:
#
#   DATABASE_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
#     scripts/seed-content.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TSX="$ROOT/node_modules/.bin/tsx"

if [[ "${1:-}" == "--temp-db" ]]; then
  shift
  exec "$ROOT/scripts/with-temp-db.sh" "$TSX" "$ROOT/scripts/seed-content.ts" "$@"
fi

exec "$TSX" "$ROOT/scripts/seed-content.ts" "$@"
