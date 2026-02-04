-- Create table for storing Google Drive OAuth tokens (encrypted at rest by Supabase)
CREATE TABLE public.drive_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drive_connections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own connection
CREATE POLICY "Users can view own drive connection"
ON public.drive_connections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own connection
CREATE POLICY "Users can insert own drive connection"
ON public.drive_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own connection
CREATE POLICY "Users can update own drive connection"
ON public.drive_connections
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own connection
CREATE POLICY "Users can delete own drive connection"
ON public.drive_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_drive_connections_updated_at
BEFORE UPDATE ON public.drive_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();