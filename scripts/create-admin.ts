import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  const email = 'admin@golfplatform.com'
  const password = 'Admin@123456'
  const fullName = 'Platform Admin'

  console.log('Creating admin user...')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('---')

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
    console.error('Auth Error:', authError.message)
    return
  }

  console.log('User created with ID:', authData.user.id)

  // Update the profile to set role as admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('Profile Update Error:', profileError.message)
    return
  }

  console.log('✅ Admin user created successfully!')
  console.log('---')
  console.log('Login Credentials:')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('---')
}

createAdmin()
