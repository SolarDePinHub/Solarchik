import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Battery, TrendingUp } from 'lucide-react';
import RobotMascot from './RobotMascot';
import { DAILY_REWARDS, EVOLUTION_THRESHOLDS } from '../lib/gameConfig';
import type { Translations } from '../lib/i18n';

interface MaintenanceTabProps {
  energy: number;
  batteryLevel: number;
  feedCost: number;
  onFeed: () => void;
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  evolveTier: 0 | 1 | 2 | 3 | 4;
  peakEnergy: number;
  onBack: () => void;
  t: Translations;
}

const TIER_LABELS = [
  { label: 'Rookie',    color: '#90A4AE', next: EVOLUTION_THRESHOLDS[1] },
  { label: 'Energized', color: '#00BCD4', next: EVOLUTION_THRESHOLDS[2] },
  { label: 'Golden',    color: '#FFD700', next: EVOLUTION_THRESHOLDS[3] },
  { label: 'Cosmic',    color: '#FF6B35', next: EVOLUTION_THRESHOLDS[4] },
  { label: 'Ultimate',  color: '#A855F7', next: null },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export default function MaintenanceTab({
  energy, batteryLevel, feedCost, onFeed,
  dailyStreak, lastDailyClaimDate, evolveTier, peakEnergy, onBack, t,
}: MaintenanceTabProps) {
  const batteryDead = batteryLevel <= 0;
  const canFeed = energy >= feedCost && batteryLevel < 100;

  const batteryColor =
    batteryLevel > 60 ? '#4CAF50' :
    batteryLevel > 25 ? '#FF9800' : '#F44336';

  const batteryBg =
    batteryLevel > 60 ? 'from-emerald-50 to-green-50' :
    batteryLevel > 25 ? 'from-amber-50 to-orange-50' : 'from-red-50 to-rose-50';

  const moodEmoji =
    batteryDead ? '😴' :
    batteryLevel < 25 ? '😟' :
    batteryLevel < 50 ? '😐' :
    batteryLevel < 80 ? '😊' : '😁';

  const moodLabel =
    batteryDead ? t.moodSleeping :
    batteryLevel < 25 ? t.moodHungry :
    batteryLevel < 60 ? t.moodOk : t.moodHappy;

  // Evolution progress
  const tierInfo = TIER_LABELS[evolveTier];
  const nextThreshold = tierInfo.next;
  const prevThreshold = EVOLUTION_THRESHOLDS[evolveTier] ?? 0;
  const evolveProgress = nextThreshold
    ? Math.min(100, ((peakEnergy - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  // Streak calendar info
  const today = getTodayStr();
  const alreadyClaimedToday = lastDailyClaimDate === today;
  const missedDay = lastDailyClaimDate !== null
    && lastDailyClaimDate !== today
    && lastDailyClaimDate !== getYesterdayStr();
  const claimedInCycle = dailyStreak === 0 ? 0
    : missedDay ? 0
    : dailyStreak % 7 === 0 ? 7
    : dailyStreak % 7;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold text-white text-lg"
          >
            ‹
          </button>
          <h1 className="font-pixel text-white text-xs tracking-widest drop-shadow-md flex-1 text-center">
            {t.careCenter}
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">

        {/* Robot + battery status card */}
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`card-white rounded-3xl px-5 py-4 pixel-border bg-gradient-to-b ${batteryBg}`}
        >
          {/* Mood + tier badge row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{moodEmoji}</span>
              <div>
                <p className="font-pixel text-[9px] text-gray-500">{t.mood}</p>
                <p className="font-bold text-gray-700 text-sm">{moodLabel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-pixel text-[7px] text-gray-400">{t.evolution}</p>
              <p className="font-pixel text-[9px] font-bold" style={{ color: tierInfo.color }}>
                {tierInfo.label}
              </p>
            </div>
          </div>

          {/* Robot mascot (faded when dead) */}
          <div className="flex justify-center relative">
            <motion.div
              animate={{ opacity: batteryDead ? 0.4 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <RobotMascot size={160} tier={evolveTier} />
            </motion.div>
            <AnimatePresence>
              {batteryDead && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-2 right-8 text-3xl"
                >
                  <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    💤
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Battery bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Battery size={12} className="text-gray-500" />
                <span className="font-pixel text-[8px] text-gray-500">{t.battery}</span>
              </div>
              <span className="font-pixel text-[9px] font-bold" style={{ color: batteryColor }}>
                {Math.round(batteryLevel)}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <motion.div
                className="h-full rounded-full transition-colors duration-700"
                style={{ backgroundColor: batteryColor }}
                animate={{ width: `${batteryLevel}%` }}
                transition={{ type: 'tween', duration: 0.5 }}
              />
            </div>
            {batteryDead && (
              <motion.p
                className="font-pixel text-[8px] text-red-500 text-center mt-1"
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              >
                ⚠ {t.passivePaused}
              </motion.p>
            )}
          </div>

          {/* Heart indicators (visual mood hearts) */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
              <motion.div
                key={i}
                animate={{ scale: batteryLevel / 100 >= threshold ? 1 : 0.7 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Heart
                  size={16}
                  className={batteryLevel / 100 >= threshold ? 'text-red-400' : 'text-gray-200'}
                  fill={batteryLevel / 100 >= threshold ? '#f87171' : 'none'}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feed button card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="card-white rounded-2xl px-5 py-4 pixel-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-yellow-500" />
            <p className="font-pixel text-gray-600 text-[8px] tracking-widest">{t.feedSolarchyk}</p>
          </div>
          <p className="text-gray-500 text-xs mb-3 leading-relaxed">
            {t.feedDesc.replace('kW', '')} <span className="font-bold text-sky-600">{feedCost.toLocaleString()} kW</span>{' '}
            {t.feedDesc.split('kW')[1] ?? ''}
          </p>

          {batteryLevel >= 100 ? (
            <div className="w-full py-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
              <p className="font-pixel text-[9px] text-emerald-600">{t.batteryFull}</p>
            </div>
          ) : (
            <motion.button
              onClick={onFeed}
              disabled={!canFeed}
              whileTap={canFeed ? { scale: 0.96 } : {}}
              className={`w-full py-3.5 rounded-xl font-pixel text-[9px] flex items-center justify-center gap-2 transition-colors ${
                canFeed
                  ? 'bg-sky-500 text-white tap-btn-glow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canFeed ? `${t.feedBtn} ${feedCost.toLocaleString()} kW` : `${t.feedBtn} ${feedCost.toLocaleString()} kW`}
              {!canFeed && energy < feedCost && (
                <span className="text-[7px] opacity-70">
                  ({t.needMore} {(feedCost - energy).toLocaleString()} kW)
                </span>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Evolution progress card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="card-white rounded-2xl px-5 py-4 pixel-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-sky-500" />
            <p className="font-pixel text-gray-600 text-[8px] tracking-widest">{t.evolutionTitle}</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-pixel text-[8px]" style={{ color: tierInfo.color }}>
                Tier {evolveTier}: {tierInfo.label}
              </p>
              <p className="text-gray-400 text-[10px] mt-0.5">
                {t.peak} {fmt(peakEnergy)} kW
              </p>
            </div>
            {nextThreshold && (
              <div className="text-right">
                <p className="font-pixel text-[7px] text-gray-400">{t.nextTier}</p>
                <p className="font-pixel text-[8px] text-gray-600">{fmt(nextThreshold)} kW</p>
              </div>
            )}
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tierInfo.color }}
              animate={{ width: `${evolveProgress}%` }}
              transition={{ type: 'tween', duration: 0.8 }}
            />
          </div>
          {/* All tiers overview */}
          <div className="grid grid-cols-5 gap-1 mt-3">
            {TIER_LABELS.map((t, i) => (
              <div key={i} className={`text-center py-1.5 rounded-lg ${i === evolveTier ? 'ring-2' : ''}`}
                style={{ backgroundColor: `${t.color}20`, ringColor: t.color }}>
                <p className="font-pixel text-[6px]" style={{ color: t.color }}>
                  {i <= evolveTier ? '★' : '☆'}
                </p>
                <p className="font-pixel text-[5px] text-gray-500 mt-0.5">{t.label.slice(0,4)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily streak mini-card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="card-white rounded-2xl px-5 py-4 pixel-border"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-pixel text-gray-600 text-[8px] tracking-widest mb-3">{t.dailyStreak}</p>
            <span className="font-pixel text-lg text-orange-500">{dailyStreak}</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAILY_REWARDS.map((reward, i) => {
              const day = i + 1;
              const claimed = day <= claimedInCycle;
              const isToday = !alreadyClaimedToday && day === claimedInCycle + 1;
              return (
                <div key={day} className={`rounded-lg p-1.5 text-center border transition-colors ${
                  claimed ? 'bg-emerald-50 border-emerald-300' :
                  isToday ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-400' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <p className="font-pixel text-[6px] text-gray-500">D{day}</p>
                  <p className="font-pixel text-[7px] mt-0.5" style={{
                    color: claimed ? '#16a34a' : isToday ? '#0284c7' : '#9CA3AF'
                  }}>
                    {fmt(reward)}
                  </p>
                  <p className="text-[10px] mt-0.5">
                    {claimed ? '✓' : isToday ? '!' : '🔒'}
                  </p>
                </div>
              );
            })}
          </div>
          {alreadyClaimedToday && (
            <p className="font-pixel text-[8px] text-emerald-600 text-center mt-2">
              ✓ {t.claimedTodayShort}
            </p>
          )}
          {!alreadyClaimedToday && (
            <p className="font-pixel text-[8px] text-sky-600 text-center mt-2">
              {t.visitBoost}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
