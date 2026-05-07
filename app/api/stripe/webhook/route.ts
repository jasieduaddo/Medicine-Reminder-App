import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

async function setPremium(userId: string, subscriptionId: string, expiresAt: Date | null) {
  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: expiresAt ? new Date() < expiresAt : false,
      stripe_subscription_id: subscriptionId,
      premium_expires_at: expiresAt?.toISOString() ?? null,
    })
    .eq('id', userId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    console.error('[Webhook] signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        const expiresAt = new Date(subscription.current_period_end * 1000)
        await supabaseAdmin
          .from('profiles')
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            premium_expires_at: expiresAt.toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        const expiresAt = new Date(sub.current_period_end * 1000)
        const active = sub.status === 'active' || sub.status === 'trialing'
        await supabaseAdmin
          .from('profiles')
          .update({
            is_premium: active,
            stripe_subscription_id: sub.id,
            premium_expires_at: expiresAt.toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({
            is_premium: false,
            stripe_subscription_id: null,
            premium_expires_at: null,
          })
          .eq('id', userId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', userId)
        break
      }
    }
  } catch (err: unknown) {
    console.error('[Webhook] handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
