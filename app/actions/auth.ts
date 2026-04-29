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

export async function createAdminUser(email: string, password: string, fullName: string) {
  const supabase = await createClient()

  // Create the user in auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // Update the profile to set role as admin
  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authData.user.id)

  if (profileError) {
    return { error: 'User created but failed to set admin role: ' + profileError.message }
  }

  return { 
    success: true, 
    message: 'Admin user created successfully',
    userId: authData.user.id
  }
}
