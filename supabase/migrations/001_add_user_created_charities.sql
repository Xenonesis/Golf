-- Migration: Add user-created charity support
-- Date: 2026-04-30
-- Description: Allow users to create their own charities

-- Add created_by column to charities table
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Update RLS policies to allow users to create and manage their own charities
DROP POLICY IF EXISTS "Admins can manage charities" ON public.charities;

CREATE POLICY "Users can create charities" ON public.charities 
  FOR INSERT WITH CHECK (auth.uid() = created_by OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can update own charities" ON public.charities 
  FOR UPDATE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all charities" ON public.charities 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
