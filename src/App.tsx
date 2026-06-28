import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ClickerTab from './components/ClickerTab';
import ShopTab, { type Upgrade } from './components/ShopTab';
import SkinsTab from './components/SkinsTab';
import LeaderboardTab from './components/LeaderboardTab';
import BinanceBoostTab from './components/BinanceBoostTab';
import BottomNav from './components/BottomNav';
import ReferralTab from './components/ReferralTab';
import MaintenanceTab from './components/MaintenanceTab';
import MilestoneToast, { MILESTONES, type Milestone } from './components/MilestoneToast';
import LevelUpToast from './components/LevelUpToast';
import { AdminGuard } from './components/AdminDashboard';
import SceneBackground from './components/SceneBackground';
import { supabase, type Player } from './lib/supabase';
import {
  buildInitialUpgrades,
  computeUpgradeCost,
  UPGRADE_DEFINITIONS,
  EVOLUTION_THRESHOLDS,
  DAILY_REWARDS,
  STARTING_ENERGY,
  TAP_CAPACITY_MAX,
  resolveConfig,
  computeEnergyCapForLevel,
  levelProgress,
  kWToNextLevel,
  type ConfigOverrides,
} from './lib/gameConfig';
import {
  getSavedLang,
  saveLang,
  translations,
  type Lang,
} from './lib/i18n';
import { getSkinById, isChallengeUnlocked } from './lib/skins';

const ADMIN_TG_ID = '574814684';

type Tab = 'clicker' | 'shop' | 'leaderboard' | 'boost' | 'referral' | 'care' | 'skins';

const STORAGE_KEY = 'solarchik_state';
const PLAYER_ID_KEY = 'solarchik_player_id';

interface GameState {
  energy: number;
  tapProgress: number;
  multiplier: number;
  passiveIncome: number;
  tapCapacity: number;
  upgrades: Upgrade[];
  batteryLevel: number;
  peakEnergy: number;
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  totalEnergyEarned: number;
  level: number;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function mergeUpgrades(stored: unknown[], overrides?: ConfigOverrides | null): Upgrade[] {
  return buildInitialUpgrades(overrides).map((base) => {
    const saved = Array.isArray(stored)
      ? stored.find(
          (u): u is Record<string, unknown> =>
            typeof u === 'object' && u !== null && (u as Record<string, unknown>).id === base.id
        )
      : undefined;
    if (!saved) return base;
    const owned = typeof saved.owned === 'number' ? saved.owned : 0;
    const def = UPGRADE_DEFINITIONS.find((d) => d.id === base.id);
    const cost = def ? computeUpgradeCost(def, owned, overrides) : base.cost;
    return { ...base, owned, cost };
  });
}

function loadLocalState(overrides?: ConfigOverrides | null): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const upgrades = mergeUpgrades(parsed.upgrades ?? [], overrides);
      const passiveIncome = upgrades.reduce((sum, u) => sum + u.passiveRate * u.owned, 0);
      return {
        energy: parsed.energy ?? STARTING_ENERGY,
        tapProgress: parsed.tapProgress ?? 0,
        multiplier: parsed.multiplier ?? 1,
        passiveIncome,
        tapCapacity: parsed.tapCapacity ?? TAP_CAPACITY_MAX,
        upgrades,
        batteryLevel: parsed.batteryLevel ?? 100,
        dailyStreak: parsed.dailyStreak ?? 0,
        lastDailyClaimDate: parsed.lastDailyClaimDate ?? null,
        totalEnergyEarned: parsed.totalEnergyEarned ?? parsed.energy ?? 0,
        level: parsed.level ?? 1,
      };
    }
  } catch { /* ignore */ }
  return {
    energy: STARTING_ENERGY,
    tapProgress: 0,
    multiplier: 1,
    passiveIncome: 0,
    tapCapacity: TAP_CAPACITY_MAX,
    upgrades: buildInitialUpgrades(overrides),
    batteryLevel: 100,
    peakEnergy: 0,
    dailyStreak: 0,
    lastDailyClaimDate: null,
    totalEnergyEarned: 0,
    level: 1,
  };
}

function computeEvolveTier(peakEnergy: number, upgrades: Upgrade[]): 0 | 1 | 2 | 3 | 4 {
  const totalOwned = upgrades.reduce((sum, u) => sum + u.owned, 0);
  const hasSolarchyk = (upgrades.find((u) => u.id === 'solarchyk')?.owned ?? 0) > 0;
  const upgradeBasedTier = hasSolarchyk ? 3 : totalOwned >= 5 ? 2 : totalOwned >= 1 ? 1 : 0;
  const energyBasedTier =
    peakEnergy >= EVOLUTION_THRESHOLDS[4] ? 4
    : peakEnergy >= EVOLUTION_THRESHOLDS[3] ? 3
    : peakEnergy >= EVOLUTION_THRESHOLDS[2] ? 2
    : peakEnergy >= EVOLUTION_THRESHOLDS[1] ? 1
    : 0;
  return Math.max(upgradeBasedTier, energyBasedTier) as 0 | 1 | 2 | 3 | 4;
}

const pageVariants = { initial: { opacity: 0, x: 40 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -40 } };
const pageTransition = { type: 'spring' as const, stiffness: 280, damping: 28 };

/** Returns `fallback` if `v` is NaN, Infinity, null, or undefined. */
function safeNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const AVATARS = ['👤', '😎', '🤖', '🦊', '🐉', '☀️', '⚡', '🌟', '🚀', '🔥'];

function generatePlayerName() {
  const adj = ['Solar', 'Crypto', 'Degen', 'Moon', 'Pixel', 'Neon', 'Cyber', 'Quantum'];
  const noun = ['King', 'Master', 'Pro', 'Hero', 'Trader', 'Hodler', 'Whale', 'Shark'];
  return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 999)}`;
}

function getTelegramId(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return tg != null ? String(tg) : null;
  } catch { return null; }
}

function getTelegramName(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return null;
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    if (user.username) return `@${user.username}`;
    return null;
  } catch { return null; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('clicker');
  const [configOverrides, setConfigOverrides] = useState<ConfigOverrides | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => loadLocalState(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [levelUpNotif, setLevelUpNotif] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>(getSavedLang);
  // Standalone primitive state for the energy display. Updating a number
  // triggers a dedicated, isolated re-render — not batched with the dozen
  // other fields inside gameState. This is what the energy counter reads.
  const [currentEnergy, setCurrentEnergy] = useState<number>(() => loadLocalState(null).energy);
  const [displayTapProgress, setDisplayTapProgress] = useState<number>(() => loadLocalState(null).tapProgress);
  // Incremented after every successful Supabase write to force a re-render
  // confirming the UI reflects what was actually persisted.
  const [syncVersion, setSyncVersion] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [equippedSkinId, setEquippedSkinId] = useState<string>('default');
  useEffect(() => { isSyncingRef.current = isSyncing; }, [isSyncing]);

  const seenMilestonesRef = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('solarchik_milestones') ?? '[]'))
  );
  const prevLevelRef = useRef<number>(gameState.level);
  const initializedRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const gameStateRef = useRef(gameState);
  const currentPlayerRef = useRef<Player | null>(null);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);

  const cfg = resolveConfig(configOverrides);
  const evolveTier = computeEvolveTier(gameState.peakEnergy, gameState.upgrades);
  const currentLevel = gameState.level;
  const energyCap = computeEnergyCapForLevel(gameState.level);
  const t = translations[lang];

  const skinBoostMultiplier = 1 + (getSkinById(equippedSkinId).boostPercent / 100);
  const skinBoostMultiplierRef = useRef(skinBoostMultiplier);
  useEffect(() => { skinBoostMultiplierRef.current = skinBoostMultiplier; }, [skinBoostMultiplier]);

  const handleLangSwitch = useCallback(() => {
    setLang((l) => {
      const next: Lang = l === 'en' ? 'uk' : 'en';
      saveLang(next);
      return next;
    });
  }, []);

  // currentEnergy is updated directly at every site that changes energy.
  // No useEffect synchronizer — that pattern causes tap updates to be overwritten
  // when gameState.energy changes in the same render batch.

  // ─── Load game_config ─────────────────────────────────────────────────────

  useEffect(() => {
    async function loadGameConfig() {
      const { data } = await supabase.from('game_config').select('*').eq('id', 1).maybeSingle();
      if (!data) return;
      const overrides: ConfigOverrides = {
        tapCost: data.tap_cost, tapRegenRate: data.tap_regen_rate,
        upgradeOverrides: data.upgrade_overrides as ConfigOverrides['upgradeOverrides'],
        batteryFeedCost: data.battery_feed_cost,
        batteryDecayPerHour: data.battery_decay_per_hour,
      };
      setConfigOverrides(overrides);
      setGameState((s) => {
        const upgrades = mergeUpgrades(s.upgrades.map(({ id, owned }) => ({ id, owned })), overrides);
        const passiveIncome = upgrades.reduce((sum, u) => sum + u.passiveRate * u.owned, 0);
        return { ...s, upgrades, passiveIncome };
      });
    }
    loadGameConfig();
  }, []);

  // ─── Connection heartbeat ─────────────────────────────────────────────────
  // Runs once when currentPlayer is first set. Logs auth session, player ID,
  // and a live DB read so any RLS/connection issue is immediately visible.

  useEffect(() => {
    if (!currentPlayer) return;
    async function heartbeat() {
      const playerId = currentPlayer!.id;

      // 1. Auth session — this app uses the anon key (no sign-in), so session
      //    will be null. RLS policies must allow the 'anon' role, not auth.uid().
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('[heartbeat] auth session:', sessionData?.session ?? null);
      if (sessionError) console.warn('[heartbeat] auth session error:', sessionError);
      const role = sessionData?.session ? 'authenticated' : 'anon (no session)';
      console.log('[heartbeat] effective DB role:', role);

      // 2. Player ID being used for all DB queries
      console.log('[heartbeat] player id:', playerId);
      console.log('[heartbeat] player id source (localStorage):', localStorage.getItem(PLAYER_ID_KEY));

      // 3. Live read of the player row
      console.log('[heartbeat] fetching players row…');
      const response = await supabase.from('players').select('*').eq('id', playerId).single();
      console.log('[heartbeat] full DB response:', response);
      if (response.error) {
        console.error(
          '[heartbeat] READ FAILED — code:', response.error.code,
          '| message:', response.error.message,
          '| hint:', response.error.hint,
          '| details:', response.error.details,
        );
      } else {
        console.log('[heartbeat] READ OK — DB energy:', response.data.energy, '| react state energy:', currentPlayer!.energy);
      }
    }
    heartbeat();
  }, [currentPlayer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Supabase sync ────────────────────────────────────────────────────────

  const syncToSupabase = useCallback(async (state: GameState, playerId: string) => {
    const newEnergy = state.energy;
    console.log('Syncing energy to Supabase:', newEnergy);
    try {
      const { error } = await supabase.from('players').update({
        energy: newEnergy,
        tap_progress: state.tapProgress,
        upgrades: state.upgrades.map(({ id, owned }) => ({ id, owned })),
        multiplier: state.multiplier,
        passive_income: state.passiveIncome,
        tap_capacity: state.tapCapacity,
        battery_level: state.batteryLevel,
        total_energy_earned: state.totalEnergyEarned,
        player_level: state.level,
        updated_at: new Date().toISOString(),
      }).eq('id', playerId);

      if (error) {
        console.error('[syncToSupabase] update failed:', error.code, error.message, error);
        return;
      }

      // Read back to confirm what actually landed in the DB
      const { data: confirmed, error: readErr } = await supabase
        .from('players').select('energy').eq('id', playerId).single();
      if (readErr) {
        console.warn('[syncToSupabase] write OK but read-back failed:', readErr.message);
      } else {
        const dbEnergy = Number(confirmed.energy);
        console.log('[syncToSupabase] confirmed DB energy after write:', dbEnergy, '(sent:', newEnergy, ')');
        if (dbEnergy !== newEnergy) {
          console.warn('[syncToSupabase] MISMATCH — DB has', dbEnergy, 'but we sent', newEnergy);
        }
        // Only advance currentEnergy to the DB value — never roll it back
        // unless a bonus write has already set a higher authoritative value.
        // isSyncing=true means a bonus/daily write is in flight; skip the
        // debounced sync read-back so it cannot overwrite the bonus value.
        setCurrentEnergy((prev) => {
          if (safeNum(dbEnergy, 0) > safeNum(prev, 0)) return safeNum(dbEnergy, 0);
          return prev;
        });
      }

      // Increment version to force a re-render confirming persisted state.
      setSyncVersion((v) => v + 1);
    } catch (err) {
      console.error('[syncToSupabase] unexpected error:', err);
    }
  }, [setCurrentEnergy, setSyncVersion]);

  useEffect(() => {
    if (!initializedRef.current || !currentPlayer) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      if (isSyncingRef.current) return; // bonus/daily write in flight — skip
      syncToSupabase(gameState, currentPlayer.id);
    }, 1500);
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [gameState, currentPlayer, syncToSupabase]);

  // ─── Player init ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function initPlayer() {
      const params = new URLSearchParams(window.location.search);
      // Telegram passes ?startapp= value via initDataUnsafe.start_param (not URL query string)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tgStartParam: string | null = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param ?? null;
      const rawStart = tgStartParam ?? params.get('start') ?? params.get('tgWebAppStartParam');
      const refCode = rawStart?.startsWith('ref_')
        ? rawStart.slice(4)
        : params.get('ref');
      const telegramId = getTelegramId();
      const playerId = localStorage.getItem(PLAYER_ID_KEY);

      if (playerId || telegramId) {
        let q = supabase.from('players').select('*');
        q = playerId ? q.eq('id', playerId) : q.eq('telegram_id', telegramId!);
        const { data, error } = await q.maybeSingle();

        if (!error && data) {
          const storedUpgrades = mergeUpgrades(data.upgrades as unknown[] ?? [], configOverrides);
          const passiveIncome = storedUpgrades.reduce((sum, u) => sum + u.passiveRate * u.owned, 0);
          const cfgNow = resolveConfig(configOverrides);
          const totalEarned = data.total_energy_earned ?? data.energy ?? 0;
          const restoredState: GameState = {
            energy: Math.max(gameStateRef.current.energy, data.energy),
            tapProgress: data.tap_progress ?? gameStateRef.current.tapProgress ?? 0,
            multiplier: data.multiplier ?? 1,
            passiveIncome,
            tapCapacity: data.tap_capacity ?? TAP_CAPACITY_MAX,
            upgrades: storedUpgrades,
            batteryLevel: typeof data.battery_level === 'number' ? data.battery_level : 100,
            dailyStreak: data.daily_streak ?? 0,
            lastDailyClaimDate: data.last_daily_claim ?? null,
            totalEnergyEarned: totalEarned,
            level: data.player_level ?? 1,
          };
          prevLevelRef.current = restoredState.level;

          // Keep name in sync with Telegram account on every login
          const tgName = getTelegramName();
          if (tgName && tgName !== data.name) {
            supabase.from('players').update({ name: tgName }).eq('id', data.id).then(() => {});
            data.name = tgName;
          }

          // Apply and clear any pending referral bonus (set by DB trigger when someone
          // joins via this player's link). We do it here so the debounced sync can't
          // overwrite it before it's applied.
          const pendingBonus = safeNum(data.pending_referral_bonus, 0);
          if (pendingBonus > 0) {
            restoredState.energy += pendingBonus;
            restoredState.totalEnergyEarned += pendingBonus;
            restoredState.peakEnergy = Math.max(restoredState.peakEnergy ?? 0, restoredState.energy);
            // Write to DB atomically: update energy and clear pending bonus in one call
            supabase.from('players').update({
              energy: restoredState.energy,
              total_energy_earned: restoredState.totalEnergyEarned,
              pending_referral_bonus: 0,
            }).eq('id', data.id).then(({ error: e }) => {
              if (e) console.error('[initPlayer] pending bonus write failed:', e.message);
            });
          }

          setGameState(restoredState);
          setCurrentEnergy(safeNum(restoredState.energy, 0));
          setDisplayTapProgress(safeNum(restoredState.tapProgress, 0));
          setCurrentPlayer(data);
          // Load skin data
          if (Array.isArray(data.owned_skins)) setOwnedSkins(data.owned_skins as string[]);
          if (data.equipped_skin) setEquippedSkinId(data.equipped_skin as string);
          localStorage.setItem(PLAYER_ID_KEY, data.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredState));
          initializedRef.current = true;
          return;
        }
      }

      const local = gameStateRef.current;
      const cfgNow = resolveConfig(configOverrides);
      const tgName = getTelegramName();
      const newPlayer: Record<string, unknown> = {
        name: tgName ?? generatePlayerName(),
        energy: local.energy,
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        is_you: true, upgrades: [], multiplier: 1, passive_income: 0,
        tap_capacity: TAP_CAPACITY_MAX,
        battery_level: 100, peak_energy: 0, daily_streak: 0,
        total_energy_earned: 0, player_level: 1,
      };
      if (telegramId) newPlayer.telegram_id = telegramId;
      if (refCode) newPlayer.referred_by = refCode;

      const { data, error } = await supabase.from('players').insert(newPlayer).select().single();
      if (error) { console.error('Failed to create player:', error); return; }

      localStorage.setItem(PLAYER_ID_KEY, data.id);
      setCurrentPlayer(data);

      if (refCode) {
        const bonusEnergy = (local.energy ?? 0) + 50000;
        setGameState((s) => ({
          ...s,
          energy: bonusEnergy,
          peakEnergy: Math.max(s.peakEnergy, bonusEnergy),
          totalEnergyEarned: bonusEnergy,
        }));
        setCurrentEnergy(bonusEnergy);
        setBonusClaimed(true);

        // Persist immediately — debounced sync won't fire until initializedRef=true,
        // so without this direct write the bonus is lost on the next reload.
        await supabase.from('players').update({
          energy: bonusEnergy,
          total_energy_earned: bonusEnergy,
        }).eq('id', data.id);

        const url = new URL(window.location.href);
        url.searchParams.delete('ref');
        url.searchParams.delete('start');
        window.history.replaceState({}, '', url.toString());
      }

      await supabase.from('players').update({ is_you: false }).neq('id', data.id);
      initializedRef.current = true;
    }

    initPlayer().catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Local persistence ────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // ─── Level-up detection ───────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.level > prevLevelRef.current) {
      prevLevelRef.current = gameState.level;
      setLevelUpNotif(gameState.level);
      setTimeout(() => setLevelUpNotif(null), 3000);
    }
  }, [gameState.level]);

  // Sync display energy to carry-over value after a level-up.
  useEffect(() => {
    setCurrentEnergy(gameState.energy);
    setDisplayTapProgress(gameState.tapProgress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.level]);

  // ─── Passive income tick ──────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.passiveIncome <= 0) return;
    const id = setInterval(() => {
      setGameState((s) => {
        if (s.batteryLevel <= 0) return s;
        const gained = Math.ceil(s.passiveIncome * skinBoostMultiplierRef.current);
        const newEnergy = s.energy + gained;
        return {
          ...s,
          energy: newEnergy,
          peakEnergy: Math.max(s.peakEnergy, newEnergy),
          totalEnergyEarned: s.totalEnergyEarned + gained,
        };
      });
      setCurrentEnergy((prev) => {
        const s = gameStateRef.current;
        if (s.batteryLevel <= 0) return prev;
        return prev + Math.ceil(s.passiveIncome * skinBoostMultiplierRef.current);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameState.passiveIncome]);

  // ─── Battery decay ────────────────────────────────────────────────────────
  useEffect(() => {
    const decayPerSecond = cfg.batteryDecayPerHour / 3600;
    const id = setInterval(() => {
      setGameState((s) => {
        if (s.batteryLevel <= 0) return s;
        return { ...s, batteryLevel: Math.max(0, s.batteryLevel - decayPerSecond) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cfg.batteryDecayPerHour]);

  // ─── Tap capacity regen ───────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setGameState((s) =>
        s.tapCapacity >= TAP_CAPACITY_MAX
          ? s
          : { ...s, tapCapacity: Math.min(TAP_CAPACITY_MAX, s.tapCapacity + cfg.tapRegenRate) }
      );
    }, 1000);
    return () => clearInterval(id);
  }, [cfg.tapRegenRate]);

  // ─── Milestone detection ──────────────────────────────────────────────────
  useEffect(() => {
    for (const ms of MILESTONES) {
      if (gameState.energy >= ms.threshold && !seenMilestonesRef.current.has(ms.id)) {
        seenMilestonesRef.current.add(ms.id);
        localStorage.setItem('solarchik_milestones', JSON.stringify([...seenMilestonesRef.current]));
        setActiveMilestone(ms);
        break;
      }
    }
  }, [gameState.energy]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleTap = useCallback(() => {
    const s = gameStateRef.current;
    if (s.tapCapacity < cfg.tapCost) {
      console.log('[App handleTap] blocked — tapCapacity', s.tapCapacity, '< tapCost', cfg.tapCost);
      return;
    }

    const gained = Math.ceil(safeNum(s.multiplier, 1) * skinBoostMultiplierRef.current);
    const cap = computeEnergyCapForLevel(s.level);
    const newTapProgress = s.tapProgress + gained;
    const wrappedProgress = newTapProgress >= cap ? newTapProgress - cap : newTapProgress;
    const newLevel = newTapProgress >= cap ? s.level + 1 : s.level;

    // Synchronously update the ref so rapid taps always see accurate state
    // for both the capacity guard and the progress/level computation.
    gameStateRef.current = {
      ...s,
      tapCapacity: s.tapCapacity - cfg.tapCost,
      tapProgress: wrappedProgress,
      level: newLevel,
      batteryLevel: Math.max(0, s.batteryLevel - 1),
    };

    // Optimistic display updates — reflected immediately before the committed
    // setGameState render cycle completes.
    setCurrentEnergy((prev) => safeNum(prev, 0) + gained);
    setDisplayTapProgress(wrappedProgress);

    setGameState((prev) => {
      const prevCap = computeEnergyCapForLevel(prev.level);
      const prevGained = prev.multiplier;
      const newEnergy = prev.energy + prevGained;
      const newPrevTapProgress = prev.tapProgress + prevGained;
      const newTotalEarned = prev.totalEnergyEarned + prevGained;
      const newTapCapacity = Math.max(0, prev.tapCapacity - cfg.tapCost);
      const newBatteryLevel = Math.max(0, prev.batteryLevel - 1);
      if (newPrevTapProgress >= prevCap) {
        return {
          ...prev,
          energy: newEnergy,
          tapProgress: newPrevTapProgress - prevCap,
          level: prev.level + 1,
          tapCapacity: newTapCapacity,
          batteryLevel: newBatteryLevel,
          peakEnergy: Math.max(prev.peakEnergy, newEnergy),
          totalEnergyEarned: newTotalEarned,
        };
      }
      return {
        ...prev,
        energy: newEnergy,
        tapProgress: newPrevTapProgress,
        tapCapacity: newTapCapacity,
        batteryLevel: newBatteryLevel,
        peakEnergy: Math.max(prev.peakEnergy, newEnergy),
        totalEnergyEarned: newTotalEarned,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.tapCost]);

  const handleFeed = useCallback(() => {
    setGameState((s) => {
      const cost = Math.floor(cfg.batteryFeedCost * Math.pow(1.5, s.level - 1));
      if (s.energy < cost || s.batteryLevel >= 100) return s;
      return {
        ...s,
        energy: s.energy - cost,
        batteryLevel: 100,
        totalEnergyEarned: s.totalEnergyEarned + cost,
      };
    });
    setCurrentEnergy((prev) => {
      const s = gameStateRef.current;
      const cost = Math.floor(cfg.batteryFeedCost * Math.pow(1.5, s.level - 1));
      if (prev < cost || s.batteryLevel >= 100) return prev;
      return prev - cost;
    });
  }, [cfg.batteryFeedCost]);

  const handleLongPress = useCallback(() => {
    const bonus = gameStateRef.current.multiplier * 5;
    setGameState((prev) => ({
      ...prev,
      energy: prev.energy + bonus,
      peakEnergy: Math.max(prev.peakEnergy ?? 0, prev.energy + bonus),
      totalEnergyEarned: prev.totalEnergyEarned + bonus,
    }));
    setCurrentEnergy((prev) => prev + bonus);
  }, []);

  const handleDailyClaim = useCallback(() => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    const s = gameStateRef.current;
    if (s.lastDailyClaimDate === today) return;

    const missedDay = s.lastDailyClaimDate !== null
      && s.lastDailyClaimDate !== yesterday;

    const newStreak = (!missedDay && s.lastDailyClaimDate === yesterday)
      ? s.dailyStreak + 1
      : 1;

    const claimedInCycle = s.dailyStreak === 0 ? 0 : missedDay ? 0 : s.dailyStreak % 7 === 0 ? 7 : s.dailyStreak % 7;
    const nextClaimIdx = missedDay ? 0 : claimedInCycle % 7;
    const reward = DAILY_REWARDS[nextClaimIdx];

    // Compute synchronously from committed state — no cap on wallet energy.
    const finalTotalEarned = s.totalEnergyEarned + reward;

    setGameState((prev) => ({
      ...prev,
      energy: prev.energy + reward,
      peakEnergy: Math.max(prev.peakEnergy ?? 0, prev.energy + reward),
      totalEnergyEarned: prev.totalEnergyEarned + reward,
      dailyStreak: newStreak,
      lastDailyClaimDate: today,
    }));
    // Use functional update so reward is always added on top of the current
    // display value — not on top of a potentially stale gameState.energy.
    setCurrentEnergy((prev) => prev + reward);

    setIsSyncing(true);
    setTimeout(() => {
      const playerId = localStorage.getItem(PLAYER_ID_KEY);
      if (playerId) {
        // gameStateRef already has prev.energy+reward applied by setGameState above,
        // so use it directly (do NOT add reward again).
        const snapshotEnergy = gameStateRef.current.energy;
        supabase.from('players').update({
          energy: snapshotEnergy,
          total_energy_earned: finalTotalEarned,
          daily_streak: newStreak,
          last_daily_claim: today,
          updated_at: new Date().toISOString(),
        }).eq('id', playerId)
          .then(async ({ error }) => {
            if (error) {
              console.error('[handleDailyClaim] update failed:', error.code, error.message);
              return;
            }
            const { data } = await supabase
              .from('players').select('energy').eq('id', playerId).single();
            // Only advance energy — never roll back the optimistic update
            if (data) setCurrentEnergy((prev) => Math.max(prev, safeNum(data.energy, snapshotEnergy)));
          })
          .catch((err) => console.error('[handleDailyClaim] unexpected error:', err))
          .finally(() => setIsSyncing(false));
      } else {
        setIsSyncing(false);
      }
    }, 0);
  }, []);

  const handleSkinPurchase = useCallback((skinId: string, price: number) => {
    const playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) return;

    setCurrentEnergy((prev) => Math.max(0, prev - price));
    setGameState((s) => ({
      ...s,
      energy: Math.max(0, s.energy - price),
    }));

    const newOwned = [...ownedSkins, skinId];
    setOwnedSkins(newOwned);
    setEquippedSkinId(skinId);

    supabase.from('players').update({
      energy: Math.max(0, gameStateRef.current.energy),
      owned_skins: newOwned,
      equipped_skin: skinId,
      updated_at: new Date().toISOString(),
    }).eq('id', playerId).then(({ error }) => {
      if (error) console.error('[handleSkinPurchase] failed:', error.message);
    });
  }, [ownedSkins]);

  const handleSkinEquip = useCallback((skinId: string) => {
    const playerId = localStorage.getItem(PLAYER_ID_KEY);
    setEquippedSkinId(skinId);
    if (!playerId) return;
    supabase.from('players').update({
      equipped_skin: skinId,
      updated_at: new Date().toISOString(),
    }).eq('id', playerId).then(({ error }) => {
      if (error) console.error('[handleSkinEquip] failed:', error.message);
    });
  }, []);

  const handleSkinUnlockChallenge = useCallback((skinId: string) => {
    const playerId = localStorage.getItem(PLAYER_ID_KEY);
    const newOwned = [...ownedSkins, skinId];
    setOwnedSkins(newOwned);
    setEquippedSkinId(skinId);
    if (!playerId) return;
    supabase.from('players').update({
      owned_skins: newOwned,
      equipped_skin: skinId,
      updated_at: new Date().toISOString(),
    }).eq('id', playerId).then(({ error }) => {
      if (error) console.error('[handleSkinUnlockChallenge] failed:', error.message);
    });
  }, [ownedSkins]);

  const handlePurchase = useCallback((upgradeId: string) => {
    const s = gameStateRef.current;
    const upgrade = s.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return;
    const cost = upgrade.cost;

    // Optimistic display update so the shop reflects the spend immediately.
    setCurrentEnergy((prev) => (prev >= cost ? prev - cost : prev));

    setGameState((s) => {
      const upgrade = s.upgrades.find((u) => u.id === upgradeId);
      if (!upgrade || s.energy < upgrade.cost) return s;

      const def = UPGRADE_DEFINITIONS.find((d) => d.id === upgradeId);
      const newOwned = upgrade.owned + 1;
      const newCost = def ? computeUpgradeCost(def, newOwned, configOverrides) : Math.floor(cost * 1.8);
      const newUpgrades = s.upgrades.map((u) =>
        u.id === upgradeId ? { ...u, owned: newOwned, cost: newCost } : u
      );
      const newPassiveIncome = newUpgrades.reduce((sum, u) => sum + u.passiveRate * u.owned, 0);
      const newTotalEarned = s.totalEnergyEarned + upgrade.cost;

      const newState = {
        ...s,
        energy: s.energy - upgrade.cost,
        multiplier: s.multiplier + upgrade.multiplier,
        passiveIncome: newPassiveIncome,
        upgrades: newUpgrades,
        totalEnergyEarned: newTotalEarned,
      };

      const playerId = localStorage.getItem(PLAYER_ID_KEY);
      if (playerId) {
        supabase.from('players').update({
          energy: newState.energy,
          upgrades: newUpgrades.map(({ id, owned }) => ({ id, owned })),
          multiplier: newState.multiplier,
          passive_income: newState.passiveIncome,
          total_energy_earned: newTotalEarned,
          player_level: newState.level,
          updated_at: new Date().toISOString(),
        }).eq('id', playerId).then(({ error }) => {
          if (error) console.error('[handlePurchase] update failed:', error.code, error.message);
        });
      }
      return newState;
    });
  }, [configOverrides]);

  const handleClaimBonus = useCallback(async (amount: number) => {
    // Prefer the player resolved during initPlayer (most reliable) over raw localStorage.
    const resolvedPlayer = currentPlayerRef.current;
    let confirmedId: string = resolvedPlayer?.id ?? localStorage.getItem(PLAYER_ID_KEY) ?? '';

    if (!confirmedId) {
      console.warn('[handleClaimBonus] no playerId available — aborting');
      return;
    }

    const s = gameStateRef.current;
    // Use the displayed energy as the base to avoid rolling back the display
    // if currentEnergy diverged above gameState.energy (e.g. after a sync readback).
    // We capture it here synchronously; the functional setCurrentEnergy below
    // will use the latest value at apply time.
    const optimisticEnergy = s.energy + amount;
    const optimisticPeak = Math.max(s.peakEnergy ?? 0, optimisticEnergy);
    const optimisticTotalEarned = s.totalEnergyEarned + amount;

    console.log('[handleClaimBonus] START',
      '| id:', confirmedId,
      '| from state:', !!resolvedPlayer,
      '| telegram_id:', getTelegramId() ?? 'none',
      '| amount:', amount,
      '| local energy before:', s.energy,
      '| target energy:', optimisticEnergy);

    // Optimistic local update — bonus goes to wallet (energy) only, no tapProgress.
    setGameState((prev) => ({
      ...prev,
      energy: prev.energy + amount,
      peakEnergy: Math.max(prev.peakEnergy ?? 0, prev.energy + amount),
      totalEnergyEarned: prev.totalEnergyEarned + amount,
    }));
    // Functional update so bonus is added on top of the current display value
    setCurrentEnergy((prev) => prev + amount);
    setIsSyncing(true);

    try {
    const updatePayload = {
      energy: optimisticEnergy,
      peak_energy: optimisticPeak,
      total_energy_earned: optimisticTotalEarned,
      updated_at: new Date().toISOString(),
    };

    // ── Step 1: try update by id ──────────────────────────────────────────────
    console.log('[handleClaimBonus] UPDATE | targeting id:', confirmedId);
    const { data: updatedRows, error: updateError } = await supabase
      .from('players')
      .update(updatePayload)
      .eq('id', confirmedId)
      .select('id, energy');

    console.log('[handleClaimBonus] UPDATE result | error:', updateError, '| rows:', updatedRows);

    if (updateError) {
      console.error('[handleClaimBonus] UPDATE ERROR | full error object:', updateError,
        '| code:', updateError.code, '| message:', updateError.message,
        '| details:', updateError.details, '| hint:', updateError.hint);
      return;
    }

    // ── Step 2: 0 rows → recover via telegram_id, then upsert if needed ──────
    if (!updatedRows || updatedRows.length === 0) {
      console.warn('[handleClaimBonus] UPDATE hit 0 rows — id', confirmedId, 'not found in DB');
      const telegramId = getTelegramId();
      console.log('[handleClaimBonus] attempting telegram_id recovery | tg:', telegramId ?? 'none');

      if (telegramId) {
        const { data: tgRow } = await supabase
          .from('players')
          .select('id')
          .eq('telegram_id', telegramId)
          .maybeSingle();

        console.log('[handleClaimBonus] telegram_id lookup result:', tgRow);

        if (tgRow) {
          // Correct the stored ID and retry the update.
          confirmedId = tgRow.id;
          localStorage.setItem(PLAYER_ID_KEY, confirmedId);
          console.log('[handleClaimBonus] recovered real id:', confirmedId, '— retrying UPDATE');

          const { data: retryRows, error: retryErr } = await supabase
            .from('players')
            .update(updatePayload)
            .eq('id', confirmedId)
            .select('id, energy');

          console.log('[handleClaimBonus] RETRY result | error:', retryErr, '| rows:', retryRows);

          if (retryErr || !retryRows?.length) {
            console.error('[handleClaimBonus] RETRY failed | error:', retryErr);
            return;
          }
        }
      }

      // No row found by id or telegram_id — upsert to create/repair the row.
      if (!telegramId || !(await supabase.from('players').select('id').eq('telegram_id', telegramId).maybeSingle()).data) {
        const upsertPayload = {
          id: confirmedId,
          name: resolvedPlayer?.name ?? 'Player',
          avatar: resolvedPlayer?.avatar ?? 'robot',
          telegram_id: getTelegramId() ?? null,
          is_you: true,
          upgrades: s.upgrades.map(({ id, owned }: { id: string; owned: number }) => ({ id, owned })),
          multiplier: s.multiplier,
          passive_income: s.passiveIncome,
          tap_capacity: s.tapCapacity,
          ...updatePayload,
        };

        console.log('[handleClaimBonus] UPSERT (no row found anywhere) | id:', confirmedId);
        const { data: upsertRows, error: upsertErr } = await supabase
          .from('players')
          .upsert(upsertPayload, { onConflict: 'id' })
          .select('id, energy');

        console.log('[handleClaimBonus] UPSERT result | error:', upsertErr, '| rows:', upsertRows);

        if (upsertErr || !upsertRows?.length) {
          console.error('[handleClaimBonus] UPSERT failed | error:', upsertErr);
          return;
        }
      }
    }

    // ── Step 3: read-after-write to confirm final DB value ───────────────────
    console.log('[handleClaimBonus] read-after-write | confirmedId:', confirmedId);
    const { data: newData, error: readError } = await supabase
      .from('players')
      .select('id, energy, peak_energy, total_energy_earned')
      .eq('id', confirmedId)
      .single();

    console.log('[handleClaimBonus] READ-AFTER-WRITE | error:', readError,
      '| db energy:', newData?.energy,
      '| optimistic was:', optimisticEnergy,
      '| match:', newData?.energy === optimisticEnergy ? 'YES' : 'NO — mismatch!');

    if (readError || !newData) {
      console.error('[handleClaimBonus] READ-AFTER-WRITE failed:', readError?.message);
      setCurrentEnergy(optimisticEnergy);
      return;
    }

    const dbEnergy = safeNum(newData.energy, optimisticEnergy);
    const dbPeak = safeNum(newData.peak_energy, optimisticPeak);
    const dbTotal = safeNum(newData.total_energy_earned, optimisticTotalEarned);

    // Only advance energy — never roll back the optimistic update
    setCurrentEnergy((prev) => Math.max(prev, dbEnergy));
    setGameState((prev) => ({
      ...prev,
      energy: Math.max(prev.energy, dbEnergy),
      peakEnergy: Math.max(prev.peakEnergy, dbPeak),
      totalEnergyEarned: Math.max(prev.totalEnergyEarned, dbTotal),
    }));
    } catch (err) {
      console.error('[handleClaimBonus] unexpected error:', err);
      setCurrentEnergy(optimisticEnergy);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    if (!window.confirm('Reset all game progress? This cannot be undone.')) return;

    const defaultState: GameState = {
      energy: STARTING_ENERGY,
      multiplier: 1,
      passiveIncome: 0,
      tapCapacity: TAP_CAPACITY_MAX,
      upgrades: buildInitialUpgrades(configOverrides),
      batteryLevel: 100,
      peakEnergy: 0,
      dailyStreak: 0,
      lastDailyClaimDate: null,
      totalEnergyEarned: 0,
      level: 1,
    };

    // Clear all local storage keys owned by this game
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('solarchik_milestones');
    seenMilestonesRef.current = new Set();
    prevLevelRef.current = 1;

    // Reset all React state atomically
    setGameState(defaultState);
    setCurrentEnergy(STARTING_ENERGY);
    setActiveMilestone(null);
    setLevelUpNotif(null);
    setSyncVersion((v) => v + 1);

    // Overwrite the DB row so the server matches the reset
    const playerId = currentPlayer?.id ?? localStorage.getItem(PLAYER_ID_KEY);
    if (playerId) {
      const { error } = await supabase.from('players').update({
        energy: STARTING_ENERGY,
        upgrades: [],
        multiplier: 1,
        passive_income: 0,
        tap_capacity: TAP_CAPACITY_MAX,
        battery_level: 100,
        charge_count: 0,
        peak_energy: 0,
        daily_streak: 0,
        last_daily_claim: null,
        total_energy_earned: 0,
        player_level: 1,
        updated_at: new Date().toISOString(),
      }).eq('id', playerId);
      if (error) {
        console.error('[handleReset] DB reset failed:', error.code, error.message);
      } else {
        console.log('[handleReset] DB reset OK for player', playerId);
      }
    }
  }, [configOverrides, currentPlayer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVote = useCallback(() => { setActiveTab('boost'); }, []);

  const telegramId = currentPlayer?.telegram_id ?? null;
  const isAdmin = telegramId === ADMIN_TG_ID;

  // ─── Admin overlay ────────────────────────────────────────────────────────

  if (showAdmin) {
    return (
      <div className="min-h-dvh flex flex-col w-full overflow-hidden">
        <motion.div
          className="flex flex-col flex-1"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <AdminGuard
            telegramId={telegramId}
            onClose={() => setShowAdmin(false)}
            t={t}
            onConfigChange={(overrides) => {
              setConfigOverrides(overrides);
              setGameState((s) => {
                const upgrades = mergeUpgrades(s.upgrades.map(({ id, owned }) => ({ id, owned })), overrides);
                const passiveIncome = upgrades.reduce((sum, u) => sum + u.passiveRate * u.owned, 0);
                return { ...s, upgrades, passiveIncome };
              });
            }}
          />
        </motion.div>
      </div>
    );
  }

  // ─── Main app ─────────────────────────────────────────────────────────────

  const renderSecondaryTab = () => {
    switch (activeTab) {
      case 'shop':
        return (
          <motion.div key="shop" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ShopTab
              energy={currentEnergy}
              upgrades={gameState.upgrades}
              onPurchase={handlePurchase}
              onBack={() => setActiveTab('clicker')}
              t={t}
            />
          </motion.div>
        );
      case 'leaderboard':
        return (
          <motion.div key="leaderboard" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <LeaderboardTab
              currentPlayerId={currentPlayer?.id ?? null}
              onBack={() => setActiveTab('clicker')}
              onVote={handleVote}
              t={t}
            />
          </motion.div>
        );
      case 'boost':
        return (
          <motion.div key="boost" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <BinanceBoostTab
              energy={gameState.energy}
              playerId={currentPlayer?.id ?? null}
              playerName={currentPlayer?.name ?? null}
              dailyStreak={gameState.dailyStreak}
              lastDailyClaimDate={gameState.lastDailyClaimDate}
              onClaimBonus={handleClaimBonus}
              onDailyClaim={handleDailyClaim}
              onBack={() => setActiveTab('clicker')}
              t={t}
            />
          </motion.div>
        );
      case 'referral':
        return (
          <motion.div key="referral" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ReferralTab
              playerId={currentPlayer?.id ?? null}
              referralCode={currentPlayer?.referral_code ?? null}
              referralCount={currentPlayer?.referral_count ?? 0}
              bonusClaimed={bonusClaimed}
              isAdmin={isAdmin}
              onBack={() => setActiveTab('clicker')}
              onOpenAdmin={() => setShowAdmin(true)}
              t={t}
            />
          </motion.div>
        );
      case 'care':
        return (
          <motion.div key="care" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <MaintenanceTab
              energy={gameState.energy}
              batteryLevel={gameState.batteryLevel}
              feedCost={Math.floor(cfg.batteryFeedCost * Math.pow(1.5, gameState.level - 1))}
              onFeed={handleFeed}
              dailyStreak={gameState.dailyStreak}
              lastDailyClaimDate={gameState.lastDailyClaimDate}
              evolveTier={evolveTier}
              peakEnergy={gameState.peakEnergy}
              onBack={() => setActiveTab('clicker')}
              t={t}
            />
          </motion.div>
        );
      case 'skins':
        return (
          <motion.div key="skins" className="flex flex-col flex-1"
            variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <SkinsTab
              energy={currentEnergy}
              ownedSkins={ownedSkins}
              equippedSkinId={equippedSkinId}
              totalEnergyEarned={gameState.totalEnergyEarned}
              level={gameState.level}
              lang={lang}
              onPurchase={handleSkinPurchase}
              onEquip={handleSkinEquip}
              onUnlockChallenge={handleSkinUnlockChallenge}
              onBack={() => setActiveTab('clicker')}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isClicker = activeTab === 'clicker';

  return (
    <div className="min-h-dvh flex flex-col w-full relative overflow-hidden"
      data-sync={syncVersion}
      style={{ background: isClicker ? '#1a0533' : 'radial-gradient(ellipse 80% 60% at 50% 30%, #1a4a7a 0%, #0d2a52 45%, #071830 100%)' }}>

      {/* Scene background — always mounted, hidden when not on clicker */}
      <div style={{ display: isClicker ? 'block' : 'none' }}>
        <SceneBackground />
      </div>

      {!isClicker && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(26,74,122,.0) 0%, rgba(7,24,48,.35) 100%)' }}
        />
      )}

      {/* ── ClickerTab: always mounted, shown/hidden via CSS ── */}
      <div
        className="flex flex-col flex-1 relative z-10"
        style={{ display: isClicker ? 'flex' : 'none', transform: 'translateZ(0)', willChange: 'transform' }}
      >
        <ClickerTab
          energy={currentEnergy}
          tapProgress={displayTapProgress}
          onTap={handleTap}
          onNavChange={setActiveTab}
          multiplier={gameState.multiplier}
          passiveIncome={gameState.passiveIncome}
          tapCapacity={gameState.tapCapacity}
          upgradeTier={evolveTier}
          batteryLevel={gameState.batteryLevel}
          level={currentLevel}
          energyCap={energyCap}
          levelProgress={levelProgress(gameState.energy, gameState.level)}
          kWToNextLevel={kWToNextLevel(gameState.energy, gameState.level)}
          lang={lang}
          onLangSwitch={handleLangSwitch}
          onReset={handleReset}
          isSyncing={isSyncing}
          onLongPress={handleLongPress}
          equippedSkinId={equippedSkinId}
          t={t}
        />
      </div>

      {/* ── Secondary tabs: mount/unmount on demand ── */}
      {!isClicker && (
        <div className="flex flex-col flex-1 relative z-10">
          <AnimatePresence mode="wait">{renderSecondaryTab()}</AnimatePresence>
        </div>
      )}

      <BottomNav active={activeTab} onTabChange={setActiveTab} t={t} hidden={isClicker} />
      <MilestoneToast milestone={activeMilestone} onDismiss={() => setActiveMilestone(null)} />
      <LevelUpToast level={levelUpNotif} t={t} onDismiss={() => {
        // Advance the ref to the dismissed level so the detection effect
        // cannot immediately re-trigger the same (or lower) level-up.
        if (levelUpNotif !== null) prevLevelRef.current = Math.max(prevLevelRef.current, levelUpNotif);
        setLevelUpNotif(null);
      }} />
    </div>
  );
}
