'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWinnerVerification(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  const participantId = formData.get('participant_id') as string
  const proofImage = formData.get('proof_image') as File
  
  if (!participantId || !proofImage) {
    return { error: 'Missing required fields' }
  }
  
  try {
    // Upload proof image to Supabase Storage
    const fileName = `${participantId}_${Date.now()}_${proofImage.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(fileName, proofImage)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload proof image' }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(fileName)
    
    // Create winner verification record
    const { error: dbError } = await (supabase as any)
      .from('winner_verifications')
      .insert({
        participant_id: participantId,
        proof_image_url: publicUrl,
        status: 'pending'
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      return { error: 'Failed to submit verification' }
    }
    
    revalidatePath('/dashboard/winnings')
    revalidatePath('/admin/winners')
    
    return { success: true }
  } catch (error) {
    console.error('Verification submission error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function reviewWinnerVerification(verificationId: string, status: 'approved' | 'rejected', adminNotes?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Check if user is admin
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if ((profile as any)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }
  
  const { error } = await (supabase as any)
    .from('winner_verifications')
    .update({
      status,
      admin_notes: adminNotes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', verificationId)
  
  if (error) {
    console.error('Review error:', error)
    return { error: 'Failed to update verification' }
  }
  
  // If approved, mark as ready for payment
  if (status === 'approved') {
    // Could trigger payment workflow here
  }
  
  revalidatePath('/admin/winners')
  revalidatePath('/dashboard/winnings')
  
  return { success: true }
}

export async function markAsPaid(verificationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Check if user is admin
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if ((profile as any)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }
  
  const { error } = await (supabase as any)
    .from('winner_verifications')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', verificationId)
  
  if (error) {
    console.error('Mark as paid error:', error)
    return { error: 'Failed to update payment status' }
  }
  
  revalidatePath('/admin/winners')
  revalidatePath('/dashboard/winnings')
  
  return { success: true }
}
