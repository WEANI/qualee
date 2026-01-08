-- Add is_admin column to merchants table
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set sowaxcom@gmail.com as admin
UPDATE public.merchants 
SET is_admin = true 
WHERE email = 'sowaxcom@gmail.com';

-- Verify
SELECT id, email, is_admin FROM public.merchants WHERE is_admin = true;
