export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@lumara/database'

// Перенаправляє на Stripe Customer Portal для управління підпискою
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const subscription = await db.subscription.findFirst({
      where: { userId: session.user.id },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.redirect(new URL('/pricing', req.url))
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/profile`,
    })

    return NextResponse.redirect(portalSession.url)
  } catch (error) {
    console.error('[stripe/portal]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
