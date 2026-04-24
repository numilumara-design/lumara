const fs = require('fs')
const readline = require('readline')

const projectRef = 'hvpesmplwfkobnbsswpb'

const files = [
  'apps/web/.env.local',
  'packages/database/.env',
]

function updateFile(file, password) {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Файл не знайдено: ${file}`)
    return
  }

  let content = fs.readFileSync(file, 'utf8')
  let updated = false

  // Замінюємо пароль у DATABASE_URL: postgres.REF:OLD_PASS@host → postgres.REF:NEW_PASS@host
  // або postgres:OLD_PASS@host → postgres:NEW_PASS@host
  const dbUrlRegex = /^(DATABASE_URL=.*postgres\.?[^:@]*:)[^@]+(@.*)$/m
  if (dbUrlRegex.test(content)) {
    content = content.replace(dbUrlRegex, `$1${password}$2`)
    updated = true
  }

  const directUrlRegex = /^(DIRECT_URL=.*postgres\.?[^:@]*:)[^@]+(@.*)$/m
  if (directUrlRegex.test(content)) {
    content = content.replace(directUrlRegex, `$1${password}$2`)
    updated = true
  }

  if (updated) {
    fs.writeFileSync(file, content, 'utf8')
    console.log(`✅ Оновлено: ${file}`)
  } else {
    console.log(`⚠️  DATABASE_URL/DIRECT_URL не знайдено в: ${file}`)
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('--- Оновлення паролю PostgreSQL (Supabase) ---\n')
console.log('Цей скрипт замінить пароль у DATABASE_URL та DIRECT_URL,')
console.log('не чіпаючи хости та інші налаштування.\n')

rl.question('Новий пароль PostgreSQL: ', (password) => {
  if (!password.trim()) {
    console.error('❌ Пароль не може бути порожнім')
    rl.close()
    return
  }

  files.forEach((f) => updateFile(f, password.trim()))

  console.log('\n✅ Готово! Тепер запусти:')
  console.log('   pnpm db:push')
  console.log('\n--- Не забудь оновити змінні на Vercel і GitHub! ---')

  rl.close()
})
