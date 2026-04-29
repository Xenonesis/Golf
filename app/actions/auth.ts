'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { LoginSchema, SignupSchema } from '@/lib/validation'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = LoginSchema.safeParse({
    email: data.email,
    password: data.password,
  })

  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
  }

  const result = SignupSchema.safeParse({
    email: data.email,
    password: data.password,
    full_name: data.full_name,
  })

  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() }
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email to confirm your account' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
