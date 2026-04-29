import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCreditData } from '@/app/actions/credits'
import { CreditDashboard } from '@/components/credits/credit-dashboard'

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Credits Management</h1>
        <p className="text-muted-foreground mt-2">
          Track your credits balance and view transaction history
        </p>
      </div>

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
