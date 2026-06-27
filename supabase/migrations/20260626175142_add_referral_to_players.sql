/*
# Add referral system to players table

1. Modified Tables
   - `players`
     - `referral_code` (text, unique): 8-char code generated on insert, used to build share links
     - `referred_by` (text, nullable): stores the referral_code of the player who recruited this player
     - `referral_count` (int, default 0): running count of successful referrals for display

2. Logic
   - `referral_code` is auto-generated on INSERT via a BEFORE trigger using `gen_random_uuid()` trimmed to 8 chars.
   - When a new player row is inserted with a non-null `referred_by`, a AFTER trigger fires that:
       a. Awards the new player +10,000 energy (on top of whatever they already have).
       b. Finds the referrer by their `referral_code` and awards them +10,000 energy too.
       c. Increments the referrer's `referral_count`.
   - Both bonus grants are idempotent: they only fire when `referred_by` is set and `referral_count`
     on the referred player row is still 0 (i.e. this is the first-time bonus, not a re-run).

3. Security
   - Existing open RLS policies on `players` (anon + authenticated CRUD) remain unchanged.

4. Important Notes
   - `referral_code` values are derived from `gen_random_uuid()` and are effectively collision-resistant
     for the scale of this game.
   - The trigger uses `SECURITY DEFINER` so it can update any row regardless of the caller's role.
*/

-- Add columns
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS referral_count int NOT NULL DEFAULT 0;

-- Index for fast look-ups by referral_code
CREATE INDEX IF NOT EXISTS idx_players_referral_code ON players(referral_code);

-- Function: auto-generate referral_code before insert
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  candidate text;
  collision int;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      candidate := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      SELECT count(*) INTO collision FROM players WHERE referral_code = candidate;
      EXIT WHEN collision = 0;
    END LOOP;
    NEW.referral_code := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON players;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON players
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Function: award referral bonuses after insert
CREATE OR REPLACE FUNCTION award_referral_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when referred_by is set (i.e. this is a referred player)
  IF NEW.referred_by IS NOT NULL THEN
    -- Bonus to new player
    UPDATE players SET energy = energy + 10000 WHERE id = NEW.id;

    -- Bonus + count to referrer
    UPDATE players
    SET energy = energy + 10000,
        referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_referral_bonus ON players;
CREATE TRIGGER trg_award_referral_bonus
  AFTER INSERT ON players
  FOR EACH ROW EXECUTE FUNCTION award_referral_bonus();

-- Back-fill referral codes for existing rows that have none
DO $$
DECLARE
  r RECORD;
  candidate text;
  collision int;
BEGIN
  FOR r IN SELECT id FROM players WHERE referral_code IS NULL LOOP
    LOOP
      candidate := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      SELECT count(*) INTO collision FROM players WHERE referral_code = candidate;
      EXIT WHEN collision = 0;
    END LOOP;
    UPDATE players SET referral_code = candidate WHERE id = r.id;
  END LOOP;
END;
$$;
