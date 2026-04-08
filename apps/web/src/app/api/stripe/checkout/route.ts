export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import { db } from '@lumara/database'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const plan = req.nextUrl.searchParams.get('plan') as PlanKey | null
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Невірний план' }, { status: 400 })
    }

    const planConfig = PLANS[plan]
    const userId = session.user.id
    const email = session.user.email!

    // Знаходимо або створюємо Stripe Customer
    let subscription = await db.subscription.findFirst({ where: { userId } })
    let stripeCustomerId = subscription?.stripeCustomerId ?? null

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } })
      stripeCustomerId = customer.id
    }

    // Створюємо Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId, plan },
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: { userId, plan },
    })

    return NextResponse.redirect(checkoutSession.url!)
  } catch (error) {
    console.error('[stripe/checkout]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
