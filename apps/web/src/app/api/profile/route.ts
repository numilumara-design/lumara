import { getSessionUser } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { db } from '@lumara/database'
import { z } from 'zod'

const profileSchema = z.object({
  fullName:  z.string().max(200).optional().nullable(),
  gender:    z.string().max(50).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  birthTime: z.string().optional().nullable(),
  birthPlace: z.string().max(200).optional().nullable(),
  goal:      z.string().max(500).optional().nullable(),
})

export async function GET() {
  const session = await getSessionUser()
  console.log('[profile GET] session:', session)
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await db.profile.findUnique({ where: { userId: session.id } })
  console.log('[profile GET] profile:', profile)
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const session = await getSessionUser()
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = profileSchema.parse(body)

  // Нормалізуємо порожні рядки в null — користувачі можуть очищати поля
  const fullName = data.fullName?.trim() || null
  const gender = data.gender?.trim() || null
  const birthDate = data.birthDate?.trim() ? new Date(data.birthDate.trim()) : null
  const birthTime = data.birthTime?.trim() || null
  const birthPlace = data.birthPlace?.trim() || null
  const goal = data.goal?.trim() || null

  const profile = await db.profile.upsert({
    where: { userId: session.id },
    update: {
      fullName,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      goal,
    },
    create: {
      userId: session.id,
      fullName,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      goal,
      language: 'uk',
      timezone: 'Europe/Kiev',
    },
  })

  return NextResponse.json(profile)
}
