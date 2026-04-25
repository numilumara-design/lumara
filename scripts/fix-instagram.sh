#!/bin/bash
# ============================================================
# Готові curl-запити для налаштування Instagram моніторингу
# Запуск: bash scripts/fix-instagram.sh
# ============================================================

set -e

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="apps/web/.env.local"
fi

# Читаємо змінні з .env.local
if [ -f "$ENV_FILE" ]; then
  export $(grep -E '^(IG_ACCESS_TOKEN|IG_APP_SECRET)=' "$ENV_FILE" | xargs)
fi

if [ -z "$IG_ACCESS_TOKEN" ]; then
  echo "❌ IG_ACCESS_TOKEN не знайдено в .env.local"
  echo "   Додай рядок: IG_ACCESS_TOKEN=твій_токен"
  exit 1
fi

echo "============================================================"
echo "🔍 1. ДІАГНОСТИКА ТОКЕНА"
echo "============================================================"
curl -s "https://graph.facebook.com/v19.0/debug_token?input_token=$IG_ACCESS_TOKEN&access_token=$IG_ACCESS_TOKEN" | python3 -m json.tool

echo ""
echo "============================================================"
echo "📄 2. СПИСОК FACEBOOK PAGES ТА INSTAGRAM BUSINESS ACCOUNTS"
echo "============================================================"
curl -s "https://graph.facebook.com/v19.0/me/accounts?fields=name,id,instagram_business_account{id,username}&access_token=$IG_ACCESS_TOKEN" | python3 -m json.tool

echo ""
echo "============================================================"
echo "🔄 3. ОБМІН НА LONG-LIVED TOKEN (60 днів)"
echo "============================================================"

if [ -z "$IG_APP_SECRET" ]; then
  echo "⚠️ IG_APP_SECRET не знайдено в .env.local"
  echo "   Для обміну на Long-Lived Token потрібен IG_APP_SECRET"
  echo "   Йди в Facebook Developers → LUMARA Media Publisher → Settings → Basic → App Secret"
  echo ""
  echo "   Або виконай вручну:"
  echo "   curl -s \"https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=1999886223962354&client_secret=ТВІЙ_APP_SECRET&fb_exchange_token=$IG_ACCESS_TOKEN\""
else
  curl -s "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=1999886223962354&client_secret=$IG_APP_SECRET&fb_exchange_token=$IG_ACCESS_TOKEN" | python3 -m json.tool
fi

echo ""
echo "============================================================"
echo "✅ ГОТОВО"
echo "============================================================"
echo "Скопіюй отримані IG User ID у GitHub Secrets:"
echo "  LUNA_IG_USER_ID="
echo "  ARCAS_IG_USER_ID="
echo "  NUMI_IG_USER_ID="
echo "  UMBRA_IG_USER_ID="
echo ""
echo "І онови IG_ACCESS_TOKEN якщо отримав новий Long-Lived Token"
