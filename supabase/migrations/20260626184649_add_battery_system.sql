-- Add battery_level to players
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS battery_level numeric NOT NULL DEFAULT 100;

-- Add battery economy settings to game_config
ALTER TABLE game_config
  ADD COLUMN IF NOT EXISTS battery_feed_cost    integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS battery_decay_per_hour numeric NOT NULL DEFAULT 5;
