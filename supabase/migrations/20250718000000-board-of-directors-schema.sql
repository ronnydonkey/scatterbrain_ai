-- Board of Directors Feature Database Schema
-- Create tables for user boards, custom advisors, and synthesis history

-- Users' board configurations
CREATE TABLE IF NOT EXISTS public.user_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  advisor_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Custom advisors created by users
CREATE TABLE IF NOT EXISTS public.custom_advisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  avatar TEXT DEFAULT '👤',
  voice TEXT NOT NULL,
  category TEXT DEFAULT 'Business',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Synthesis history for user queries and responses
CREATE TABLE IF NOT EXISTS public.synthesis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text TEXT NOT NULL,
  advisor_ids TEXT[] NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board templates (predefined board configurations)
CREATE TABLE IF NOT EXISTS public.board_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  advisor_ids TEXT[] NOT NULL,
  category TEXT DEFAULT 'General',
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Add RLS (Row Level Security) policies

-- User Boards Policies
ALTER TABLE public.user_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own board" 
ON public.user_boards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own board" 
ON public.user_boards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own board" 
ON public.user_boards 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own board" 
ON public.user_boards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Custom Advisors Policies
ALTER TABLE public.custom_advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom advisors" 
ON public.custom_advisors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom advisors" 
ON public.custom_advisors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom advisors" 
ON public.custom_advisors 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom advisors" 
ON public.custom_advisors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Synthesis History Policies
ALTER TABLE public.synthesis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own synthesis history" 
ON public.synthesis_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own synthesis history" 
ON public.synthesis_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own synthesis history" 
ON public.synthesis_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Board Templates Policies
ALTER TABLE public.board_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public board templates" 
ON public.board_templates 
FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create board templates" 
ON public.board_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own board templates" 
ON public.board_templates 
FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own board templates" 
ON public.board_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_boards_user_id ON public.user_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_advisors_user_id ON public.custom_advisors(user_id);
CREATE INDEX IF NOT EXISTS idx_synthesis_history_user_id ON public.synthesis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_synthesis_history_created_at ON public.synthesis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_board_templates_category ON public.board_templates(category);
CREATE INDEX IF NOT EXISTS idx_board_templates_public ON public.board_templates(is_public);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_boards_updated_at 
    BEFORE UPDATE ON public.user_boards 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_advisors_updated_at 
    BEFORE UPDATE ON public.custom_advisors 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default board templates
INSERT INTO public.board_templates (name, description, advisor_ids, category, is_public) VALUES
('Startup Founder Board', 'Perfect for entrepreneurs starting their journey', ARRAY['naval', 'paul-graham', 'peter-thiel', 'reid-hoffman', 'elon-musk'], 'Business', true),
('Creative Visionary Board', 'For artists, writers, and creative professionals', ARRAY['steve-jobs', 'elizabeth-gilbert', 'julia-cameron', 'anne-lamott', 'seth-godin'], 'Creativity', true),
('Leadership Excellence Board', 'Build exceptional leadership skills', ARRAY['brene-brown', 'simon-sinek', 'tony-robbins', 'marshall-goldsmith', 'sheryl-sandberg'], 'Leadership', true),
('Wealth Building Board', 'Financial wisdom and investment strategy', ARRAY['warren-buffett', 'ray-dalio', 'robert-kiyosaki', 'dave-ramsey', 'naval'], 'Finance', true),
('Productivity Powerhouse Board', 'Optimize your time and energy', ARRAY['tim-ferriss', 'cal-newport', 'david-allen', 'marie-kondo', 'mel-robbins'], 'Productivity', true),
('Philosophy & Wisdom Board', 'Deep thinking and life principles', ARRAY['marcus-aurelius', 'ryan-holiday', 'jordan-peterson', 'daniel-kahneman', 'maya-angelou'], 'Philosophy', true),
('Marketing Masters Board', 'Build your brand and reach your audience', ARRAY['seth-godin', 'gary-vaynerchuk', 'russell-brunson', 'dan-kennedy', 'frank-kern'], 'Marketing', true),
('Innovation & Science Board', 'Breakthrough thinking and discovery', ARRAY['richard-feynman', 'neil-degrasse-tyson', 'bill-gates', 'clayton-christensen', 'daniel-ek'], 'Science', true)
ON CONFLICT DO NOTHING;