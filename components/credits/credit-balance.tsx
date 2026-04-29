'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, TrendingDown, Calendar, Gift } from 'lucide-react'

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

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) return 'bg-red-100 text-red-800 border-red-200'
    if (balance < 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  // Calculate usage percentage
  const usagePercentage = totalEarned > 0 ? Math.round((totalSpent / totalEarned) * 100) : 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-yellow-500" />
          Credits Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance - Prominent Display */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
              <p className={`text-3xl font-bold ${getBalanceColor(currentBalance)}`}>
                {currentBalance}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`text-sm px-3 py-1 ${getBalanceBadge(currentBalance)}`}
            >
              {currentBalance === 0 ? 'Empty' : currentBalance < 5 ? 'Low' : 'Active'}
            </Badge>
          </div>
        </div>

        {/* Monthly Allowance */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Monthly Allowance</span>
          </div>
          <span className="font-semibold text-lg">{monthlyAllowance}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1 p-3 rounded-lg border bg-green-50/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Total Earned
            </div>
            <p className="text-xl font-bold text-green-600">{totalEarned}</p>
          </div>
          <div className="space-y-1 p-3 rounded-lg border bg-red-50/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Total Spent
            </div>
            <p className="text-xl font-bold text-red-600">{totalSpent}</p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        {totalEarned > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Credit Usage</span>
              <span className="font-medium">{usagePercentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Alerts and Tips */}
        {currentBalance === 0 && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            <strong>No Credits:</strong> You're out of credits. Wait for next month's allowance or subscribe for more.
          </div>
        )}
        {currentBalance > 0 && currentBalance < 5 && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
            <strong>Low Balance Alert:</strong> You have {currentBalance} credits remaining. Each draw entry costs 2 credits.
          </div>
        )}
        {currentBalance >= 5 && currentBalance < 10 && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
            <strong>Tip:</strong> Subscribe to get up to 30 credits per month plus a one-time bonus!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
