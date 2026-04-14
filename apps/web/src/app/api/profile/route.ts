import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = profileSchema.parse(body)

  const profile = await db.profile.upsert({
    where: { userId: session.user.id },
    update: {
      fullName:  data.fullName ?? null,
      gender:    data.gender ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthTime: data.birthTime ?? null,
      birthPlace: data.birthPlace ?? null,
      goal:      data.goal ?? null,
    },
    create: {
      userId:    session.user.id,
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
