import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 text-center max-w-5xl">
        <h1 className="mb-6 leading-tight">
          Golf Performance + Charity + Rewards
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Track your golf scores, support charities, and win monthly rewards. Join our community of passionate golfers making a difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-base px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-base px-8">
              View Plans
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 border-y">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold mb-2">2,500+</div>
            <div className="text-sm text-muted-foreground">Active Golfers</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold mb-2">$45K+</div>
            <div className="text-sm text-muted-foreground">Won in Prizes</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold mb-2">$12K+</div>
            <div className="text-sm text-muted-foreground">Donated to Charity</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center mb-16">Why Join?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="group hover:shadow-lg transition-shadow duration-200">
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

          <Card className="group hover:shadow-lg transition-shadow duration-200">
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

          <Card className="group hover:shadow-lg transition-shadow duration-200">
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

      {/* How It Works Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-muted-foreground">Create your free account in under 2 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Submit Scores</h3>
              <p className="text-sm text-muted-foreground">Enter your Stableford scores after each round</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Get Credits</h3>
              <p className="text-sm text-muted-foreground">Earn credits for every valid score submitted</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-semibold mb-2">Win Prizes</h3>
              <p className="text-sm text-muted-foreground">Use credits to enter monthly draws and win</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center mb-16">What Golfers Say</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold flex-shrink-0">JD</div>
                <div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "Love that I can track my golf scores while supporting charity. Won $500 in my second month!"
                  </p>
                  <div className="font-semibold text-sm">John D.</div>
                  <div className="text-xs text-muted-foreground">Member since 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold flex-shrink-0">SM</div>
                <div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "The credit system is genius. I submit scores regularly and always have entries for draws."
                  </p>
                  <div className="font-semibold text-sm">Sarah M.</div>
                  <div className="text-xs text-muted-foreground">Member since 2023</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold flex-shrink-0">RK</div>
                <div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "Great platform! Knowing part of my subscription helps charities makes it even better."
                  </p>
                  <div className="font-semibold text-sm">Robert K.</div>
                  <div className="text-xs text-muted-foreground">Member since 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose a plan that fits your game. All plans include charity contributions and entry to monthly draws.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Monthly Plan</Badge>
                <CardTitle className="text-3xl">$29.99<span className="text-base font-normal text-muted-foreground">/month</span></CardTitle>
                <CardDescription>Perfect for regular golfers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Track up to 5 scores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>10% minimum to charity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Monthly draw participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>10 credits per month</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary hover:shadow-lg transition-shadow duration-200 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best Value</Badge>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Yearly Plan</Badge>
                <CardTitle className="text-3xl">$287.90<span className="text-base font-normal text-muted-foreground">/year</span></CardTitle>
                <CardDescription>Save 20% for dedicated golfers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Everything in Monthly plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>20% discount ($57 savings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>170 total credits (50 bonus)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-base">
              View Full Pricing Details
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center mb-16">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does the scoring system work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We use the Stableford scoring system, which awards points based on your performance relative to par on each hole. Submit your scores after each round, and they'll be validated automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When are the monthly draws?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Draws are held on the last Friday of each month. Winners are announced within 48 hours, and prizes are transferred directly to your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Which charities do you support?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We partner with multiple verified charities focused on education, health, and community development. You can choose which charity receives your contribution when you subscribe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time from your dashboard. Your access continues until the end of your current billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto bg-secondary border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <CardDescription>
              Join thousands of golfers already participating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signup">
              <Button size="lg" className="text-base">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
      <Footer />
    </div>
  )
}
