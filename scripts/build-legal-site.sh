#!/usr/bin/env bash
# `legal/` belgelerinden `docs/` altındaki statik siteyi üretir.
#
#   scripts/build-legal-site.sh            → dosyaları yazar
#   scripts/build-legal-site.sh --check    → güncel mi diye bakar (CI)
#
# Çıktı depoya commit ediliyor: GitHub Pages `main` dalının `docs/`
# klasörünü sunuyor, yani üretilen dosyalar orada durmak zorunda.
# `--check` de belge değişip site güncellenmeden kalmasını engelliyor.
#
# `docs/` altında başka şeyler de var (`screenshots/`). Bu yüzden
# klasörün tamamı silinmiyor; yalnızca aşağıda sayılan yollar
# yönetiliyor. Yeni bir çıktı eklenirse MANAGED listesine de eklensin.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/docs"
MODE="${1:-write}"

MANAGED=(index.html .nojekyll privacy terms en)

WORK_DIR="$(mktemp -d)"
TMP="$WORK_DIR/docs"
trap 'rm -rf "$WORK_DIR"' EXIT

node "$ROOT/scripts/build-legal-site.mjs" "$TMP"

# Üretilen HTML de deponun geri kalanıyla aynı biçimde durur, böylece
# biçim kontrolü ile site üretimi birbirine düşmez.
"$ROOT/node_modules/.bin/prettier" --config "$ROOT/.prettierrc.json" \
  --log-level warn --write "$TMP/**/*.html" >/dev/null

if [[ "$MODE" == "--check" ]]; then
  for item in "${MANAGED[@]}"; do
    if ! diff -rq "$TMP/$item" "$OUT/$item" >/dev/null 2>&1; then
      echo "docs/$item güncel değil. scripts/build-legal-site.sh çalıştırıp sonucu commit edin." >&2
      diff -ru "$OUT/$item" "$TMP/$item" 2>&1 | head -40 >&2 || true
      exit 1
    fi
  done
  echo "docs/ güncel." >&2
else
  mkdir -p "$OUT"
  for item in "${MANAGED[@]}"; do
    rm -rf "${OUT:?}/$item"
    cp -R "$TMP/$item" "$OUT/$item"
  done
  echo "Yazıldı: $OUT" >&2
fi
