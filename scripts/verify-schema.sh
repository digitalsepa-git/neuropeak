#!/usr/bin/env bash
# Migration'ları geçici bir Postgres'e uygulayıp şema kısıtlarını ve
# RLS politikalarını test eder, sonra gömülü içeriği şemaya yazar.
#
# Seed'in burada çalışması bir denetim: içerik şemaya sığmıyorsa —
# yeni bir alan eklenip sütunu açılmadıysa, ya da içerik şemanın
# varsaydığı bir şeyi çiğniyorsa — CI'da görünür. Paylaşımlı soru
# havuzu tam bu şekilde ortaya çıktı.
#
#   scripts/verify-schema.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

exec "$ROOT/scripts/with-temp-db.sh" "$ROOT/scripts/verify-schema-inner.sh"
