import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/client'

const envPath = path.resolve(process.cwd(), 'apps/web/.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local не знайдено в apps/web')
  process.exit(1)
}

const content = fs.readFileSync(envPath, 'utf8')
content.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
})

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

async function checkSupabase(url: string, key: string, label: string) {
  try {
    const res = await fetch(`${url}/rest/v1/users?select=*&limit=0`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (res.ok) {
      console.log(`✅ ${label} працює (HTTP ${res.status})`)
    } else {
      const text = await res.text().catch(() => '')
      console.error(`❌ ${label} відхилено (HTTP ${res.status}): ${text.slice(0, 200)}`)
    }
  } catch (e: any) {
    console.error(`❌ ${label} помилка з'єднання: ${e.message}`)
  }
}

async function main() {
  const missing = required.filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error('❌ Відсутні змінні середовища в apps/web/.env.local:', missing.join(', '))
    process.exit(1)
  }
  console.log('✅ Усі необхідні Supabase-змінні присутні в apps/web/.env.local')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  await checkSupabase(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 'Supabase ANON Key')
  await checkSupabase(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, 'Supabase SERVICE ROLE Key')

  try {
    await db.$queryRaw`SELECT 1`
    console.log('✅ Prisma / PostgreSQL (DATABASE_URL) працює')
  } catch (e: any) {
    console.error('❌ Prisma / PostgreSQL помилка:', e.message)
  } finally {
    await db.$disconnect()
  }
}

main()
