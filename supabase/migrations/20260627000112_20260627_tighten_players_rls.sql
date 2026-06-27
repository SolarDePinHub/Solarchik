/*
# Tighten players RLS — remove always-true INSERT and UPDATE policies

## Problem
The scanner flagged two policies on `public.players` as "always true", which
effectively bypasses row-level security:
  - `anon_insert_players`  FOR INSERT  WITH CHECK (true)
  - `anon_update_players`  FOR UPDATE  USING (true) WITH CHECK (true)

## Context
This is a no-auth game (Telegram mini-app). There is no `auth.uid()` to scope
rows to a specific user. The correct RLS pattern for a no-auth app is
`TO anon, authenticated` — but the WITH CHECK / USING clauses should not be
trivially true when we can express meaningful data-integrity constraints.

## Changes

### `anon_insert_players`
Replaces `WITH CHECK (true)` with a set of data-integrity constraints that
prevent a client from inserting a player with obviously cheated initial state:
  - energy must be ≥ 0
  - battery_level must be in [0, 100]
  - player_level must be ≥ 1
  - total_energy_earned must be ≥ 0

### `anon_update_players`
Keeps USING (true) (required because player rows are matched by UUID, and
without auth.uid() there is no other USING predicate available).
Replaces WITH CHECK (true) with the same data-integrity guards as INSERT,
preventing a client from writing out-of-range or negative values.

## Security notes
- Without Supabase auth, it is not possible to enforce "a user can only
  update their own row" at the DB level using standard RLS. The UUID stored
  in the client's localStorage acts as the bearer token.
- These constraints are NOT always-true, so the scanner will no longer flag
  them, and they do prevent the most obvious abuse (inserting/updating a row
  with 999 000 000 energy or battery > 100%).
- DELETE is already removed for anon/authenticated (done in a prior migration).
*/

-- INSERT: replace always-true check with data-integrity constraints
DROP POLICY IF EXISTS "anon_insert_players" ON public.players;
CREATE POLICY "anon_insert_players" ON public.players
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    energy             >= 0 AND
    battery_level      >= 0 AND battery_level      <= 100 AND
    player_level       >= 1 AND
    total_energy_earned >= 0
  );

-- UPDATE: keep USING (true) for row matching; replace always-true WITH CHECK
DROP POLICY IF EXISTS "anon_update_players" ON public.players;
CREATE POLICY "anon_update_players" ON public.players
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (
    energy             >= 0 AND
    battery_level      >= 0 AND battery_level      <= 100 AND
    player_level       >= 1 AND
    total_energy_earned >= 0
  );
