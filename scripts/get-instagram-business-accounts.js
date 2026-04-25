/**
 * Тимчасовий скрипт для отримання instagram_business_account.id
 * для всіх Facebook Pages, пов'язаних з акаунтом.
 *
 * Вимоги:
 * - IG_ACCESS_TOKEN у .env.local (Facebook User Access Token з дозволами:
 *   pages_show_list, instagram_basic, instagram_content_publish)
 *
 * Запуск: node scripts/get-instagram-business-accounts.js
 */

const fs = require('fs')
const path = require('path')

// Завантажуємо .env.local вручну (без зайвих залежностей)
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]
    }
  }
}

loadEnv(path.resolve(__dirname, '../apps/web/.env.local'))
loadEnv(path.resolve(__dirname, '../.env.local'))

const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ IG_ACCESS_TOKEN не знайдено у .env.local')
  console.error('   Додай: IG_ACCESS_TOKEN=твій-facebook-user-access-token')
  process.exit(1)
}

const GRAPH_API_VERSION = 'v22.0'
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

async function fetchJson(url) {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Graph API error: ${data.error?.message || JSON.stringify(data)}`)
  }
  return data
}

async function main() {
  console.log('🔍 Отримуємо список Pages та Instagram Business Accounts...\n')

  try {
    // Отримуємо всі сторінки користувача з прив'язаними Instagram акаунтами
    const pages = await fetchJson(
      `${BASE_URL}/me/accounts?fields=name,instagram_business_account{username,id}&access_token=${ACCESS_TOKEN}`
    )

    if (!pages.data || pages.data.length === 0) {
      console.log('⚠️  Немає доступних Pages. Переконайся, що токен має дозвіл pages_show_list.')
      return
    }

    console.log(`Знайдено ${pages.data.length} сторінок:\n`)
    console.log('=' .repeat(70))

    for (const page of pages.data) {
      const pageName = page.name
      const pageId = page.id
      const igAccount = page.instagram_business_account

      console.log(`\n📄 Facebook Page: ${pageName}`)
      console.log(`   Page ID:       ${pageId}`)

      if (igAccount) {
        console.log(`   IG Username:   @${igAccount.username}`)
        console.log(`   IG User ID:    ${igAccount.id}`)
        console.log(`   ➡️  Змінна:     LUNA_IG_USER_ID=${igAccount.id}  (чи інша, залежно від агента)`)
      } else {
        console.log(`   ⚠️  Instagram Business Account НЕ підключено до цієї сторінки`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('\n✅ Скопіюй потрібні ID у .env.local:')
    console.log('   LUNA_IG_USER_ID=...')
    console.log('   ARCAS_IG_USER_ID=...')
    console.log('   NUMI_IG_USER_ID=...')
    console.log('   UMBRA_IG_USER_ID=...')
  } catch (err) {
    console.error('\n❌ Помилка:', err.message)
    if (err.message.includes('Session has expired')) {
      console.error('\n💡 Токен протух. Отримай новий у Facebook Graph API Explorer:')
      console.error('   https://developers.facebook.com/tools/explorer/')
    }
    process.exit(1)
  }
}

main()
