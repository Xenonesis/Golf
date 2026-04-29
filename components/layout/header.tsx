import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

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
      .single() as { data: Profile | null }
    isAdmin = profile?.role === 'admin'
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-bold tracking-tight hover:opacity-80 transition-opacity">
          Golf Rewards
        </Link>

        <nav className="flex items-center gap-2">
          {!user ? (
            <>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">Pricing</Button>
              </Link>
              <Link href="/charities">
                <Button variant="ghost" size="sm">Charities</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/dashboard/scores">
                <Button variant="ghost" size="sm">Scores</Button>
              </Link>
              <Link href="/dashboard/draws">
                <Button variant="ghost" size="sm">Draws</Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">Sign Out</Button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
