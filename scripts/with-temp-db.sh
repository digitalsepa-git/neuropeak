#!/usr/bin/env bash
# Geçici bir Postgres kurar, Supabase ortamını ve migration'ları uygular,
# sonra verilen komutu çalıştırır. İş bitince kümeyi siler.
#
#   scripts/with-temp-db.sh <komut> [argümanlar...]
#
# Komuta ortam değişkeni olarak DATABASE_URL ve PGDATABASE geçirilir.
# CI'da PGHOST tanımlıysa hazır sunucu kullanılır.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_NAME="neuropeak_tmp"

if [[ $# -eq 0 ]]; then
  echo "Kullanım: scripts/with-temp-db.sh <komut> [argümanlar...]" >&2
  exit 64
fi

if [[ -n "${PGHOST:-}" ]]; then
  dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || true
  createdb "$DB_NAME"
  trap 'dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || true' EXIT
  DATABASE_URL="postgresql://${PGUSER:-postgres}:${PGPASSWORD:-postgres}@${PGHOST}:${PGPORT:-5432}/${DB_NAME}"
else
  PG_BIN="$(ls -d /opt/homebrew/opt/postgresql@*/bin 2>/dev/null | sort -V | tail -1 || true)"
  if [[ -z "$PG_BIN" ]]; then
    echo "PostgreSQL bulunamadı. Kurmak için: brew install postgresql@17" >&2
    exit 1
  fi
  export PATH="$PG_BIN:$PATH"

  PGDATA_DIR="$(mktemp -d)/pgdata"
  # Unix soketi yolu 103 baytı aşamaz; bu yüzden kısa bir dizin seçilir.
  SOCKET_DIR="$(mktemp -d /tmp/neuropeak-pg.XXXXXX)"
  export PGHOST="$SOCKET_DIR"
  export PGPORT=5433
  export PGUSER=postgres

  cleanup() {
    pg_ctl -D "$PGDATA_DIR" stop -m immediate >/dev/null 2>&1 || true
    rm -rf "$PGDATA_DIR" "$SOCKET_DIR"
  }
  trap cleanup EXIT

  # macOS'ta locale ayarlanmadan başlatılan postmaster çok iş parçacıklı
  # hale gelip hemen kapanıyor.
  export LC_ALL=C LANG=C

  initdb -D "$PGDATA_DIR" -U postgres --auth=trust --locale=C --encoding=UTF8 >/dev/null
  if ! pg_ctl -D "$PGDATA_DIR" -l "$PGDATA_DIR/server.log" \
    -o "-k $SOCKET_DIR -p $PGPORT -c listen_addresses='127.0.0.1'" -w start >/dev/null; then
    echo "Postgres başlatılamadı:" >&2
    tail -20 "$PGDATA_DIR/server.log" >&2
    exit 1
  fi

  createdb "$DB_NAME"
  DATABASE_URL="postgresql://postgres@127.0.0.1:${PGPORT}/${DB_NAME}"
fi

export PGDATABASE="$DB_NAME"
export DATABASE_URL

echo "→ Supabase ortamı hazırlanıyor" >&2
psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$ROOT/supabase/tests/00_local_bootstrap.sql" >/dev/null

echo "→ Migration'lar uygulanıyor" >&2
for migration in "$ROOT"/supabase/migrations/*.sql; do
  echo "   $(basename "$migration")" >&2
  psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$migration" >/dev/null
done

"$@"
