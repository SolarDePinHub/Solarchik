-- Add pending_referral_bonus so the referrer gets their reward reliably
-- without the client's debounced sync overwriting the trigger's DB write.
ALTER TABLE players ADD COLUMN IF NOT EXISTS pending_referral_bonus BIGINT NOT NULL DEFAULT 0;

-- Update trigger: write to pending_referral_bonus instead of directly to energy.
-- The client reads and applies it on next load, then clears it atomically.
CREATE OR REPLACE FUNCTION award_referral_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    -- New player gets their 50k directly (client also writes it, but trigger is the fallback)
    UPDATE players SET energy = energy + 50000 WHERE id = NEW.id;

    -- Referrer: queue the bonus so the client applies it on next load,
    -- not via direct energy write (which the debounced sync would overwrite).
    UPDATE players
    SET pending_referral_bonus = pending_referral_bonus + 50000,
        referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NULL;
END;
$$;

-- Backfill: give Вадим and any other existing referrers their full pending bonus.
-- referral_count * 50000 is the total owed; we set it as pending so the client
-- applies it cleanly on next open (avoids the sync-overwrite race).
UPDATE players
SET pending_referral_bonus = referral_count * 50000
WHERE referral_count > 0;
