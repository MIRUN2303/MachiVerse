ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_phone_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON public.users(phone) WHERE phone IS NOT NULL;
