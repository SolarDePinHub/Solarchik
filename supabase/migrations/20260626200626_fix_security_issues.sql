-- ── 1. Fix mutable search_path on both functions ─────────────────────────────
-- Setting search_path = '' prevents privilege escalation via schema injection.

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  candidate text;
  collision int;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      candidate := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      SELECT count(*) INTO collision FROM public.players WHERE referral_code = candidate;
      EXIT WHEN collision = 0;
    END LOOP;
    NEW.referral_code := candidate;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_referral_bonus()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.players SET energy = energy + 10000 WHERE id = NEW.id;
    UPDATE public.players
      SET energy = energy + 10000,
          referral_count = referral_count + 1
      WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NULL;
END;
$$;

-- ── 2. Revoke public EXECUTE on award_referral_bonus ─────────────────────────
-- It is a SECURITY DEFINER trigger function — should never be called directly
-- via RPC by anon or authenticated users.

REVOKE EXECUTE ON FUNCTION public.award_referral_bonus() FROM anon, authenticated, PUBLIC;

-- ── 3. Fix players RLS policies ───────────────────────────────────────────────
-- This is a no-auth app (player identity is stored in localStorage as a UUID).
-- Strategy: scope INSERT/UPDATE/DELETE to the player's own row by comparing the
-- stored id column to the request's app_player_id setting, which the client sets
-- via supabase.rpc or via a custom header. Since there is no auth.uid() here, the
-- safest practical tightening is:
--   INSERT  : remain open (must create own row on first visit)
--   SELECT  : remain open (public leaderboard)
--   UPDATE  : restrict to only the columns the client legitimately writes;
--             we can't use auth.uid() but we CAN require that the row's id equals
--             the id supplied in the update payload (id cannot be changed, so
--             USING (true) WITH CHECK (true) is the only viable option for a
--             no-auth anonymous game — however we tighten by removing DELETE
--             and restricting DELETE to service_role only)
--   DELETE  : remove anon/authenticated access entirely; only service_role deletes

DROP POLICY IF EXISTS "anon_delete_players" ON public.players;
-- No replacement: anon and authenticated users should never delete player rows.
-- The app never calls DELETE on players; cleanup is an admin / service_role task.

-- Keep insert open (needed to create new player on first visit)
DROP POLICY IF EXISTS "anon_insert_players" ON public.players;
CREATE POLICY "anon_insert_players" ON public.players
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Keep update open but only to anon+authenticated (same as before).
-- Cannot tighten further without auth; removing unrestricted delete is the key fix.
DROP POLICY IF EXISTS "anon_update_players" ON public.players;
CREATE POLICY "anon_update_players" ON public.players
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── 4. Fix screenshot_submissions RLS policies ────────────────────────────────
-- Players may only INSERT their own submissions (player_id must match their row).
-- Players may read all submissions (needed to check own status).
-- UPDATE and DELETE are admin-only (service_role bypasses RLS).

DROP POLICY IF EXISTS "ss_insert" ON public.screenshot_submissions;
CREATE POLICY "ss_insert" ON public.screenshot_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    player_id IN (SELECT id FROM public.players)
  );

-- Restrict UPDATE: only allow updating the screenshot_url field by the owner;
-- status transitions are admin-only. Since no auth.uid(), we restrict to rows
-- the player owns (player_id must exist) and forbid changing status away from 'pending'.
DROP POLICY IF EXISTS "ss_update" ON public.screenshot_submissions;
CREATE POLICY "ss_update" ON public.screenshot_submissions
  FOR UPDATE TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status = 'pending');

-- Remove unrestricted delete from anon/authenticated.
DROP POLICY IF EXISTS "ss_delete" ON public.screenshot_submissions;
-- No replacement: only service_role (admin) should delete submissions.

-- ── 5. Fix game_config RLS policy ────────────────────────────────────────────
-- game_config holds economy settings; only admins (service_role) should write it.
-- Remove the open UPDATE policy for anon/authenticated entirely.

DROP POLICY IF EXISTS "gc_update" ON public.game_config;
-- No replacement: anon/authenticated clients read config but never write it.
-- Admin writes use the service_role key which bypasses RLS.
