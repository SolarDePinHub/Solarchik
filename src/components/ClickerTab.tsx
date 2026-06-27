import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RobotMascot, { type RobotMood } from './RobotMascot';
import { TAP_CAPACITY_MAX, TAP_COST } from '../lib/gameConfig';
import type { Lang, Translations } from '../lib/i18n';

const LAST_ACTIVE_KEY = 'solarchik_last_active';
const SLEEPY_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const CHARGE_DURATION_MS = 1400; // total long-press charge time
const CHARGE_STEP_MS = 70;       // interval tick
const LONG_PRESS_DELAY_MS = 500; // hold time before charging starts
const CHARGE_COOLDOWN_MS = 8000; // cooldown after successful charge

interface ClickerTabProps {
  energy: number;
  tapProgress: number;
  onTap: () => void;
  onLongPress: () => void;
  onNavChange: (tab: 'shop' | 'leaderboard' | 'boost' | 'care' | 'referral' | 'skins') => void;
  multiplier: number;
  passiveIncome: number;
  tapCapacity: number;
  upgradeTier?: 0 | 1 | 2 | 3 | 4;
  batteryLevel: number;
  level: number;
  energyCap: number;
  levelProgress: number;
  kWToNextLevel: number;
  lang: Lang;
  onLangSwitch: () => void;
  onReset: () => void;
  isSyncing?: boolean;
  equippedSkinId?: string;
  t: Translations;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

function GearIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      style={{ animation: spinning ? 'gear-spin 4s linear infinite' : undefined, flexShrink: 0 }}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#34d399" strokeWidth="2" fill="none" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="#34d399" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function ClickerTab({
  energy, tapProgress, onTap, onLongPress, onNavChange, multiplier, passiveIncome,
  tapCapacity, upgradeTier = 0, batteryLevel,
  level, energyCap, levelProgress, kWToNextLevel, lang, onLangSwitch, onReset, isSyncing = false, equippedSkinId, t,
}: ClickerTabProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const [mood, setMood] = useState<RobotMood>('normal');
  const [chargeProgress, setChargeProgress] = useState(0);
  const [wakeUpPending, setWakeUpPending] = useState(false);
  const [showChargeHint, setShowChargeHint] = useState(false);

  const [tapAnim, setTapAnim] = useState<'idle' | 'bounce' | 'jump' | 'spin'>('idle');
  const tapAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleId = useRef(0);
  const tapBtnRef = useRef<HTMLButtonElement>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chargeCooldownRef = useRef(false);
  const isChargingRef = useRef(false);

  // Inactivity detection
  useEffect(() => {
    const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) ?? '0');
    if (last > 0 && Date.now() - last > SLEEPY_THRESHOLD_MS) {
      setWakeUpPending(true);
      setMood('sleepy');
    }
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  }, []);

  // Show hint that long press is available (once, 2s after mount)
  useEffect(() => {
    const t = setTimeout(() => setShowChargeHint(true), 2000);
    const t2 = setTimeout(() => setShowChargeHint(false), 6000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const canTap = tapCapacity >= TAP_COST;
  const isBlockedBySyncing = isSyncing;
  const fillPct = (tapCapacity / TAP_CAPACITY_MAX) * 100;
  const batteryDead = batteryLevel <= 0;
  const capFillPct = Math.min(100, (tapProgress / energyCap) * 100);
  const capFull = tapProgress >= energyCap;

  const batteryColor =
    batteryLevel > 60 ? '#4ade80' :
    batteryLevel > 25 ? '#fbbf24' : '#f87171';

  const formatEnergy = (val: number) =>
    val >= 1_000_000 ? `${(val / 1_000_000).toFixed(2)}M`
    : val >= 1_000 ? val.toLocaleString()
    : `${val}`;

  const haptic = useCallback((pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
  }, []);

  const setMoodFor = useCallback((m: RobotMood, ms: number) => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    setMood(m);
    moodTimerRef.current = setTimeout(() => setMood('normal'), ms);
  }, []);

  const triggerTapAnim = useCallback(() => {
    if (tapAnimTimerRef.current) clearTimeout(tapAnimTimerRef.current);
    const anims: Array<'bounce' | 'jump' | 'spin'> = ['bounce', 'bounce', 'jump', 'bounce', 'spin', 'bounce', 'bounce', 'jump'];
    setTapAnim(anims[Math.floor(Math.random() * anims.length)]);
    tapAnimTimerRef.current = setTimeout(() => setTapAnim('idle'), 500);
  }, []);

  const stopCharge = useCallback(() => {
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (chargeIntervalRef.current) { clearInterval(chargeIntervalRef.current); chargeIntervalRef.current = null; }
    if (isChargingRef.current) {
      isChargingRef.current = false;
      setChargeProgress(0);
      setMood('normal');
    }
  }, []);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      // If long-press charging was in progress, cancel it (pointer-up already fires stopCharge)
      if (isChargingRef.current) return;

      // Wake-up interaction — first tap just wakes the robot, no energy
      if (wakeUpPending) {
        setWakeUpPending(false);
        haptic([20, 30, 20]);
        setMoodFor('happy', 1800);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        return;
      }

      if (!canTap) return;

      haptic(10);
      onTap();
      triggerTapAnim();
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 120);

      // Random reaction: wink or happy
      const reactions: RobotMood[] = ['wink', 'happy', 'happy', 'wink', 'normal', 'happy'];
      setMoodFor(reactions[Math.floor(Math.random() * reactions.length)], 480);

      const rect = tapBtnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? rect.left + rect.width / 2 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? rect.top + rect.height / 2 : e.clientY;

      const id = ++particleId.current;
      setParticles((p) => [...p, { id, x: clientX, y: clientY, value: multiplier }]);
      setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 900);
    },
    [onTap, multiplier, canTap, wakeUpPending, haptic, setMoodFor, triggerTapAnim]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (wakeUpPending || chargeCooldownRef.current || batteryDead) return;

    longPressTimerRef.current = setTimeout(() => {
      // Start charging
      haptic(30);
      isChargingRef.current = true;
      setMood('charging');
      let progress = 0;
      const steps = CHARGE_DURATION_MS / CHARGE_STEP_MS;
      chargeIntervalRef.current = setInterval(() => {
        progress += 100 / steps;
        const capped = Math.min(100, progress);
        setChargeProgress(capped);
        if (capped >= 100) {
          clearInterval(chargeIntervalRef.current!);
          chargeIntervalRef.current = null;
          isChargingRef.current = false;
          setChargeProgress(0);
          haptic([60, 40, 60]);
          onLongPress();
          chargeCooldownRef.current = true;
          setTimeout(() => { chargeCooldownRef.current = false; }, CHARGE_COOLDOWN_MS);
          setMoodFor('happy', 1400);
          // Burst particles from center
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2 - 60;
          for (let i = 0; i < 5; i++) {
            const id = ++particleId.current;
            setParticles((p) => [...p, { id, x: cx + (Math.random() - 0.5) * 80, y: cy + (Math.random() - 0.5) * 60, value: multiplier * 5 }]);
            setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 900);
          }
        }
      }, CHARGE_STEP_MS);
    }, LONG_PRESS_DELAY_MS);
  }, [wakeUpPending, batteryDead, haptic, onLongPress, setMoodFor, multiplier]);

  const handlePointerUp = useCallback(() => {
    stopCharge();
  }, [stopCharge]);

  return (
    <div className="flex flex-col items-center flex-1 relative overflow-hidden" style={{ isolation: 'isolate' }}>

      {/* ══════════════════════════════════════════════════════════════
           SUNNY SKY BACKGROUND
           ══════════════════════════════════════════════════════════════ */}

      {/* Sky gradient — bright cerulean at top, warm horizon at centre */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0,
        background: 'linear-gradient(180deg, #3ab4f2 0%, #74ccf4 20%, #aadffa 42%, #d4eef5 58%, #cde8b0 72%, #8ec96a 84%, #5aab35 100%)' }} />

      {/* Sun halo — outer soft glow */}
      <div className="absolute pointer-events-none" style={{ zIndex: 1, top: '6%', right: '18%',
        width: 110, height: 110, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,240,120,.0) 28%, rgba(255,210,60,.45) 55%, rgba(255,170,0,.0) 100%)',
        filter: 'blur(12px)' }} />

      {/* Sun rays — SVG rotating */}
      <motion.div className="absolute pointer-events-none" style={{ zIndex: 1, top: '3%', right: '15%', width: 80, height: 80 }}
        animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
        <svg viewBox="0 0 80 80" width="80" height="80">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i}
              x1="40" y1="6" x2="40" y2="14"
              stroke="rgba(255,220,60,.65)" strokeWidth="2.5" strokeLinecap="round"
              transform={`rotate(${i * 30} 40 40)`} />
          ))}
        </svg>
      </motion.div>

      {/* Sun body */}
      <motion.div className="absolute pointer-events-none" style={{ zIndex: 2, top: '5%', right: '18%',
        width: 56, height: 56, borderRadius: '50%',
        background: 'radial-gradient(circle at 42% 42%, #fff8c0 0%, #ffe040 38%, #ffb300 75%, #e07800 100%)' }}
        animate={{ boxShadow: [
          '0 0 22px 8px rgba(255,200,30,.65), 0 0 50px 20px rgba(255,160,0,.28)',
          '0 0 36px 14px rgba(255,220,60,.85), 0 0 80px 32px rgba(255,180,0,.4)',
          '0 0 22px 8px rgba(255,200,30,.65), 0 0 50px 20px rgba(255,160,0,.28)',
        ] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cloud 1 — large, lower-left of sky */}
      <div className="absolute pointer-events-none" style={{ zIndex: 3, top: '22%', left: '-2%', opacity: 0.96 }}>
        <div style={{ position: 'relative', width: 210, height: 78 }}>
          <div style={{ position: 'absolute', bottom: 0, left: 18, width: 175, height: 42, borderRadius: 999, background: 'rgba(255,255,255,.95)', filter: 'blur(1.5px)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 28, width: 115, height: 50, borderRadius: 999, background: 'rgba(255,255,255,.92)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 34, left: 52, width: 80, height: 46, borderRadius: 999, background: 'rgba(255,255,255,.88)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 38, left: 96, width: 60, height: 38, borderRadius: 999, background: 'rgba(255,255,255,.85)', filter: 'blur(1px)' }} />
          {/* Shadow underside */}
          <div style={{ position: 'absolute', bottom: -4, left: 18, width: 175, height: 14, borderRadius: 999, background: 'rgba(140,180,220,.28)', filter: 'blur(4px)' }} />
        </div>
      </div>

      {/* Cloud 2 — mid-right */}
      <div className="absolute pointer-events-none" style={{ zIndex: 3, top: '16%', right: '2%', opacity: 0.9 }}>
        <div style={{ position: 'relative', width: 155, height: 62 }}>
          <div style={{ position: 'absolute', bottom: 0, left: 12, width: 130, height: 34, borderRadius: 999, background: 'rgba(255,255,255,.92)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 20, width: 90, height: 40, borderRadius: 999, background: 'rgba(255,255,255,.88)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 26, left: 40, width: 62, height: 36, borderRadius: 999, background: 'rgba(255,255,255,.84)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: -3, left: 12, width: 130, height: 12, borderRadius: 999, background: 'rgba(140,180,220,.22)', filter: 'blur(3px)' }} />
        </div>
      </div>

      {/* Cloud 3 — small, upper right near sun */}
      <div className="absolute pointer-events-none" style={{ zIndex: 3, top: '8%', right: '42%', opacity: 0.75 }}>
        <div style={{ position: 'relative', width: 95, height: 40 }}>
          <div style={{ position: 'absolute', bottom: 0, left: 8, width: 80, height: 24, borderRadius: 999, background: 'rgba(255,255,255,.82)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 10, left: 14, width: 56, height: 28, borderRadius: 999, background: 'rgba(255,255,255,.78)', filter: 'blur(1px)' }} />
        </div>
      </div>

      {/* Distant hills — centre-right horizon */}
      <div className="absolute pointer-events-none" style={{ zIndex: 4,
        bottom: '40%', left: 0, right: 0, height: '18%',
        background: 'linear-gradient(180deg, #6ab54a 0%, #4e9e30 100%)',
        clipPath: 'polygon(0% 90%, 8% 50%, 18% 70%, 30% 30%, 45% 58%, 60% 22%, 72% 48%, 84% 28%, 95% 55%, 100% 40%, 100% 100%, 0% 100%)',
        opacity: 0.7 }} />

      {/* Ocean band */}
      <div className="absolute pointer-events-none" style={{ zIndex: 5,
        bottom: '36%', left: 0, right: 0, height: '10%',
        background: 'linear-gradient(180deg, #3fa8e8 0%, #2484cc 60%, #1a6aaa 100%)',
        clipPath: 'ellipse(110% 100% at 50% 0%)',
        opacity: 0.72 }} />

      {/* Beach / sand strip */}
      <div className="absolute pointer-events-none" style={{ zIndex: 6,
        bottom: '34%', left: 0, right: 0, height: '6%',
        background: 'linear-gradient(180deg, #e8d48a 0%, #c8b060 100%)',
        clipPath: 'polygon(0% 40%, 12% 10%, 28% 50%, 46% 15%, 62% 45%, 78% 18%, 92% 40%, 100% 20%, 100% 100%, 0% 100%)',
        opacity: 0.8 }} />

      {/* Near hills left */}
      <div className="absolute pointer-events-none" style={{ zIndex: 7,
        bottom: '18%', left: '-8%', width: '55%', height: '28%',
        background: 'linear-gradient(170deg, #72c248 0%, #4a9e28 55%, #357520 100%)',
        borderRadius: '45% 90% 0 0' }} />

      {/* Near hills right */}
      <div className="absolute pointer-events-none" style={{ zIndex: 7,
        bottom: '16%', right: '-10%', width: '52%', height: '26%',
        background: 'linear-gradient(170deg, #7aca50 0%, #52aa2e 55%, #3a8020 100%)',
        borderRadius: '90% 42% 0 0' }} />

      {/* Foreground grass band */}
      <div className="absolute pointer-events-none" style={{ zIndex: 8,
        bottom: 0, left: 0, right: 0, height: '22%',
        background: 'linear-gradient(180deg, #68c038 0%, #46960e 45%, #347008 100%)' }} />

      {/* Bottom dark fade — keeps UI readable */}
      <div className="absolute pointer-events-none" style={{ zIndex: 9,
        bottom: 0, left: 0, right: 0, height: '34%',
        background: 'linear-gradient(180deg, rgba(4,16,30,0) 0%, rgba(4,16,30,.78) 100%)' }} />

      {/* ── SOLAR CONTROL MODULE ─────────────────────────────────────── */}
      <div className="mx-3 mt-3 w-[calc(100%-1.5rem)] relative z-10">
        <div className="control-module px-4 pt-3 pb-2.5">
          <div className="absolute inset-0 metal-rim pointer-events-none rounded-[20px]" />

          {/* Row 1: title · level · lang */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-pixel text-[6px] text-sky-400/60 tracking-widest">SOLAR MODULE</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[6px] text-sky-400/50">{t.levelFull}</span>
                <span className="font-pixel text-sky-300 text-[10px]"
                  style={{ textShadow: '0 0 8px rgba(56,189,248,.7)' }}>{level}</span>
              </div>
              <button
                onClick={onLangSwitch}
                className="px-2 h-5 rounded flex items-center justify-center font-pixel text-[7px] text-sky-300/80 transition-colors"
                style={{ background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.25)' }}
              >
                {lang === 'en' ? 'UA' : 'EN'}
              </button>
            </div>
          </div>

          {/* Row 2: big energy + battery inline */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-pixel text-[6px] text-sky-400/50 tracking-widest">{t.currentEnergy}</p>
              <p className="font-pixel text-2xl leading-tight energy-glow text-sky-200 mt-0.5">
                {formatEnergy(energy)}<span className="text-yellow-300 text-base ml-1">kW</span>
              </p>
            </div>

            <div className="flex-shrink-0 w-28">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-pixel text-[6px]" style={{ color: 'rgba(56,189,248,.45)' }}>BATT</span>
                <span className="font-pixel text-[6px]" style={{ color: batteryColor }}>
                  {batteryDead ? '😴' : `${Math.round(batteryLevel)}%`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}>
                <motion.div className="h-full rounded-full transition-colors duration-700"
                  style={{ backgroundColor: batteryColor, boxShadow: `0 0 4px ${batteryColor}88` }}
                  animate={{ width: `${batteryLevel}%` }}
                  transition={{ type: 'tween', duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-pixel text-[6px]" style={{ color: 'rgba(56,189,248,.45)' }}>CAP</span>
                <span className="font-pixel text-[6px]" style={{ color: capFull ? '#fbbf24' : 'rgba(56,189,248,.65)' }}>
                  {formatEnergy(tapProgress)}/{formatEnergy(energyCap)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.18)' }}>
                <motion.div className="h-full rounded-full"
                  style={{
                    background: capFull ? 'linear-gradient(90deg,#fbbf24,#fde68a)' : 'linear-gradient(90deg,#0ea5e9,#38bdf8)',
                    boxShadow: capFull ? '0 0 5px rgba(251,191,36,.6)' : '0 0 5px rgba(56,189,248,.5)',
                  }}
                  animate={{ width: `${capFillPct}%` }}
                  transition={{ type: 'tween', duration: 0.35 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {capFull && (
              <motion.p
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="font-pixel text-[6px] text-yellow-300/80 text-center mt-1"
                style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
              >
                ⚡ FULL — LEVEL UP TO EXPAND
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Low battery hint */}
      <AnimatePresence>
        {batteryLevel < 20 && !capFull && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="font-pixel text-[7px] text-amber-300/80 text-center mt-1 px-4 relative z-10"
          >
            {batteryDead ? t.batteryDead : t.lowBattery}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── ROBOT AREA with flanking nav + stat panels ───────────────── */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full">

        {/* ── LEFT PANEL: GEN stat + 3 nav buttons ── */}
        <motion.div
          className="absolute left-2 flex flex-col items-center gap-1.5"
          style={{ width: 48 }}
          initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
        >
          <div className="w-full rounded-2xl px-1 py-2 flex flex-col items-center gap-0.5"
            style={{ background: 'rgba(14,28,56,.8)', border: '1px solid rgba(56,189,248,.22)', backdropFilter: 'blur(8px)', boxShadow: '0 0 10px rgba(251,191,36,.1)' }}>
            <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              animate={{ opacity: [1, 0.5, 1], filter: ['drop-shadow(0 0 3px #fde047)', 'drop-shadow(0 0 8px #fbbf24)', 'drop-shadow(0 0 3px #fde047)'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fde047" stroke="#fbbf24" strokeWidth="1" />
            </motion.svg>
            <span className="font-pixel text-[5px] text-sky-400/55 leading-none">GEN</span>
            <span className="font-pixel text-yellow-300 text-[9px] leading-none">{multiplier}×</span>
          </div>

          <div className="w-7 h-px" style={{ background: 'rgba(56,189,248,.18)' }} />

          {([
            { id: 'leaderboard' as const, icon: '🏆', label: 'TOP' },
            { id: 'shop'        as const, icon: '🛒', label: 'SHOP' },
            { id: 'referral'    as const, icon: '🔗', label: 'REFER' },
          ]).map((tab) => (
            <motion.button key={tab.id}
              onClick={() => onNavChange(tab.id)}
              whileTap={{ scale: 0.88 }}
              className="w-full rounded-xl flex flex-col items-center py-2 gap-0.5"
              style={{ background: 'rgba(14,28,56,.65)', border: '1px solid rgba(56,189,248,.18)', backdropFilter: 'blur(8px)', cursor: 'pointer' }}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="font-pixel leading-none" style={{ fontSize: 5, color: 'rgba(148,163,184,.65)' }}>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Robot + pedestal */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Charge progress ring */}
            <AnimatePresence>
              {chargeProgress > 0 && (
                <motion.svg
                  className="absolute pointer-events-none z-20"
                  width="270" height="270"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Background ring */}
                  <circle cx="135" cy="135" r="125" fill="none"
                    stroke="rgba(255,215,0,0.15)" strokeWidth="6"/>
                  {/* Progress ring */}
                  <circle cx="135" cy="135" r="125" fill="none"
                    stroke="#FFD700" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 125 * chargeProgress / 100} ${2 * Math.PI * 125}`}
                    transform="rotate(-90 135 135)"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' }}
                  />
                  {/* Percentage text */}
                  <text x="135" y="14" textAnchor="middle" fill="#FFD700"
                    fontSize="12" fontFamily="monospace" fontWeight="bold"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.9))' }}>
                    {Math.round(chargeProgress)}%
                  </text>
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Wake-up overlay hint */}
            <AnimatePresence>
              {wakeUpPending && (
                <motion.div
                  className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none"
                  style={{ paddingBottom: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="font-pixel text-[8px] text-white/90 text-center px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(15,30,60,0.75)', border: '1px solid rgba(56,189,248,.3)', backdropFilter: 'blur(6px)' }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    {lang === 'uk' ? '👆 Погладь мене!' : '👆 Pet me to wake up!'}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              onClick={handleTap}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
              animate={
                mood === 'charging'
                  ? { scale: [1, 1.04, 1], filter: ['drop-shadow(0 0 18px rgba(255,215,0,.6))', 'drop-shadow(0 0 32px rgba(255,215,0,.9))', 'drop-shadow(0 0 18px rgba(255,215,0,.6))'] }
                : mood === 'sleepy' ? { opacity: 0.75, y: 3 }
                : batteryDead ? { opacity: 0.4 }
                : !canTap  ? { opacity: 0.6 }
                : tapAnim === 'bounce'
                  ? { scale: [1, 0.88, 1.08, 0.97, 1], y: [0, 6, -4, 2, 0] }
                : tapAnim === 'jump'
                  ? { y: [0, -30, 0, -10, 0], scale: [1, 1.05, 0.95, 1.02, 1], rotate: [0, -5, 5, -2, 0] }
                : tapAnim === 'spin'
                  ? { rotate: [0, 15, -15, 8, -8, 0], scale: [1, 1.1, 1] }
                : isTapping ? { scale: 0.93, y: 6 }
                : { scale: 1, y: 0, opacity: 1, rotate: 0 }
              }
              transition={
                mood === 'charging'
                  ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
                : (tapAnim === 'bounce' || tapAnim === 'jump' || tapAnim === 'spin')
                  ? { duration: 0.45, ease: 'easeOut' }
                  : { type: 'spring', stiffness: 600, damping: 15 }
              }
              className={`robot-float select-none ${canTap || wakeUpPending ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{ filter: (canTap && !batteryDead && mood !== 'charging') ? 'drop-shadow(0 0 22px rgba(255,200,50,.45))' : undefined, touchAction: 'none' }}
            >
              <RobotMascot size={230} tier={upgradeTier} mood={mood} skinId={equippedSkinId} />
            </motion.div>
          </div>

          {/* Sleep / charging status badge */}
          <AnimatePresence>
            {batteryDead && mood !== 'charging' && (
              <motion.span className="text-2xl absolute top-6"
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                style={{ animation: 'breathe 2s ease-in-out infinite' }}>
                💤
              </motion.span>
            )}
          </AnimatePresence>

          {/* Power Pedestal */}
          <div className="relative w-52 -mt-3 flex flex-col items-center">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-36 h-4 rounded-full"
              style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,.4) 0%, transparent 70%)', filter: 'blur(4px)' }} />
            <motion.div className="w-full rounded-xl relative overflow-hidden"
              style={{
                height: 24,
                background: 'linear-gradient(180deg, rgba(30,60,100,.95) 0%, rgba(15,35,70,.98) 100%)',
                border: '1.5px solid rgba(56,189,248,.4)',
              }}
              animate={{ boxShadow: ['0 0 14px rgba(56,189,248,.45), 0 0 28px rgba(14,165,233,.2)', '0 0 24px rgba(56,189,248,.8), 0 0 48px rgba(14,165,233,.45)', '0 0 14px rgba(56,189,248,.45), 0 0 28px rgba(14,165,233,.2)'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 opacity-25"
                style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.5) 1px, transparent 1px)', backgroundSize: '14px 12px' }} />
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,.8), transparent)' }} />
            </motion.div>
            <div className="w-40 h-1.5 rounded-b-lg"
              style={{ background: 'linear-gradient(180deg, rgba(10,28,56,.95), rgba(6,18,38,.98))', border: '1px solid rgba(56,189,248,.2)', borderTop: 'none' }} />
          </div>
        </div>

        {/* ── RIGHT PANEL: AUTO stat + 2 nav buttons ── */}
        <motion.div
          className="absolute right-2 flex flex-col items-center gap-1.5"
          style={{ width: 48 }}
          initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="w-full rounded-2xl px-1 py-2 flex flex-col items-center gap-0.5"
            style={{ background: 'rgba(14,28,56,.8)', border: '1px solid rgba(56,189,248,.22)', backdropFilter: 'blur(8px)', boxShadow: '0 0 10px rgba(52,211,153,.1)' }}>
            <GearIcon spinning={passiveIncome > 0 && !batteryDead} />
            <span className="font-pixel text-[5px] text-sky-400/55 leading-none">AUTO</span>
            <span className={`font-pixel text-[8px] leading-none ${batteryDead ? 'text-gray-500' : passiveIncome > 0 ? 'text-emerald-400' : 'text-sky-400/40'}`}>
              {passiveIncome > 0 ? `+${passiveIncome}` : '--'}
            </span>
            {passiveIncome > 0 && (
              <span className="font-pixel text-[4.5px] text-sky-400/40 leading-none">kW/s</span>
            )}
          </div>

          <div className="w-7 h-px" style={{ background: 'rgba(56,189,248,.18)' }} />

          {([
            { id: 'boost' as const, icon: '⚡', label: 'BOOST' },
            { id: 'care'  as const, icon: '🐾', label: 'CARE' },
            { id: 'skins' as const, icon: '🎨', label: 'SKINS' },
          ]).map((tab) => (
            <motion.button key={tab.id}
              onClick={() => onNavChange(tab.id)}
              whileTap={{ scale: 0.88 }}
              className="w-full rounded-xl flex flex-col items-center py-2 gap-0.5"
              style={{ background: 'rgba(14,28,56,.65)', border: '1px solid rgba(56,189,248,.18)', backdropFilter: 'blur(8px)', cursor: 'pointer' }}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="font-pixel leading-none" style={{ fontSize: 5, color: 'rgba(148,163,184,.65)' }}>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── Long-press hint (first-time only) ── */}
      <AnimatePresence>
        {showChargeHint && !wakeUpPending && (
          <motion.p
            className="font-pixel text-[7px] text-yellow-300 text-center px-4 relative z-10 -mt-1"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,.7)' }}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          >
            {lang === 'uk' ? '⚡ Затримай дотик для СУПЕРЗАРЯДУ' : '⚡ Hold to SUPER CHARGE'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Bottom UI backdrop + controls ─────────────────────────────── */}
      <div className="w-full relative z-10"
        style={{ background: 'linear-gradient(180deg, rgba(8,20,50,.0) 0%, rgba(8,20,50,.82) 18%, rgba(5,14,38,.96) 100%)', paddingTop: 12 }}>

      {/* ── Neon TAP ENERGY bar ───────────────────────────────────────── */}
      <div className="w-full px-5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-pixel text-[7px]" style={{ color: 'rgba(56,189,248,.85)' }}>{t.tapEnergy}</span>
          <span className="font-pixel text-[7px]" style={{ color: 'rgba(56,189,248,.85)' }}>
            {tapCapacity} <span style={{ color: 'rgba(56,189,248,.45)' }}>|</span> {TAP_CAPACITY_MAX}
          </span>
        </div>
        <div className="tap-bar-track w-full h-4">
          <motion.div
            className="tap-bar-fill h-full"
            animate={{ width: `${fillPct}%` }}
            transition={{ type: 'tween', duration: 0.3 }}
          />
        </div>
        <AnimatePresence>
          {!canTap && (
            <motion.p className="font-pixel text-[7px] text-amber-400/80 text-center mt-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {t.rechargingHint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tap button ────────────────────────────────────────────────── */}
      <div className="w-full px-5 pb-5">
        <motion.button
          ref={tapBtnRef}
          onClick={handleTap} onTouchStart={handleTap}
          disabled={!canTap}
          className="w-full py-4 rounded-2xl font-pixel text-sm tracking-wide"
          style={isBlockedBySyncing ? {
            background: 'rgba(56,189,248,.12)',
            border: '1px solid rgba(56,189,248,.25)',
            color: 'rgba(56,189,248,.6)',
            cursor: 'not-allowed',
          } : canTap ? {
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
            border: '2px solid rgba(253,224,71,.5)',
            boxShadow: '0 0 20px rgba(251,191,36,.5), 0 0 40px rgba(245,158,11,.25), 0 4px 0 rgba(0,0,0,.3)',
            color: '#78350f',
          } : {
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.25)',
            cursor: 'not-allowed',
          }}
          whileTap={canTap ? { scale: 0.95, y: 3 } : {}}
        >
          {isBlockedBySyncing ? 'SYNCING...' : canTap ? t.tapToGenerate : t.recharging}
        </motion.button>
      </div>

      </div>{/* end bottom backdrop */}

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div key={p.id}
            className="fixed pointer-events-none z-50 font-pixel text-sky-300 text-sm font-bold"
            style={{ left: p.x - 20, top: p.y - 20, textShadow: '0 0 8px rgba(56,189,248,.9)' }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -70, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            +{p.value} ⚡
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
