# Supabase CLI Quick Reference

## Initial Setup

```bash
# Login to Supabase
npx supabase login

# Link to your project (replace with your project ref)
npx supabase link --project-ref YOUR_PROJECT_REF

# Verify connection
npx supabase status
```

## Database Management

```bash
# Push schema to remote database
npx supabase db push

# Reset database (drops and recreates - WARNING: deletes all data)
npx supabase db reset

# Pull remote schema changes
npx supabase db pull

# Check migration status
npx supabase db remote commit
```

## Type Generation

```bash
# Generate TypeScript types from remote database
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

## Local Development

```bash
# Start local Supabase stack (requires Docker)
npx supabase start

# Stop local Supabase stack
npx supabase stop

# Check local stack status
npx supabase status
```

## Migrations

```bash
# Create a new migration
npx supabase migration new migration_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
```

## Common Issues

### "Not logged in"
```bash
npx supabase login
```

### "Project not linked"
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### "Schema already exists" errors
The CLI handles this automatically with migrations. If you get errors, try:
```bash
npx supabase db reset  # WARNING: Deletes all data
```

### Connection timeout
Check your internet connection and verify the project ref is correct.

## Project Configuration

The `supabase/config.toml` file is configured with:
- Schema path: `./schema.sql`
- Seed path: `./seed.sql`
- Migrations enabled
- Seed data enabled

## Environment Variables

Make sure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace placeholders with actual values from your Supabase dashboard:
1. Go to **Project Settings** → **API**
2. Copy the URL and keys
