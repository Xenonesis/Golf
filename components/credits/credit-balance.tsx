'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, TrendingDown } from 'lucide-react'

interface CreditBalanceProps {
  currentBalance: number
  totalEarned: number
  totalSpent: number
  monthlyAllowance: number
}

export function CreditBalance({
  currentBalance,
  totalEarned,
  totalSpent,
  monthlyAllowance,
}: CreditBalanceProps) {
  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-red-500'
    if (balance < 5) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-yellow-500" />
          Credits Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Credits</span>
          <Badge variant="outline" className={`text-lg font-bold ${getBalanceColor(currentBalance)}`}>
            {currentBalance}
          </Badge>
        </div>

        {/* Monthly Allowance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Monthly Allowance</span>
          <span className="font-medium">{monthlyAllowance}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Total Earned
            </div>
            <p className="text-lg font-semibold text-green-600">{totalEarned}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Total Spent
            </div>
            <p className="text-lg font-semibold text-red-600">{totalSpent}</p>
          </div>
        </div>

        {/* Usage Info */}
        {currentBalance < 5 && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
            <strong>Low Balance Alert:</strong> You&apos;re running low on credits. Consider upgrading your plan or wait for next month&apos;s allowance.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
