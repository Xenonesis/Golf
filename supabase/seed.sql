-- ============================================
-- SEED DATA: Sample Charities
-- ============================================

INSERT INTO public.charities (name, description, category, is_featured, is_active) VALUES
('Golf Education Foundation', 'Providing golf education and scholarships to underprivileged youth', 'education', true, true),
('Green Greens Initiative', 'Environmental conservation of golf courses and natural habitats', 'environment', true, true),
('Health Through Sports', 'Promoting physical and mental health through golf programs', 'health', false, true),
('Community Golf Access', 'Building public golf facilities in underserved communities', 'community', false, true),
('Veterans Golf Program', 'Supporting veterans through therapeutic golf activities', 'sports', true, true);
