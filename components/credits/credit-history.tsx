'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react'

interface CreditTransaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
  balance_after: number
}

interface CreditHistoryProps {
  transactions: CreditTransaction[]
}

export function CreditHistory({ transactions }: CreditHistoryProps) {
  const formatType = (type: string) => {
    switch (type) {
      case 'signup_bonus':
        return 'Signup Bonus'
      case 'monthly_grant':
        return 'Monthly Grant'
      case 'subscription_grant':
        return 'Subscription'
      case 'first_subscription_bonus':
        return 'First Sub Bonus'
      case 'spend':
        return 'Spent'
      case 'refund':
        return 'Refunded'
      default:
        return type
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type.includes('bonus') || type.includes('grant')) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    }
    if (type === 'spend') {
      return <ArrowDownLeft className="h-4 w-4 text-red-500" />
    }
    return <RotateCcw className="h-4 w-4 text-blue-500" />
  }

  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Start using credits to see your history here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getTransactionIcon(transaction.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className={`font-bold ${getAmountColor(transaction.amount)}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {formatType(transaction.type)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
