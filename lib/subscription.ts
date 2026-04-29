import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | 'none'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  priceId: string | null
  hasAccess: boolean
  daysUntilExpiration: number | null
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return {
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      priceId: null,
      hasAccess: false,
      daysUntilExpiration: null,
    }
  }

  const sub = subscription as any
  const now = new Date()
  const periodEnd = new Date(sub.current_period_end)
  const daysUntilExpiration = Math.ceil(
    (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Determine effective access
  const isActive = ['active', 'trialing'].includes(sub.status)
  const hasGracePeriod = sub.cancel_at_period_end && daysUntilExpiration > 0
  const hasAccess = isActive || hasGracePeriod

  return {
    status: sub.status as SubscriptionStatus,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    priceId: sub.stripe_price_id,
    hasAccess,
    daysUntilExpiration: daysUntilExpiration > 0 ? daysUntilExpiration : 0,
  }
}

export async function requireActiveSubscription(userId: string): Promise<boolean> {
  const info = await getSubscriptionStatus(userId)
  return info.hasAccess
}
