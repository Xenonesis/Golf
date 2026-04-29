import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Golf Rewards
        </Link>

        <nav className="flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/charities">
                <Button variant="ghost">Charities</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard/scores">
                <Button variant="ghost">Scores</Button>
              </Link>
              <Link href="/dashboard/draws">
                <Button variant="ghost">Draws</Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="outline">Sign Out</Button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
