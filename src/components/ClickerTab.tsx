import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RobotMascot from './RobotMascot';
import { TAP_CAPACITY_MAX, TAP_COST } from '../lib/gameConfig';
import type { Lang, Translations } from '../lib/i18n';

interface ClickerTabProps {
  energy: number;
  tapProgress: number;
  onTap: () => void;
  onNavChange: (tab: 'shop' | 'leaderboard' | 'boost' | 'care' | 'referral') => void;
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
  energy, tapProgress, onTap, onNavChange, multiplier, passiveIncome, tapCapacity, upgradeTier = 0, batteryLevel,
  level, energyCap, levelProgress, kWToNextLevel, lang, onLangSwitch, onReset, isSyncing = false, t,
}: ClickerTabProps) {
  console.log('[ClickerTab render] energy prop:', energy, '| tapCapacity:', tapCapacity);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const particleId = useRef(0);
  const tapBtnRef = useRef<HTMLButtonElement>(null);

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

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // e.preventDefault() on touchstart stops the browser firing a synthetic
      // click ~300ms later, so we never double-count a tap. No guard needed.
      e.preventDefault();
      if (!canTap) {
        console.log('[ClickerTab handleTap] blocked — canTap is false');
        return;
      }
      console.log('[ClickerTab handleTap] event type:', e.type, '| calling onTap()');
      onTap();
      setIsTapping(true);
      setTimeout(() => setIsTapping(false), 120);

      const rect = tapBtnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? rect.left + rect.width / 2 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? rect.top + rect.height / 2 : e.clientY;

      const id = ++particleId.current;
      setParticles((p) => [...p, { id, x: clientX, y: clientY, value: multiplier }]);
      setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 900);
    },
    [onTap, multiplier, canTap]
  );

  return (
    <div className="flex flex-col items-center flex-1 relative overflow-hidden">

      {/* Ambient depth overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(56,189,248,.06) 0%, transparent 65%)' }} />

      {/* Star flares */}
      <div className="absolute top-10 left-8 w-1 h-1 rounded-full bg-sky-300/60" />
      <div className="absolute top-6 left-24 w-0.5 h-0.5 rounded-full bg-white/50" />
      <div className="absolute top-20 right-12 w-1 h-1 rounded-full bg-sky-200/50" />
      <div className="absolute top-8 right-28 w-0.5 h-0.5 rounded-full bg-white/40" />

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
            {/* Energy */}
            <div className="flex-1">
              <p className="font-pixel text-[6px] text-sky-400/50 tracking-widest">{t.currentEnergy}</p>
              <p className="font-pixel text-2xl leading-tight energy-glow text-sky-200 mt-0.5">
                {formatEnergy(energy)}<span className="text-yellow-300 text-base ml-1">kW</span>
              </p>
            </div>

            {/* Battery + capacity stacked on right */}
            <div className="flex-shrink-0 w-28">
              {/* Battery row */}
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
              {/* Capacity row */}
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

          {/* "Full" hint — only when capped */}
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
          {/* GEN stat */}
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

          {/* Nav: Top, Shop, Refer */}
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
          <motion.div
            onClick={handleTap}
            animate={
              batteryDead ? { opacity: 0.4 }
              : !canTap  ? { opacity: 0.6 }
              : isTapping ? { scale: 0.93, y: 6 }
              : { scale: 1, y: 0, opacity: 1 }
            }
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            className={`robot-float ${canTap ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            style={{ filter: canTap && !batteryDead ? 'drop-shadow(0 0 18px rgba(56,189,248,.35))' : undefined }}
          >
            <RobotMascot size={230} tier={upgradeTier} />
          </motion.div>

          <AnimatePresence>
            {batteryDead && (
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
          {/* AUTO stat */}
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

          {/* Nav: Boost, Care */}
          {([
            { id: 'boost' as const, icon: '⚡', label: 'BOOST' },
            { id: 'care'  as const, icon: '🐾', label: 'CARE' },
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

      {/* ── Neon TAP ENERGY bar ───────────────────────────────────────── */}
      <div className="w-full px-5 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-pixel text-[7px]" style={{ color: 'rgba(56,189,248,.7)' }}>{t.tapEnergy}</span>
          <span className="font-pixel text-[7px]" style={{ color: 'rgba(56,189,248,.7)' }}>
            {tapCapacity} <span style={{ color: 'rgba(56,189,248,.35)' }}>|</span> {TAP_CAPACITY_MAX}
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
      <div className="w-full px-5 pb-5 relative z-10">
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
