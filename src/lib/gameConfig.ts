import type { Upgrade } from '../components/ShopTab';

// ─── General defaults ─────────────────────────────────────────────────────────

export const STARTING_ENERGY = 100;
export const TAP_CAPACITY_MAX = 500;

// ─── Leveling system ─────────────────────────────────────────────────────────

/** Cap grows ×1.5 each level: Level 1 = 500, Level 2 = 750, Level 3 = 1125, … */
export function computeEnergyCapForLevel(level: number): number {
  return Math.floor(500 * Math.pow(1.5, level - 1));
}

/** kW remaining until the current cap is reached. */
export function kWToNextLevel(energy: number, level: number): number {
  return computeEnergyCapForLevel(level) - energy;
}

/** Progress toward the current cap, 0–100. */
export function levelProgress(energy: number, level: number): number {
  return (energy / computeEnergyCapForLevel(level)) * 100;
}
export const TAP_COST = 10;
export const TAP_REGEN_RATE = 10;

// ─── Battery / Tamagotchi system ──────────────────────────────────────────────

/** Percent of battery drained per hour (default: 5% → full battery lasts 20 h). */
export const BATTERY_DECAY_PER_HOUR = 5;

/** kW cost to restore battery to 100%. */
export const BATTERY_FEED_COST = 1000;

// ─── Visual evolution thresholds ─────────────────────────────────────────────

/** Peak-energy thresholds that unlock the next robot evolution tier. */
export const EVOLUTION_THRESHOLDS = [0, 10_000, 100_000, 1_000_000, 10_000_000] as const;

// ─── Daily reward streak ──────────────────────────────────────────────────────

/** kW rewarded for each day of a 7-day streak cycle (Day 1 → Day 7). */
export const DAILY_REWARDS = [1_000, 2_000, 5_000, 10_000, 15_000, 25_000, 50_000] as const;

// ─── Upgrade definitions ──────────────────────────────────────────────────────

export const DEFAULT_COST_SCALE = 1.8;

export interface UpgradeDefinition {
  id: string;
  name: string;
  baseCost: number;
  costScale?: number;
  clickBonus: number;
  passiveRate: number;
  icon: string;
  color: string;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'inverter',
    name: 'Потужніший інвертор',
    baseCost: 500,
    costScale: 1.7,
    clickBonus: 2,
    passiveRate: 5,
    icon: '🔌',
    color: 'linear-gradient(135deg, #64B5F6, #1976D2)',
  },
  {
    id: 'solar_panels',
    name: 'Більше панелей',
    baseCost: 4_000,
    costScale: 1.8,
    clickBonus: 3,
    passiveRate: 20,
    icon: '🔆',
    color: 'linear-gradient(135deg, #81C784, #388E3C)',
  },
  {
    id: 'battery_bank',
    name: 'Батарейний банк',
    baseCost: 40_000,
    costScale: 1.9,
    clickBonus: 4,
    passiveRate: 60,
    icon: '🔋',
    color: 'linear-gradient(135deg, #CE93D8, #7B1FA2)',
  },
  {
    id: 'solarchyk',
    name: 'Енергоефективний Солярчик',
    baseCost: 500_000,
    costScale: 2.2,
    clickBonus: 5,
    passiveRate: 200,
    icon: '🤖',
    color: 'linear-gradient(135deg, #FFD54F, #F57F17)',
  },
];

// ─── Config overrides (loaded from game_config table) ────────────────────────

export interface UpgradeOverride {
  baseCost?: number;
  passiveRate?: number;
}

export interface ConfigOverrides {
  upgradeOverrides?: Record<string, UpgradeOverride>;
  tapCost?: number;
  tapRegenRate?: number;
  batteryFeedCost?: number;
  batteryDecayPerHour?: number;
}

export function resolveConfig(overrides?: ConfigOverrides | null) {
  return {
    tapCost: overrides?.tapCost ?? TAP_COST,
    tapRegenRate: overrides?.tapRegenRate ?? TAP_REGEN_RATE,
    batteryFeedCost: overrides?.batteryFeedCost ?? BATTERY_FEED_COST,
    batteryDecayPerHour: overrides?.batteryDecayPerHour ?? BATTERY_DECAY_PER_HOUR,
  };
}

function resolveUpgradeDef(def: UpgradeDefinition, overrides?: ConfigOverrides | null): {
  baseCost: number;
  passiveRate: number;
  description: string;
} {
  const ov = overrides?.upgradeOverrides?.[def.id];
  const baseCost = ov?.baseCost ?? def.baseCost;
  const passiveRate = ov?.passiveRate ?? def.passiveRate;
  return {
    baseCost,
    passiveRate,
    description: `+${def.clickBonus}x click, +${passiveRate} kW/s passive`,
  };
}

export function buildInitialUpgrades(overrides?: ConfigOverrides | null): Upgrade[] {
  return UPGRADE_DEFINITIONS.map((def) => {
    const { baseCost, passiveRate, description } = resolveUpgradeDef(def, overrides);
    return {
      id: def.id,
      name: def.name,
      description,
      cost: baseCost,
      multiplier: def.clickBonus,
      passiveRate,
      owned: 0,
      icon: def.icon,
      color: def.color,
    };
  });
}

export function computeUpgradeCost(
  def: UpgradeDefinition,
  timesOwned: number,
  overrides?: ConfigOverrides | null
): number {
  const ov = overrides?.upgradeOverrides?.[def.id];
  const baseCost = ov?.baseCost ?? def.baseCost;
  const scale = def.costScale ?? DEFAULT_COST_SCALE;
  return Math.floor(baseCost * Math.pow(scale, timesOwned));
}
