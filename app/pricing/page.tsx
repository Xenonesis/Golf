import { createCheckoutSession } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Sample pricing - in production, fetch from Stripe
const plans = [
  {
    name: 'Monthly Plan',
    description: 'Perfect for regular golfers',
    price: 29.99,
    interval: 'month',
    priceId: 'price_monthly_test', // Replace with actual Stripe price ID
    features: [
      'Track up to 5 scores',
      'Monthly draw participation',
      'Support your chosen charity',
      'Access to dashboard',
    ],
  },
  {
    name: 'Yearly Plan',
    description: 'Best value for dedicated golfers',
    price: 287.90, // ~20% discount
    interval: 'year',
    priceId: 'price_yearly_test', // Replace with actual Stripe price ID
    badge: 'Save 20%',
    features: [
      'Everything in Monthly',
      '20% discount',
      'Priority support',
      'Exclusive member events',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our community and start tracking your performance while supporting charities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className="relative">
              {plan.badge && (
                <Badge className="absolute -top-3 right-4" variant="success">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
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

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            10% of your subscription goes to charity. You can increase this amount in your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
