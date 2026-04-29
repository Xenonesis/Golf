import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Golf Rewards Platform</h3>
            <p className="text-sm text-muted-foreground">
              Track scores, support charities, win rewards.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
              <li><Link href="/charities" className="hover:underline">Charities</Link></li>
              <li><Link href="/about" className="hover:underline">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          © 2026 Golf Rewards Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
