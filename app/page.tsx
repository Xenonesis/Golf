import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Golf Performance + Charity + Rewards
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track your golf scores, support charities, and win monthly rewards. Join our community of passionate golfers making a difference.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Plans
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Join?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Track Performance</CardTitle>
              <CardDescription>Monitor your last 5 Stableford scores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easy score entry with automatic validation. Visualize your progress over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Charities</CardTitle>
              <CardDescription>Choose where your contribution goes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Minimum 10% of your subscription goes to charity. You can increase this amount.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Win Rewards</CardTitle>
              <CardDescription>Monthly draws with cash prizes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Match 3, 4, or 5 numbers to win. Jackpot rolls over if no winner.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Join thousands of golfers already participating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
