import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCreditData } from '@/app/actions/credits'
import { CreditDashboard } from '@/components/credits/credit-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Gift, TrendingUp, Calendar } from 'lucide-react'

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const creditData = await getCreditData()

  if (!creditData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Credits</h1>
        <p className="text-muted-foreground">Unable to load credit information.</p>
      </div>
    )
  }

  // Determine if this is a new user (has signup bonus)
  const hasSignupBonus = creditData.transactions.some(
    (t: any) => t.type === 'signup_bonus'
  )
  const isNewUser = hasSignupBonus && creditData.totalEarned === 50

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Credits Management</h1>
        <p className="text-muted-foreground mt-2">
          Track your credits balance and view transaction history
        </p>
      </div>

      {/* Welcome Card for New Users */}
      {isNewUser && (
        <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-yellow-600" />
              Welcome Bonus Activated!
            </CardTitle>
            <CardDescription>
              You've received 50 free credits to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">
                As a new user, you've been awarded <strong>50 credits</strong> as a welcome bonus! 
                Use these credits to participate in monthly draws and win exciting prizes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    Draw Entry
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">2 credits per entry</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Monthly Allowance
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">10 free credits/month</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Subscribe & Earn
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Up to 30 credits/month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl">
        <CreditDashboard
          currentBalance={creditData.currentBalance}
          totalEarned={creditData.totalEarned}
          totalSpent={creditData.totalSpent}
          monthlyAllowance={creditData.monthlyAllowance}
          transactions={creditData.transactions}
        />
      </div>
    </div>
  )
}
