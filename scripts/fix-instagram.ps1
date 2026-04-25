# ============================================================
# Готові curl-запити для налаштування Instagram моніторингу
# Запуск: powershell -ExecutionPolicy Bypass -File scripts/fix-instagram.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    $envFile = "apps/web/.env.local"
}

# Читаємо змінні з .env.local
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^(IG_ACCESS_TOKEN|IG_APP_SECRET)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$token = $env:IG_ACCESS_TOKEN
$secret = $env:IG_APP_SECRET

if (-not $token) {
    Write-Host "❌ IG_ACCESS_TOKEN не знайдено в .env.local" -ForegroundColor Red
    Write-Host "   Додай рядок: IG_ACCESS_TOKEN=твій_токен"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔍 1. ДІАГНОСТИКА ТОКЕНА" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Invoke-RestMethod -Uri "https://graph.facebook.com/v19.0/debug_token?input_token=$token&access_token=$token" | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📄 2. СПИСОК FACEBOOK PAGES ТА INSTAGRAM BUSINESS ACCOUNTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Invoke-RestMethod -Uri "https://graph.facebook.com/v19.0/me/accounts?fields=name,id,instagram_business_account{id,username}&access_token=$token" | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔄 3. ОБМІН НА LONG-LIVED TOKEN (60 днів)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not $secret) {
    Write-Host "⚠️ IG_APP_SECRET не знайдено в .env.local" -ForegroundColor Yellow
    Write-Host "   Для обміну на Long-Lived Token потрібен IG_APP_SECRET"
    Write-Host "   Йди в Facebook Developers → LUMARA Media Publisher → Settings → Basic → App Secret"
} else {
    Invoke-RestMethod -Uri "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=1999886223962354&client_secret=$secret&fb_exchange_token=$token" | ConvertTo-Json -Depth 10
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "✅ ГОТОВО" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Скопіюй отримані IG User ID у GitHub Secrets:"
Write-Host "  LUNA_IG_USER_ID="
Write-Host "  ARCAS_IG_USER_ID="
Write-Host "  NUMI_IG_USER_ID="
Write-Host "  UMBRA_IG_USER_ID="
Write-Host ""
Write-Host "І онови IG_ACCESS_TOKEN якщо отримав новий Long-Lived Token"
