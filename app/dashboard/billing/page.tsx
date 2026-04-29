import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { redirectToCustomerPortal } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database.types'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: Subscription | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment</p>
      </div>

      {!subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Subscribe to access all features</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/pricing">
              <Button>View Plans</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="capitalize">{subscription.plan} Plan</CardTitle>
                  <CardDescription>Your current subscription</CardDescription>
                </div>
                <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.current_period_end && (
                <div>
                  <p className="text-sm text-muted-foreground">Current period ends</p>
                  <p className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Your subscription will cancel at the end of the current period
                  </p>
                </div>
              )}

              {subscription.charity_contribution_percentage && (
                <div>
                  <p className="text-sm text-muted-foreground">Charity contribution</p>
                  <p className="font-medium">{subscription.charity_contribution_percentage}%</p>
                </div>
              )}

              <form action={redirectToCustomerPortal}>
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                  Manage Subscription
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Update payment method, change plan, or cancel through Stripe&apos;s secure portal
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
