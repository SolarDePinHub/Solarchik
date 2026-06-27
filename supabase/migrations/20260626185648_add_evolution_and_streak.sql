-- Visual evolution: track all-time peak energy for tier calculation
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS peak_energy bigint NOT NULL DEFAULT 0;

-- Daily reward streak system
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS daily_streak    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_daily_claim date;
