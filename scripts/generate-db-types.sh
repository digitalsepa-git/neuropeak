#!/usr/bin/env bash
# Migration'lardan TypeScript tiplerini üretip mobil uygulamaya yazar.
#
#   scripts/generate-db-types.sh            → dosyayı yazar
#   scripts/generate-db-types.sh --check    → güncel mi diye bakar (CI)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/apps/mobile/src/lib/database.types.ts"
MODE="${1:-write}"

TMP="$(mktemp -t neuropeak-types)"
trap 'rm -f "$TMP"' EXIT

"$ROOT/scripts/with-temp-db.sh" node "$ROOT/scripts/generate-db-types.mjs" "$TMP"

if [[ "$MODE" == "--check" ]]; then
  if ! diff -q "$TMP" "$OUT" >/dev/null 2>&1; then
    echo "database.types.ts güncel değil. scripts/generate-db-types.sh çalıştırıp sonucu commit edin." >&2
    diff -u "$OUT" "$TMP" | head -40 >&2 || true
    exit 1
  fi
  echo "database.types.ts güncel." >&2
else
  cp "$TMP" "$OUT"
  echo "Yazıldı: $OUT" >&2
fi
