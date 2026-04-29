import { createCheckoutSession } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins } from 'lucide-react'

// Sample pricing - in production, fetch from Stripe
const plans = [
  {
    name: 'Monthly Plan',
    description: 'Perfect for regular golfers',
    price: 29.99,
    interval: 'month',
    priceId: 'price_monthly_test', // Replace with actual Stripe price ID
    credits: {
      monthly: 10,
      bonus: 0,
      total: 10,
    },
    features: [
      'Track up to 5 scores',
      'Monthly draw participation',
      'Support your chosen charity',
      'Access to dashboard',
      '10 credits per month',
      '1 credit per score entry',
      '2 credits per draw entry',
    ],
  },
  {
    name: 'Yearly Plan',
    description: 'Best value for dedicated golfers',
    price: 287.90, // ~20% discount
    interval: 'year',
    priceId: 'price_yearly_test', // Replace with actual Stripe price ID
    badge: 'Save 20%',
    credits: {
      monthly: 10,
      bonus: 50,
      total: 170, // 10 * 12 + 50 bonus
    },
    features: [
      'Everything in Monthly',
      '20% discount',
      'Priority support',
      'Exclusive member events',
      '10 credits per month (120/year)',
      '50 bonus credits on signup',
      'Total 170 credits first year',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join our community and start tracking your performance while supporting charities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className="relative flex flex-col">
              {plan.badge && (
                <Badge className="absolute -top-3 right-4" variant="success">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>

                {/* Credits Badge */}
                <div className="mb-6 p-4 rounded-lg bg-secondary border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      <span className="font-semibold">Credits Included</span>
                    </div>
                    <Badge variant="outline">
                      {plan.credits.total} credits
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {plan.credits.monthly} per month
                    {plan.credits.bonus > 0 && ` + ${plan.credits.bonus} bonus on signup`}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <form action={createCheckoutSession.bind(null, plan.priceId)}>
                  <Button type="submit" className="w-full" size="lg">
                    Subscribe Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            10% of your subscription goes to charity. You can increase this amount in your dashboard.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Credits are used for score entries (1 credit) and draw participation (2 credits).
          </p>
        </div>
      </div>
    </div>
  )
}
