/*
# Create players table for leaderboard

1. New Tables
- `players`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `energy` (bigint, not null, default 0)
  - `avatar` (text, not null, default '👤')
  - `is_you` (boolean, not null, default false) — marks the current user
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `players`.
- Allow anon + authenticated full CRUD since leaderboard data is intentionally public.
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  energy bigint NOT NULL DEFAULT 0,
  avatar text NOT NULL DEFAULT '👤',
  is_you boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_players" ON players;
CREATE POLICY "anon_select_players" ON players FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_players" ON players;
CREATE POLICY "anon_insert_players" ON players FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_players" ON players;
CREATE POLICY "anon_update_players" ON players FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_players" ON players;
CREATE POLICY "anon_delete_players" ON players FOR DELETE
  TO anon, authenticated USING (true);

-- Create index for leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_players_energy_desc ON players(energy DESC);
