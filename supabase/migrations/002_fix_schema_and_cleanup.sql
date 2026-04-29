-- ============================================
-- Migration 002: Ensure all tables exist and fix schema issues
-- This migration ensures donations table and other required tables are created
-- ============================================

-- Check and create donations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'donations') THEN
    CREATE TABLE public.donations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
      
      amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      currency TEXT DEFAULT 'USD',
      
      stripe_payment_intent_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
      
      is_anonymous BOOLEAN DEFAULT FALSE,
      donor_name TEXT,
      donor_email TEXT,
      message TEXT,
      
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_donations_charity_id ON public.donations(charity_id);
    CREATE INDEX idx_donations_user_id ON public.donations(user_id);
    CREATE INDEX idx_donations_status ON public.donations(status);
    
    ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for donations
    CREATE POLICY "Everyone can view completed donations" ON public.donations FOR SELECT USING (status = 'completed');
    CREATE POLICY "Users can view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Authenticated users can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    CREATE POLICY "Service role can update donations" ON public.donations FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');
  END IF;
END $$;

-- Add trigger for updated_at on donations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_donations_updated_at'
  ) THEN
    CREATE TRIGGER update_donations_updated_at 
      BEFORE UPDATE ON public.donations 
      FOR EACH ROW 
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Clean up test data (charity named 'x' with description 'vvv')
DELETE FROM public.charities WHERE name = 'x' AND description = 'vvv';

-- Remove duplicate charities (keep only one instance of each unique name)
DELETE FROM public.charities 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.charities 
  GROUP BY name
);
