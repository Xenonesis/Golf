'use client'

import { CreditBalance } from './credit-balance'
import { CreditHistory } from './credit-history'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
  balance_after: number
}

interface CreditDashboardProps {
  currentBalance: number
  totalEarned: number
  totalSpent: number
  monthlyAllowance: number
  transactions: Transaction[]
}

export function CreditDashboard({
  currentBalance,
  totalEarned,
  totalSpent,
  monthlyAllowance,
  transactions,
}: CreditDashboardProps) {
  return (
    <div className="space-y-6">
      <CreditBalance
        currentBalance={currentBalance}
        totalEarned={totalEarned}
        totalSpent={totalSpent}
        monthlyAllowance={monthlyAllowance}
      />
      <CreditHistory transactions={transactions} />
    </div>
  )
}
