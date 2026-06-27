-- ── screenshot_submissions ───────────────────────────────────────────────────
-- Stores Binance Boost screenshot submissions awaiting admin review.

CREATE TABLE screenshot_submissions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid        REFERENCES players(id) ON DELETE CASCADE,
  player_name text        NOT NULL DEFAULT '',
  screenshot_url text,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','rejected','claimed')),
  created_at  timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE screenshot_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ss_select" ON screenshot_submissions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "ss_insert" ON screenshot_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "ss_update" ON screenshot_submissions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ss_delete" ON screenshot_submissions
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX idx_screenshot_submissions_status ON screenshot_submissions(status);
CREATE INDEX idx_screenshot_submissions_player ON screenshot_submissions(player_id);


-- ── game_config ───────────────────────────────────────────────────────────────
-- Singleton row (id=1) holding admin-adjustable economy overrides.
-- The client app merges these on top of the static gameConfig.ts defaults.

CREATE TABLE game_config (
  id                integer     PRIMARY KEY DEFAULT 1,
  upgrade_overrides jsonb       NOT NULL DEFAULT '{}'::jsonb,
  -- format: {"upgradeId": {"baseCost": 500, "passiveRate": 5}, ...}
  tap_cost          integer     NOT NULL DEFAULT 10,
  tap_regen_rate    integer     NOT NULL DEFAULT 10,
  tap_capacity_max  integer     NOT NULL DEFAULT 1000,
  starting_energy   integer     NOT NULL DEFAULT 0,
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO game_config (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE game_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gc_select" ON game_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "gc_update" ON game_config
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
