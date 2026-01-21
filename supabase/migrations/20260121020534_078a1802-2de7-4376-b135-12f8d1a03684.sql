-- Add avatar_url column to profiles table for user profile display
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;