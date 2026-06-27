-- Add skin system columns to players table
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS owned_skins  TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipped_skin TEXT   NOT NULL DEFAULT 'default';
