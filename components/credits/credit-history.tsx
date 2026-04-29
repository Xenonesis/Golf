'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ArrowUpRight, ArrowDownLeft, RotateCcw, Gift, Calendar, CreditCard } from 'lucide-react'

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
    if (type === 'signup_bonus' || type === 'first_subscription_bonus') {
      return <Gift className="h-4 w-4 text-purple-500" />
    }
    if (type === 'monthly_grant' || type === 'subscription_grant') {
      return <Calendar className="h-4 w-4 text-blue-500" />
    }
    if (type === 'spend') {
      return <ArrowDownLeft className="h-4 w-4 text-red-500" />
    }
    if (type === 'refund') {
      return <RotateCcw className="h-4 w-4 text-orange-500" />
    }
    return <CreditCard className="h-4 w-4 text-gray-500" />
  }

  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const getBadgeVariant = (type: string) => {
    if (type.includes('bonus')) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (type.includes('grant')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (type === 'spend') return 'bg-red-100 text-red-800 border-red-200'
    if (type === 'refund') return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' today'
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Group transactions by date
  const groupByDate = (transactions: CreditTransaction[]) => {
    const groups: { [key: string]: CreditTransaction[] } = {}
    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(t)
    })
    return groups
  }

  const groupedTransactions = groupByDate(transactions)

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
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start using credits to see your history here.
            </p>
          </div>
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
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 pb-2 border-b">
                {date}
              </h3>
              <div className="space-y-2">
                {dateTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 p-2 rounded-full bg-muted/50">
                        {getTransactionIcon(transaction.type)}
                      </div>
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
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getBadgeVariant(transaction.type)}`}
                      >
                        {formatType(transaction.type)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
