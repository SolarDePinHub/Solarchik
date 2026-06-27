-- Fix referral bonus: referrer now gets 50,000 per invite (same as the new player)
CREATE OR REPLACE FUNCTION award_referral_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    -- Bonus to new player (client also writes 50k directly, but trigger covers DB-only paths)
    UPDATE players SET energy = energy + 50000 WHERE id = NEW.id;

    -- Bonus + count to referrer
    UPDATE players
    SET energy = energy + 50000,
        referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NULL;
END;
$$;

-- Back-fill: give existing referrers the missing 40,000 per invite they already made
-- (they got 10k per invite, should have gotten 50k → +40k per referral)
UPDATE players
SET energy = energy + (referral_count * 40000)
WHERE referral_count > 0;
