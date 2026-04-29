# Database Setup Guide

This guide walks you through setting up the Supabase database for the Golf Performance + Charity + Rewards Platform.

## Prerequisites

- A Supabase account at [supabase.com](https://supabase.com)
- A created Supabase project

## Quick Setup (SQL Editor Method)

This is the fastest way to set up your database:

### Step 1: Access SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. In the left sidebar, click on **SQL Editor** (icon looks like `</>`)

### Step 2: Execute Schema

1. Click the **"New Query"** button in the top right
2. Open the file `supabase/schema.sql` from this project
3. Select all content (`Ctrl+A`) and copy it (`Ctrl+C`)
4. Paste into the SQL Editor (`Ctrl+V`)
5. Click **"Run"** or press `Ctrl+Enter`

### Step 3: Verify Setup

After execution completes successfully:

1. Navigate to **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles` - User profiles linked to auth
   - `subscriptions` - Subscription management
   - `golf_scores` - Golf score tracking
   - `charities` - Available charities
   - `user_charity_selections` - User charity preferences
   - `monthly_draws` - Monthly draw configurations
   - `draw_participants` - Draw participation records
   - `winner_verifications` - Winner proof submissions
   - `webhook_events` - Stripe webhook tracking

3. Navigate to **Authentication** → **Policies** to verify RLS policies are active

### Step 4: Check Seed Data

The schema includes seed data for charities. Verify by running this query in SQL Editor:

```sql
SELECT * FROM charities;
```

You should see 5 sample charities.

## Alternative Setup (CLI Method)

For ongoing development with migrations:

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or verify it's available via npx:
```bash
npx supabase --version
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open a browser window for authentication. Complete the OAuth flow.

### Step 3: Link Project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in the URL: `https://supabase.com/dashboard/project/<ref>`

The project ref is a 20-character string (e.g., `abcdefghijklmnopqrst`).

After successful linking, you'll see:
```
Finished supabase link.
```

### Step 4: Verify Link

```bash
npx supabase status
```

This should show your project details including:
- Project ID
- Organization ID
- Database URL

### Step 5: Push Schema

```bash
npx supabase db push
```

This command will:
1. Create all enums (user_role, subscription_status, etc.)
2. Create all tables with proper constraints
3. Set up indexes
4. Create triggers and functions
5. Enable Row Level Security (RLS)
6. Create RLS policies
7. Insert seed data (5 sample charities)

You should see output like:
```
Connecting to remote database...
Applying migration 20240101000000_schema.sql...
Finished supabase db push.
```

### Step 6: Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

Replace `YOUR_PROJECT_REF` with your actual project reference ID.

### Step 7: Verify Database

Connect to your Supabase dashboard and verify:

1. **Table Editor** shows all 9 tables:
   - profiles
   - subscriptions
   - golf_scores
   - charities
   - user_charity_selections
   - monthly_draws
   - draw_participants
   - winner_verifications
   - webhook_events

2. **SQL Editor** - Run this query to check seed data:
   ```sql
   SELECT count(*) FROM charities;
   ```
   Should return `5`.

3. **Authentication** → **Policies** - Verify RLS policies are active on all tables.

### Ongoing Development with CLI

After initial setup, you can manage schema changes:

**Make schema changes:**
1. Edit `supabase/schema.sql` with your changes
2. Push updates: `npx supabase db push`

**Create new migrations:**
```bash
npx supabase migration new add_new_feature
```

This creates a new migration file in `supabase/migrations/`.

**Reset local database (for testing):**
```bash
npx supabase db reset
```

**Pull remote schema changes:**
```bash
npx supabase db pull
```

## Troubleshooting

### Error: "relation already exists"

If you're re-running the schema, you need to drop existing tables first:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS winner_verifications CASCADE;
DROP TABLE IF EXISTS draw_participants CASCADE;
DROP TABLE IF EXISTS monthly_draws CASCADE;
DROP TABLE IF EXISTS user_charity_selections CASCADE;
DROP TABLE IF EXISTS charities CASCADE;
DROP TABLE IF EXISTS golf_scores CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS draw_status CASCADE;
DROP TYPE IF EXISTS winner_verification_status CASCADE;
DROP TYPE IF EXISTS charity_category CASCADE;
DROP TYPE IF EXISTS draw_algorithm CASCADE;
```

Then re-run the schema.

### Error: "permission denied"

Make sure you're logged in as the project owner or have admin privileges.

### Error: "type already exists"

The schema uses `CREATE TYPE` which will fail if run twice. Either:
1. Drop the types first (see above), or
2. Use the CLI method which handles migrations properly

### Missing Tables After Execution

Check the SQL Editor output for error messages. Common issues:
- Syntax errors in the SQL
- Missing dependencies (types must be created before tables)
- Insufficient permissions

## Next Steps

After setting up the database:

1. Update `.env.local` with your Supabase credentials
2. Generate TypeScript types (if using CLI method)
3. Run the development server: `npm run dev`
4. Test user registration to verify the profile creation trigger works

## Schema Overview

The database implements:

- **Row Level Security (RLS)** on all tables for data isolation
- **Triggers** for:
  - Auto-creating profiles on user signup
  - Enforcing max 5 golf scores per user
  - Updating timestamps on record changes
- **Functions** for:
  - Retrieving last 5 scores
  - Calculating draw winners
- **Seed data** for 5 sample charities

For detailed schema documentation, see `supabase/schema.sql` comments.
