import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">About Golf Charity Draws</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combining the love of golf with charitable giving. Every draw supports meaningful causes while giving you a chance to win amazing prizes.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <p>
                We believe in making a positive impact through sports. Our platform connects golf enthusiasts 
                with charitable organizations, creating a win-win situation for everyone involved.
              </p>
              <p>
                For every participation in our monthly draws, a portion goes directly to support verified 
                charities working in communities that need it most.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Subscribe</CardTitle>
                <CardDescription>Join our community</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Sign up and choose a subscription plan that works for you. Get credits to participate in draws.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Pick Numbers</CardTitle>
                <CardDescription>Select your lucky numbers</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Choose your numbers for the monthly draw. Each entry gives you a chance to win while supporting charity.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Win & Support</CardTitle>
                <CardDescription>Make an impact</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Winners are selected fairly each month. A portion of all proceeds goes to your chosen charity.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold text-primary">$50K+</p>
              <p className="text-muted-foreground mt-2">Raised for Charity</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">1,000+</p>
              <p className="text-muted-foreground mt-2">Active Participants</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">20+</p>
              <p className="text-muted-foreground mt-2">Partner Charities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
          <p className="text-lg opacity-90">
            Join thousands of golfers who are winning prizes while supporting great causes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/charities">View Charities</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
