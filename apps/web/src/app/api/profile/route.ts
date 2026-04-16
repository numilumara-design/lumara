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
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await db.profile.findUnique({ where: { userId: session.id } })
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const session = await getSessionUser()
  if (!session?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = profileSchema.parse(body)

  const profile = await db.profile.upsert({
    where: { userId: session.id },
    update: {
      fullName:  data.fullName ?? null,
      gender:    data.gender ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthTime: data.birthTime ?? null,
      birthPlace: data.birthPlace ?? null,
      goal:      data.goal ?? null,
    },
    create: {
      userId:    session.id,
      fullName:  data.fullName ?? null,
      gender:    data.gender ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthTime: data.birthTime ?? null,
      birthPlace: data.birthPlace ?? null,
      goal:      data.goal ?? null,
      language: 'uk',
      timezone: 'Europe/Kiev',
    },
  })

  return NextResponse.json(profile)
}
