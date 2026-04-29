# Golf Performance + Charity + Rewards Platform

A modern subscription-based web application that combines golf performance tracking, charity fundraising, and monthly draw-based rewards.

## Features

- **Subscription Engine**: Monthly & yearly plans via Stripe
- **Score Management**: Track last 5 Stableford scores (1-45 range)
- **Draw System**: Monthly draws with 3-tier matching (3, 4, or 5 numbers)
- **Charity Integration**: User-selected donations (minimum 10%)
- **Winner Verification**: Admin-controlled proof review workflow
- **Admin Dashboard**: Complete platform management
- **Modern UI/UX**: Non-traditional golf aesthetic with mobile-first design

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: Stripe (Subscriptions + Customer Portal)
- **Email**: Resend (transactional emails)
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Validation**: Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Resend account (for email)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd golf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your actual values:
   - Supabase URL and keys
   - Stripe API keys
   - Resend API key
   - App URL

4. **Set up Supabase database**

   You have two options to set up the database:

   ### Option A: Using Supabase SQL Editor (Recommended for quick setup)

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Navigate to **SQL Editor** in your Supabase dashboard

   c. Click **"New Query"** button

   d. Open `supabase/schema.sql` in your code editor and copy ALL content (406 lines)

   e. Paste the entire SQL script into the SQL Editor

   f. Click **"Run"** or press `Ctrl+Enter` to execute

   g. Wait for execution to complete - you should see "Success" message

   h. Verify tables were created by going to **Table Editor** - you should see:
      - profiles
      - subscriptions
      - golf_scores
      - charities
      - user_charity_selections
      - monthly_draws
      - draw_participants
      - winner_verifications
      - webhook_events

   i. Generate TypeScript types:
      ```bash
      npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
      ```

   ### Option B: Using Supabase CLI (For development workflow)

   a. Install Supabase CLI (if not already installed):
      ```bash
      npm install -g supabase
      ```

   b. Link to your Supabase project:
      ```bash
      npx supabase link --project-ref YOUR_PROJECT_REF
      ```
      (Find your project ref in the URL: `https://supabase.com/dashboard/project/<ref>`)

   c. Push the database schema:
      ```bash
      npx supabase db push
      ```

   d. Generate TypeScript types:
      ```bash
      npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
      ```

   **Note**: The SQL Editor method (Option A) is faster for initial setup. The CLI method (Option B) is better for ongoing development and migrations.

5. **Set up Stripe**

   a. Create products and prices in Stripe Dashboard:
      - Monthly subscription plan
      - Yearly subscription plan (with discount)

   b. Get your API keys from Stripe Dashboard:
      - Publishable Key (`STRIPE_PUBLISHABLE_KEY`)
      - Secret Key (`STRIPE_SECRET_KEY`)

   c. Set up webhook endpoint:
      - In Stripe Dashboard, add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
      - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
      - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

   d. For local testing, use Stripe CLI:
      ```bash
      stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
      ```

6. **Set up Resend**

   a. Sign up at [resend.com](https://resend.com)
   b. Get your API key and add to `RESEND_API_KEY`
   c. Verify your domain for sending emails

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
golf/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (webhooks)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── ...
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── stripe.ts         # Stripe configuration
│   ├── resend.ts         # Email configuration
│   ├── validation.ts     # Zod schemas
│   └── ...
├── types/                 # TypeScript types
│   └── database.types.ts # Supabase generated types
├── supabase/             # Database migrations
│   └── schema.sql        # Main schema file
├── middleware.ts          # Route protection
└── .env.local            # Environment variables
```

## Database Schema

The platform uses the following main tables:

- **profiles**: User profiles (extends Supabase auth)
- **subscriptions**: Subscription status and Stripe integration
- **golf_scores**: User golf scores (max 5 per user)
- **charities**: Available charities for donations
- **user_charity_selections**: User's chosen charity
- **monthly_draws**: Monthly draw configurations
- **draw_participants**: User participation in draws
- **winner_verifications**: Winner proof submission and review
- **webhook_events**: Stripe webhook event tracking (idempotency)

### Key Features

- **Row Level Security (RLS)**: All tables have RLS policies enabled
- **Triggers**: Auto-create profiles, enforce max 5 scores, update timestamps
- **Functions**: `get_last_5_scores()`, `calculate_draw_winners()`

## User Roles

### Public Visitor
- View landing page and pricing
- Browse charities
- Sign up for account

### Registered Subscriber
- Manage profile
- Enter/edit golf scores (last 5)
- Select charity and contribution percentage
- Participate in monthly draws
- View winnings and upload proof

### Administrator
- Manage users and subscriptions
- Configure and publish draws
- Manage charities (CRUD)
- Review winner verifications
- View analytics

## Score Management

- **Range**: 1-45 (Stableford format)
- **Limit**: Maximum 5 scores per user
- **Validation**: One score per date only
- **Auto-enforcement**: Database trigger removes oldest when 6th is added

## Draw System

### Algorithms
- **Random**: Pure random number generation (lottery style)
- **Weighted**: Favors less commonly chosen numbers to reduce multiple winners

### Prize Distribution
- **5-number match**: 40% of pool (rollover if no winner)
- **4-number match**: 35% of pool
- **3-number match**: 25% of pool

### Winner Verification Flow
`Pending → Approved/Rejected → Paid`

## Security

- **Authentication**: Supabase Auth with JWT sessions
- **Authorization**: Role-based access control (public, subscriber, admin)
- **Route Protection**: Middleware checks authentication and roles
- **Database Security**: Row Level Security (RLS) on all tables
- **Input Validation**: Zod schemas on all user inputs
- **Webhook Security**: Stripe signature verification + idempotency

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all required variables in Vercel:
- Supabase credentials
- Stripe production keys
- Resend API key
- App URL (your production domain)

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Subscription creation (monthly + yearly)
- [ ] Webhook processing
- [ ] Score entry (validation, 5-score limit)
- [ ] Charity selection
- [ ] Draw participation
- [ ] Winner notification
- [ ] Admin operations
- [ ] Mobile responsiveness

### Local Webhook Testing

```bash
# Install Stripe CLI
stripe login

# Start forwarding
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
```

## Troubleshooting

### Build Errors

If you see TypeScript errors related to database types:
```bash
# Regenerate types from your Supabase project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

### Webhook Issues

- Verify webhook secret is correct
- Check Stripe CLI is running for local testing
- Ensure webhook endpoint URL is correct in Stripe Dashboard

### Authentication Issues

- Verify Supabase URL and anon key are correct
- Check that RLS policies are enabled in Supabase
- Clear browser cookies and try again

## Future Enhancements

- Multi-country support (currency selection)
- Corporate/team accounts
- Mobile app (React Native)
- Advanced analytics and predictions
- Social features (friends, leaderboards)
- Push notifications

## License

This project is proprietary and confidential.

## Support

For issues or questions, please refer to the implementation plan at:
`C:\Users\addy\AppData\Roaming\Lingma\SharedClientCache\cli\specs\golf-platform-implementation-plan.md`
