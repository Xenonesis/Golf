import { SignupForm } from '@/components/auth/signup-form'
import { Header } from '@/components/layout/header'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
        <SignupForm />
      </main>
    </div>
  )
}
