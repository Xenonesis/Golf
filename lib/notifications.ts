import { resend } from './resend'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send draw results notification to all participants
 */
export async function sendDrawResultsNotification(drawId: string) {
  try {
    // Get draw details
    const { data: draw } = await supabaseAdmin
      .from('monthly_draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (!draw || !draw.winning_numbers) {
      throw new Error('Draw not found or winning numbers not set')
    }

    // Get all participants with their emails
    const { data: participants } = await supabaseAdmin
      .from('draw_participants')
      .select(`
        *,
        profiles (email, full_name)
      `)
      .eq('draw_id', drawId)

    if (!participants || participants.length === 0) {
      console.log('No participants to notify')
      return
    }

    const drawMonth = new Date(draw.draw_month).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    // Send email to each participant
    for (const participant of participants) {
      const profile = participant.profiles as any
      const matchedCount = participant.matched_count || 0
      const isWinner = participant.is_winner || false

      const subject = isWinner
        ? `🎉 Congratulations! You won in the ${drawMonth} Draw!`
        : `${drawMonth} Draw Results - Better luck next time!`

      await resend.emails.send({
        from: 'Golf Rewards <noreply@golfrewards.com>',
        to: [profile.email],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">${drawMonth} Draw Results</h1>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Winning Numbers</h2>
              <div style="display: flex; gap: 10px; justify-content: center;">
                ${draw.winning_numbers.map((num: number) => `
                  <span style="background: #000; color: #fff; padding: 10px 15px; border-radius: 50%; font-weight: bold; font-size: 18px;">
                    ${num}
                  </span>
                `).join('')}
              </div>
            </div>

            <div style="margin: 20px 0;">
              <p><strong>Your numbers:</strong> ${participant.selected_numbers?.join(', ')}</p>
              <p><strong>Matches:</strong> ${matchedCount}</p>
              
              ${isWinner ? `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <h3 style="color: #155724; margin-top: 0;">🎊 You're a Winner!</h3>
                  <p style="margin-bottom: 0;">Congratulations! You matched ${matchedCount} numbers. Please upload your proof of eligibility in your dashboard to claim your prize.</p>
                </div>
              ` : `
                <p>Unfortunately, you didn't win this time. Keep participating for future draws!</p>
              `}
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                Thank you for being part of Golf Rewards. Your participation helps support our charity partners.
              </p>
              <p style="color: #666; font-size: 14px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws" style="color: #0070f3;">View your dashboard</a>
              </p>
            </div>
          </div>
        `,
      })

      console.log(`Email sent to ${profile.email}`)
    }

    console.log(`Sent draw results to ${participants.length} participants`)
  } catch (error) {
    console.error('Error sending draw results:', error)
    throw error
  }
}

/**
 * Send winner verification reminder
 */
export async function sendWinnerVerificationReminder(participantId: string) {
  try {
    const { data: participant } = await supabaseAdmin
      .from('draw_participants')
      .select(`
        *,
        profiles (email, full_name),
        monthly_draws (draw_month)
      `)
      .eq('id', participantId)
      .single()

    if (!participant) {
      throw new Error('Participant not found')
    }

    const profile = participant.profiles as any
    const draw = participant.monthly_draws as any

    await resend.emails.send({
      from: 'Golf Rewards <noreply@golfrewards.com>',
      to: [profile.email],
      subject: 'Action Required: Verify Your Win!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Verify Your Prize</h1>
          
          <p>Congratulations! You won in the ${new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} draw by matching ${participant.matched_count} numbers.</p>
          
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Action Required:</strong> To claim your prize, please upload proof of eligibility in your dashboard within 7 days.</p>
          </div>

          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Upload Proof Now
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you don't verify within 7 days, your prize may be forfeited.
          </p>
        </div>
      `,
    })

    console.log(`Verification reminder sent to ${profile.email}`)
  } catch (error) {
    console.error('Error sending verification reminder:', error)
    throw error
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmation(userId: string, plan: string) {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('User not found')
    }

    const planName = plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'

    await resend.emails.send({
      from: 'Golf Rewards <noreply@golfrewards.com>',
      to: [profile.email],
      subject: `Welcome to Golf Rewards - ${planName} Activated!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome to Golf Rewards!</h1>
          
          <p>Hi ${profile.full_name || 'Golfer'},</p>
          
          <p>Thank you for subscribing to our <strong>${planName}</strong>. Your subscription is now active!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul style="padding-left: 20px;">
              <li>Track your golf scores (up to 5 latest scores)</li>
              <li>Select your favorite charity to support</li>
              <li>Participate in monthly draws to win prizes</li>
              <li>Earn and use credits for entries</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Remember: 10% of your subscription goes to charity. You can increase this amount in your dashboard.
          </p>
        </div>
      `,
    })

    console.log(`Subscription confirmation sent to ${profile.email}`)
  } catch (error) {
    console.error('Error sending subscription confirmation:', error)
    throw error
  }
}

/**
 * Send subscription renewal reminder (3 days before expiry)
 */
export async function sendRenewalReminder(userId: string) {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('User not found')
    }

    await resend.emails.send({
      from: 'Golf Rewards <noreply@golfrewards.com>',
      to: [profile.email],
      subject: 'Your Subscription Expires Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Subscription Renewal Reminder</h1>
          
          <p>Hi ${profile.full_name || 'Golfer'},</p>
          
          <p>Your Golf Rewards subscription will expire in <strong>3 days</strong>.</p>
          
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Don't lose access to:</strong></p>
            <ul style="margin: 10px 0 0 20px; padding: 0;">
              <li>Score tracking</li>
              <li>Monthly draw participation</li>
              <li>Charity contributions</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Renew Now
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Your payment method on file will be charged automatically unless you cancel.
          </p>
        </div>
      `,
    })

    console.log(`Renewal reminder sent to ${profile.email}`)
  } catch (error) {
    console.error('Error sending renewal reminder:', error)
    throw error
  }
}
