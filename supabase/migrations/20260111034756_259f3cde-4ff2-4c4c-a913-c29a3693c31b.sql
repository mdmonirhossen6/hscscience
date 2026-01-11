-- Create study_coach_settings table to store user preferences and notification settings
CREATE TABLE public.study_coach_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  batch TEXT NOT NULL CHECK (batch IN ('2026', '2027')),
  months_remaining INTEGER NOT NULL CHECK (months_remaining >= 1 AND months_remaining <= 24),
  completion_percentage INTEGER NOT NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'slightly_behind', 'high_risk')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_email TEXT,
  notification_time TIME NOT NULL DEFAULT '08:00:00',
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.study_coach_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own settings" 
ON public.study_coach_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.study_coach_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.study_coach_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON public.study_coach_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_study_coach_settings_updated_at
BEFORE UPDATE ON public.study_coach_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();