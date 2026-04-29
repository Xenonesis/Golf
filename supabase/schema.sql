-- ============================================
-- Golf Performance + Charity + Rewards Platform
-- Database Schema Migration
-- Execute this in Supabase SQL Editor
-- ============================================

-- ============================================
-- ENUMS AND TYPES
-- ============================================

CREATE TYPE public.user_role AS ENUM ('public', 'subscriber', 'admin');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending', 'past_due', 'trialing');
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE public.draw_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE public.winner_verification_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
CREATE TYPE public.charity_category AS ENUM ('education', 'health', 'environment', 'sports', 'community', 'other');
CREATE TYPE public.draw_algorithm AS ENUM ('random', 'weighted');
CREATE TYPE public.credit_transaction_type AS ENUM ('signup_bonus', 'monthly_grant', 'subscription_grant', 'first_subscription_bonus', 'spend', 'refund');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'public',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile data linked to auth.users';

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  charity_contribution_percentage NUMERIC(5, 2) DEFAULT 10.00 CHECK (charity_contribution_percentage >= 10),
  monthly_credits NUMERIC DEFAULT 0,
  first_subscription_bonus_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- ============================================
-- GOLF SCORES TABLE
-- ============================================

CREATE TABLE public.golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  play_date DATE NOT NULL,
  course_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_date UNIQUE (user_id, play_date)
);

CREATE INDEX idx_golf_scores_user_id ON public.golf_scores(user_id);
CREATE INDEX idx_golf_scores_play_date ON public.golf_scores(play_date DESC);

-- ============================================
-- CHARITIES TABLE
-- ============================================

CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category charity_category NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_donations NUMERIC(12, 2) DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charities_category ON public.charities(category);
CREATE INDEX idx_charities_featured ON public.charities(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- USER CHARITY SELECTIONS
-- ============================================

CREATE TABLE public.user_charity_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_charity UNIQUE (user_id, charity_id)
);

CREATE INDEX idx_user_charity_user_id ON public.user_charity_selections(user_id);

-- ============================================
-- MONTHLY DRAWS TABLE
-- ============================================

CREATE TABLE public.monthly_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL,
  status draw_status NOT NULL DEFAULT 'draft',
  algorithm draw_algorithm DEFAULT 'random',
  winning_numbers INTEGER[] CHECK (array_length(winning_numbers, 1) = 5),
  jackpot_amount NUMERIC(12, 2) DEFAULT 0,
  rollover_from UUID REFERENCES public.monthly_draws(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_draw_month UNIQUE (draw_month)
);

CREATE INDEX idx_monthly_draws_month ON public.monthly_draws(draw_month DESC);
CREATE INDEX idx_monthly_draws_status ON public.monthly_draws(status);

-- ============================================
-- DRAW PARTICIPANTS (user number selections)
-- ============================================

CREATE TABLE public.draw_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.monthly_draws(id) ON DELETE CASCADE,
  selected_numbers INTEGER[] CHECK (array_length(selected_numbers, 1) = 5),
  matched_count INTEGER DEFAULT 0,
  match_type INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  prize_amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_draw UNIQUE (user_id, draw_id)
);

CREATE INDEX idx_draw_participants_draw_id ON public.draw_participants(draw_id);
CREATE INDEX idx_draw_participants_user_id ON public.draw_participants(user_id);
CREATE INDEX idx_draw_participants_winner ON public.draw_participants(is_winner) WHERE is_winner = TRUE;

-- ============================================
-- WINNER VERIFICATIONS
-- ============================================

CREATE TABLE public.winner_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.draw_participants(id) ON DELETE CASCADE,
  proof_image_url TEXT,
  status winner_verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_winner_verifications_participant ON public.winner_verifications(participant_id);
CREATE INDEX idx_winner_verifications_status ON public.winner_verifications(status);

-- ============================================
-- WEBHOOK EVENTS (for idempotency)
-- ============================================

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_stripe_id ON public.webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_processed ON public.webhook_events(processed);

-- ============================================
-- USER CREDITS TABLE
-- ============================================

CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Credit balance tracking
  total_earned NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  
  -- Monthly allowance tracking
  monthly_allowance NUMERIC DEFAULT 10,
  last_monthly_grant TIMESTAMPTZ,
  
  -- One-time bonuses
  signup_bonus_claimed BOOLEAN DEFAULT FALSE,
  first_subscription_bonus_claimed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE UNIQUE INDEX idx_user_credits_unique_user ON public.user_credits(user_id);

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  amount NUMERIC NOT NULL,
  type credit_transaction_type NOT NULL,
  description TEXT,
  
  reference_id UUID,
  reference_type TEXT,
  
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(type);

-- ============================================
-- DONATIONS TABLE (Independent one-time donations)
-- ============================================

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

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'public'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-create credit record on user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create credit record with 50 signup bonus
  INSERT INTO public.user_credits (
    user_id, 
    total_earned, 
    current_balance, 
    signup_bonus_claimed,
    monthly_allowance
  )
  VALUES (
    NEW.id,
    50,
    50,
    TRUE,
    10
  );
  
  -- Log the signup bonus transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  VALUES (
    NEW.id,
    50,
    'signup_bonus',
    'Welcome bonus - 50 free credits',
    50
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- ============================================
-- TRIGGER: Update updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_golf_scores_updated_at BEFORE UPDATE ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_draws_updated_at BEFORE UPDATE ON public.monthly_draws FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_winner_verifications_updated_at BEFORE UPDATE ON public.winner_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER: Enforce max 5 scores per user
-- ============================================

CREATE OR REPLACE FUNCTION public.enforce_max_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO score_count
  FROM public.golf_scores
  WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    DELETE FROM public.golf_scores
    WHERE id IN (
      SELECT id FROM public.golf_scores
      WHERE user_id = NEW.user_id
      ORDER BY play_date ASC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_max_five_scores
  BEFORE INSERT ON public.golf_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_scores();

-- ============================================
-- FUNCTION: Get last 5 scores for a user
-- ============================================

CREATE OR REPLACE FUNCTION public.get_last_5_scores(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  score INTEGER,
  play_date DATE,
  course_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT gs.id, gs.score, gs.play_date, gs.course_name
  FROM public.golf_scores gs
  WHERE gs.user_id = p_user_id
  ORDER BY gs.play_date DESC
  LIMIT 5;
END;
$$;

-- ============================================
-- FUNCTION: Calculate draw winners
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_draw_winners(p_draw_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update matched counts for all participants
  UPDATE public.draw_participants dp
  SET
    matched_count = (
      SELECT COUNT(*)
      FROM unnest(dp.selected_numbers) AS s(num)
      WHERE num = ANY(md.winning_numbers)
    ),
    match_type = (
      SELECT COUNT(*)
      FROM unnest(dp.selected_numbers) AS s(num)
      WHERE num = ANY(md.winning_numbers)
    )
  FROM public.monthly_draws md
  WHERE dp.draw_id = md.id
  AND dp.draw_id = p_draw_id;

  -- Mark winners (3+ matches)
  UPDATE public.draw_participants
  SET is_winner = TRUE
  WHERE draw_id = p_draw_id
  AND matched_count >= 3;
END;
$$;

-- ============================================
-- FUNCTION: Increment charity donations
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_charity_donations(p_charity_id UUID, p_amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.charities
  SET total_donations = total_donations + p_amount,
      updated_at = NOW()
  WHERE id = p_charity_id;
END;
$$;

-- ============================================
-- FUNCTION: Grant monthly credits to all users
-- ============================================

CREATE OR REPLACE FUNCTION public.grant_monthly_credits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM public.user_credits LOOP
    -- Check if it's been at least 30 days since last grant
    IF user_record.last_monthly_grant IS NULL OR 
       EXTRACT(DAY FROM NOW() - user_record.last_monthly_grant) >= 30 THEN
      
      -- Grant monthly allowance (10 credits)
      UPDATE public.user_credits
      SET 
        total_earned = total_earned + 10,
        current_balance = current_balance + 10,
        last_monthly_grant = NOW()
      WHERE id = user_record.id;
      
      -- Log transaction
      INSERT INTO public.credit_transactions (
        user_id,
        amount,
        type,
        description,
        balance_after
      )
      VALUES (
        user_record.user_id,
        10,
        'monthly_grant',
        'Monthly free credits',
        user_record.current_balance + 10
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Golf Scores
CREATE POLICY "Users can view own scores" ON public.golf_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.golf_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.golf_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.golf_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON public.golf_scores FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Charities
CREATE POLICY "Everyone can view active charities" ON public.charities FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create charities" ON public.charities FOR INSERT WITH CHECK (auth.uid() = created_by OR auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Users can update own charities" ON public.charities FOR UPDATE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage all charities" ON public.charities FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Charity Selections
CREATE POLICY "Users can view own charity selections" ON public.user_charity_selections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own charity selections" ON public.user_charity_selections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all charity selections" ON public.user_charity_selections FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Monthly Draws
CREATE POLICY "Everyone can view published draws" ON public.monthly_draws FOR SELECT USING (status IN ('published', 'completed'));
CREATE POLICY "Admins can manage all draws" ON public.monthly_draws FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Draw Participants
CREATE POLICY "Users can view own participation" ON public.draw_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Subscribers can participate in draws" ON public.draw_participants FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Admins can view all participants" ON public.draw_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update participants" ON public.draw_participants FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Winner Verifications
CREATE POLICY "Winners can view own verification" ON public.winner_verifications FOR SELECT USING (EXISTS (SELECT 1 FROM public.draw_participants dp WHERE dp.id = participant_id AND dp.user_id = auth.uid()));
CREATE POLICY "Winners can upload proof" ON public.winner_verifications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.draw_participants dp WHERE dp.id = participant_id AND dp.user_id = auth.uid()));
CREATE POLICY "Winners can update own verification" ON public.winner_verifications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.draw_participants dp WHERE dp.id = participant_id AND dp.user_id = auth.uid()));
CREATE POLICY "Admins can review verifications" ON public.winner_verifications FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Credits
CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage credits" ON public.user_credits FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Credit Transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON public.credit_transactions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Donations
CREATE POLICY "Everyone can view completed donations" ON public.donations FOR SELECT USING (status = 'completed');
CREATE POLICY "Users can view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service role can update donations" ON public.donations FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- SEED DATA: Sample Charities
-- ============================================

INSERT INTO public.charities (name, description, category, is_featured, is_active) VALUES
('Golf Education Foundation', 'Providing golf education and scholarships to underprivileged youth', 'education', true, true),
('Green Greens Initiative', 'Environmental conservation of golf courses and natural habitats', 'environment', true, true),
('Health Through Sports', 'Promoting physical and mental health through golf programs', 'health', false, true),
('Community Golf Access', 'Building public golf facilities in underserved communities', 'community', false, true),
('Veterans Golf Program', 'Supporting veterans through therapeutic golf activities', 'sports', true, true);
