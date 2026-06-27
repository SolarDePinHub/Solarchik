/*
# Add full game state to players table

## Summary
Extends the existing `players` table so it can persist every aspect of a
player's game state server-side (Supabase), replacing localStorage as the
source of truth. This allows the leaderboard to be accurate for all players
across sessions and devices.

## Changes to `players`

### New columns
| Column           | Type      | Default | Description |
|-----------------|-----------|---------|-------------|
| `telegram_id`   | text      | NULL    | Telegram user ID (optional – populated when running inside Telegram WebApp). Unique index enforced only on non-NULL rows. |
| `upgrades`      | jsonb     | '[]'    | Full serialised array of Upgrade objects (id, name, cost, owned, …). Loaded and saved by the client on every purchase. |
| `multiplier`    | integer   | 1       | Accumulated click multiplier derived from owned upgrades. |
| `passive_income`| integer   | 0       | kW/s passive income derived from owned upgrades. |
| `tap_capacity`  | integer   | 1000    | Current tap-energy reservoir (0–1000). |

### No destructive changes
All operations use `ADD COLUMN IF NOT EXISTS`. No existing columns are
modified or removed.

## Security
RLS policies are unchanged. The existing open policies (anon + authenticated
CRUD) cover the new columns automatically because policies apply at the row
level, not per-column.

## Notes
1. `telegram_id` uniqueness is enforced via a partial unique index
   (`WHERE telegram_id IS NOT NULL`) so that multiple NULL rows are allowed
   (players who join from a browser, not Telegram).
2. `upgrades` defaults to an empty JSONB array; clients always write the
   full array so there is no partial-update risk.
3. `multiplier` and `passive_income` are derived from `upgrades`, but storing
   them separately lets the leaderboard sort/filter by passive rate in future
   without re-aggregating JSONB.
*/

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS telegram_id   text,
  ADD COLUMN IF NOT EXISTS upgrades      jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS multiplier    integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS passive_income integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tap_capacity  integer NOT NULL DEFAULT 1000;

-- Partial unique index: two NULL values are not considered equal in SQL,
-- but we still use a partial index to catch duplicate non-NULL telegram IDs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_telegram_id
  ON players(telegram_id)
  WHERE telegram_id IS NOT NULL;
