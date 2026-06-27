import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RobotMascot from './RobotMascot';
import {
  SKINS, getSkinById, isSkinOwned, isChallengeUnlocked, isLimitedAvailable,
  type SkinDef, type SkinType,
} from '../lib/skins';
import type { Lang } from '../lib/i18n';

interface SkinsTabProps {
  energy: number;
  ownedSkins: string[];
  equippedSkinId: string;
  totalEnergyEarned: number;
  level: number;
  lang: Lang;
  onPurchase: (skinId: string, price: number) => void;
  onEquip: (skinId: string) => void;
  onUnlockChallenge: (skinId: string) => void;
  onBack: () => void;
}

const TYPE_FILTERS: { key: SkinType | 'all'; labelEn: string; labelUk: string }[] = [
  { key: 'all',        labelEn: 'ALL',       labelUk: 'ВСІ' },
  { key: 'cosmetic',   labelEn: 'COSMETIC',  labelUk: 'КОСМЕТИКА' },
  { key: 'functional', labelEn: 'FUNCTIONAL', labelUk: 'ФУНКЦ.' },
  { key: 'challenge',  labelEn: 'CHALLENGE', labelUk: 'ВИКЛИК' },
  { key: 'limited',    labelEn: 'LIMITED',   labelUk: 'ОБМЕЖЕНІ' },
];

function formatEnergy(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return `${val}`;
}

function timeLeft(isoDate: string): string {
  const ms = new Date(isoDate).getTime() - Date.now();
  if (ms <= 0) return 'EXPIRED';
  const days = Math.floor(ms / 86_400_000);
  const hrs = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hrs}h`;
  return `${hrs}h`;
}

function SkinCard({
  skin, owned, equipped, challengeUnlocked, limitedAvailable, lang, canAfford,
  onSelect,
}: {
  skin: SkinDef;
  owned: boolean;
  equipped: boolean;
  challengeUnlocked: boolean;
  limitedAvailable: boolean;
  lang: Lang;
  canAfford: boolean;
  onSelect: () => void;
}) {
  const name = lang === 'uk' ? skin.nameUk : skin.nameEn;
  const isExpired = skin.type === 'limited' && !limitedAvailable;
  const locked = !owned && !challengeUnlocked && (skin.type !== 'limited' || limitedAvailable);

  const badgeColor =
    skin.type === 'functional' ? '#FFD700' :
    skin.type === 'challenge' ? '#A78BFA' :
    skin.type === 'limited' ? '#F472B6' :
    'transparent';

  const badgeLabel = lang === 'uk'
    ? skin.type === 'functional' ? `+${skin.boostPercent}% БУСТ`
    : skin.type === 'challenge' ? 'ВИКЛИК'
    : skin.type === 'limited' ? 'ОБМЕЖЕНО'
    : ''
    : skin.type === 'functional' ? `+${skin.boostPercent}% BOOST`
    : skin.type === 'challenge' ? 'CHALLENGE'
    : skin.type === 'limited' ? 'LIMITED'
    : '';

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      className="relative rounded-2xl overflow-hidden flex flex-col items-center text-left"
      style={{
        background: `linear-gradient(145deg, ${skin.cardGradient[0]}, ${skin.cardGradient[1]})`,
        border: equipped
          ? '2px solid #38BDF8'
          : '2px solid rgba(255,255,255,0.1)',
        boxShadow: equipped ? '0 0 16px rgba(56,189,248,0.5)' : undefined,
        opacity: isExpired ? 0.5 : 1,
        touchAction: 'pan-y',
      }}
    >
      {/* Equipped glow rim */}
      {equipped && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ boxShadow: 'inset 0 0 12px rgba(56,189,248,0.3)' }} />
      )}

      {/* Badge */}
      {badgeLabel && (
        <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-full"
          style={{ background: badgeColor, fontSize: 5, fontFamily: "'Press Start 2P', monospace", color: '#000', fontWeight: 'bold' }}>
          {badgeLabel}
        </div>
      )}

      {/* Equipped checkmark */}
      {equipped && (
        <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: '#38BDF8', fontSize: 10 }}>
          ✓
        </div>
      )}

      {/* Robot preview */}
      <div className="pt-2 pb-1 relative">
        <RobotMascot size={80} skinId={skin.id} />
        {(locked || isExpired) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <span style={{ fontSize: 22 }}>{isExpired ? '⏰' : '🔒'}</span>
          </div>
        )}
      </div>

      {/* Name + price */}
      <div className="px-2 pb-2.5 w-full">
        <p className="font-pixel text-white leading-tight"
          style={{ fontSize: 7, textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>
          {name}
        </p>
        <div className="mt-1">
          {owned ? (
            <p className="font-pixel text-emerald-400 leading-none" style={{ fontSize: 6 }}>
              {equipped ? (lang === 'uk' ? '✓ ОДЯГНЕНО' : '✓ EQUIPPED') : (lang === 'uk' ? 'КУПЛЕНО' : 'OWNED')}
            </p>
          ) : skin.type === 'challenge' ? (
            <p className={`font-pixel leading-none ${challengeUnlocked ? 'text-violet-300' : 'text-slate-400'}`}
              style={{ fontSize: 6 }}>
              {challengeUnlocked
                ? (lang === 'uk' ? '🔓 РОЗБЛОКОВАНО' : '🔓 UNLOCKED')
                : (lang === 'uk' ? '🔒 ВИКЛИК' : '🔒 CHALLENGE')}
            </p>
          ) : isExpired ? (
            <p className="font-pixel text-red-400 leading-none" style={{ fontSize: 6 }}>
              {lang === 'uk' ? 'ЗАКІНЧИВСЯ' : 'EXPIRED'}
            </p>
          ) : skin.price > 0 ? (
            <p className={`font-pixel leading-none ${canAfford ? 'text-yellow-300' : 'text-red-400'}`}
              style={{ fontSize: 6 }}>
              {formatEnergy(skin.price)} kW
            </p>
          ) : (
            <p className="font-pixel text-slate-400 leading-none" style={{ fontSize: 6 }}>FREE</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function SkinsTab({
  energy, ownedSkins, equippedSkinId, totalEnergyEarned, level, lang,
  onPurchase, onEquip, onUnlockChallenge, onBack,
}: SkinsTabProps) {
  const [filterType, setFilterType] = useState<SkinType | 'all'>('all');
  const [selectedSkin, setSelectedSkin] = useState<SkinDef | null>(null);

  const filteredSkins = useMemo(() =>
    SKINS.filter((s) => filterType === 'all' || s.type === filterType),
  [filterType]);

  const equippedSkin = getSkinById(equippedSkinId);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #060e1f 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-shrink-0">
        <button onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)' }}>
          <span className="font-pixel text-sky-400" style={{ fontSize: 9 }}>←</span>
        </button>
        <h1 className="font-pixel text-sky-300 flex-1"
          style={{ fontSize: 12, textShadow: '0 0 12px rgba(56,189,248,0.6)' }}>
          {lang === 'uk' ? '🎨 СКІНИ' : '🎨 SKINS STORE'}
        </h1>
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <span className="font-pixel text-yellow-300" style={{ fontSize: 8 }}>
            {formatEnergy(energy)}
          </span>
          <span className="font-pixel text-yellow-400/70" style={{ fontSize: 6 }}>kW</span>
        </div>
      </div>

      {/* Currently wearing preview */}
      <div className="mx-3 mb-2 rounded-2xl flex-shrink-0"
        style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', padding: '10px 12px' }}>
        <p className="font-pixel text-sky-400/60 mb-1" style={{ fontSize: 6 }}>
          {lang === 'uk' ? 'ЗАРАЗ ВДЯГНЕНО' : 'CURRENTLY WEARING'}
        </p>
        <div className="flex items-center gap-3">
          <RobotMascot size={56} skinId={equippedSkinId} />
          <div className="flex-1">
            <p className="font-pixel text-white" style={{ fontSize: 9 }}>
              {lang === 'uk' ? equippedSkin.nameUk : equippedSkin.nameEn}
            </p>
            {equippedSkin.boostPercent > 0 && (
              <p className="font-pixel text-yellow-300 mt-1" style={{ fontSize: 7 }}>
                +{equippedSkin.boostPercent}% {lang === 'uk' ? 'до генерації' : 'generation boost'}
              </p>
            )}
            {equippedSkin.type === 'limited' && equippedSkin.limitedUntil && (
              <p className="font-pixel text-pink-400 mt-1" style={{ fontSize: 6 }}>
                ⏰ {timeLeft(equippedSkin.limitedUntil)} {lang === 'uk' ? 'залишилось' : 'left'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TYPE_FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilterType(f.key)}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-xl font-pixel transition-all"
            style={{
              fontSize: 6,
              background: filterType === f.key ? 'rgba(56,189,248,0.25)' : 'rgba(14,28,56,0.8)',
              border: filterType === f.key ? '1px solid rgba(56,189,248,0.6)' : '1px solid rgba(56,189,248,0.15)',
              color: filterType === f.key ? '#7DD3FC' : 'rgba(148,163,184,0.6)',
              boxShadow: filterType === f.key ? '0 0 8px rgba(56,189,248,0.2)' : undefined,
            }}>
            {lang === 'uk' ? f.labelUk : f.labelEn}
          </button>
        ))}
      </div>

      {/* Skin grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-24" style={{ scrollbarWidth: 'none', touchAction: 'pan-y' }}>
        <div className="grid grid-cols-2 gap-2">
          {filteredSkins.map((skin) => {
            const owned = isSkinOwned(ownedSkins, skin.id);
            const equipped = equippedSkinId === skin.id;
            const challengeOk = isChallengeUnlocked(skin, totalEnergyEarned, level);
            const limitedOk = isLimitedAvailable(skin);
            const canAfford = energy >= skin.price;
            return (
              <SkinCard
                key={skin.id}
                skin={skin}
                owned={owned}
                equipped={equipped}
                challengeUnlocked={challengeOk}
                limitedAvailable={limitedOk}
                lang={lang}
                canAfford={canAfford}
                onSelect={() => setSelectedSkin(skin)}
              />
            );
          })}
        </div>
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedSkin && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkin(null)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${selectedSkin.cardGradient[0]} 0%, #060e1f 100%)`,
                border: '1px solid rgba(255,255,255,0.12)',
                borderBottom: 'none',
                maxHeight: '80vh',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <div className="flex flex-col items-center px-5 pt-4 pb-8">
                {/* Handle */}
                <div className="w-10 h-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.25)' }} />

                {/* Large robot preview + name */}
                <div className="flex items-center gap-4 w-full mb-4">
                  <div className="relative">
                    <RobotMascot size={110} skinId={selectedSkin.id} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {selectedSkin.type !== 'cosmetic' && (
                        <span className="px-2 py-0.5 rounded-full font-pixel"
                          style={{
                            fontSize: 6,
                            background: selectedSkin.type === 'functional' ? 'rgba(251,191,36,0.2)' :
                              selectedSkin.type === 'challenge' ? 'rgba(167,139,250,0.2)' :
                              'rgba(244,114,182,0.2)',
                            color: selectedSkin.type === 'functional' ? '#FCD34D' :
                              selectedSkin.type === 'challenge' ? '#C4B5FD' :
                              '#F9A8D4',
                            border: `1px solid ${selectedSkin.type === 'functional' ? 'rgba(251,191,36,0.4)' : selectedSkin.type === 'challenge' ? 'rgba(167,139,250,0.4)' : 'rgba(244,114,182,0.4)'}`,
                          }}>
                          {selectedSkin.type === 'functional' ? (lang === 'uk' ? 'ФУНКЦІОНАЛЬНИЙ' : 'FUNCTIONAL')
                          : selectedSkin.type === 'challenge' ? (lang === 'uk' ? 'ВИКЛИК' : 'CHALLENGE')
                          : (lang === 'uk' ? 'ОБМЕЖЕНИЙ' : 'LIMITED')}
                        </span>
                      )}
                    </div>
                    <h2 className="font-pixel text-white mb-1" style={{ fontSize: 11, textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>
                      {lang === 'uk' ? selectedSkin.nameUk : selectedSkin.nameEn}
                    </h2>
                    <p className="font-pixel text-white/60" style={{ fontSize: 7, lineHeight: 1.6 }}>
                      {lang === 'uk' ? selectedSkin.descUk : selectedSkin.descEn}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {selectedSkin.boostPercent > 0 && (
                  <div className="w-full rounded-xl p-3 mb-3"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <p className="font-pixel text-yellow-300" style={{ fontSize: 8 }}>
                      ⚡ +{selectedSkin.boostPercent}% {lang === 'uk' ? 'до генерації енергії' : 'energy generation'}
                    </p>
                    <p className="font-pixel text-yellow-400/60 mt-1" style={{ fontSize: 6 }}>
                      {lang === 'uk' ? 'Застосовується до клік-бонусу та пасивного доходу' : 'Applies to tap bonus and passive income'}
                    </p>
                  </div>
                )}

                {/* Challenge condition */}
                {selectedSkin.type === 'challenge' && (
                  <div className="w-full rounded-xl p-3 mb-3"
                    style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    {selectedSkin.challengeEnergy && (
                      <div>
                        <p className="font-pixel text-violet-300 mb-1" style={{ fontSize: 7 }}>
                          {lang === 'uk' ? '🏆 УМОВА ВИКЛИКУ' : '🏆 CHALLENGE CONDITION'}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-pixel text-white/70" style={{ fontSize: 7 }}>
                            {lang === 'uk' ? 'Зібрати всього:' : 'Total earned:'}
                          </p>
                          <p className={`font-pixel ${totalEnergyEarned >= selectedSkin.challengeEnergy ? 'text-emerald-400' : 'text-white/50'}`} style={{ fontSize: 7 }}>
                            {formatEnergy(totalEnergyEarned)} / {formatEnergy(selectedSkin.challengeEnergy)} kW
                          </p>
                        </div>
                        <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (totalEnergyEarned / selectedSkin.challengeEnergy) * 100)}%`,
                              background: totalEnergyEarned >= selectedSkin.challengeEnergy ? '#34D399' : '#A78BFA',
                            }} />
                        </div>
                      </div>
                    )}
                    {selectedSkin.challengeLevel && (
                      <div>
                        <p className="font-pixel text-violet-300 mb-1" style={{ fontSize: 7 }}>
                          {lang === 'uk' ? '🏆 УМОВА ВИКЛИКУ' : '🏆 CHALLENGE CONDITION'}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-pixel text-white/70" style={{ fontSize: 7 }}>
                            {lang === 'uk' ? 'Рівень:' : 'Level:'}
                          </p>
                          <p className={`font-pixel ${level >= selectedSkin.challengeLevel ? 'text-emerald-400' : 'text-white/50'}`} style={{ fontSize: 7 }}>
                            {level} / {selectedSkin.challengeLevel}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Limited time countdown */}
                {selectedSkin.type === 'limited' && selectedSkin.limitedUntil && (
                  <div className="w-full rounded-xl p-3 mb-3"
                    style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.3)' }}>
                    <div className="flex items-center justify-between">
                      <p className="font-pixel text-pink-300" style={{ fontSize: 7 }}>
                        {lang === 'uk' ? '⏰ ЗАЛИШИЛОСЬ' : '⏰ TIME LEFT'}
                      </p>
                      <p className="font-pixel text-pink-200" style={{ fontSize: 9 }}>
                        {timeLeft(selectedSkin.limitedUntil)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action button */}
                <ActionButton
                  skin={selectedSkin}
                  owned={isSkinOwned(ownedSkins, selectedSkin.id)}
                  equipped={equippedSkinId === selectedSkin.id}
                  challengeUnlocked={isChallengeUnlocked(selectedSkin, totalEnergyEarned, level)}
                  limitedAvailable={isLimitedAvailable(selectedSkin)}
                  canAfford={energy >= selectedSkin.price}
                  lang={lang}
                  onBuy={() => { onPurchase(selectedSkin.id, selectedSkin.price); setSelectedSkin(null); }}
                  onEquip={() => { onEquip(selectedSkin.id); setSelectedSkin(null); }}
                  onUnlock={() => { onUnlockChallenge(selectedSkin.id); setSelectedSkin(null); }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  skin, owned, equipped, challengeUnlocked, limitedAvailable, canAfford, lang,
  onBuy, onEquip, onUnlock,
}: {
  skin: SkinDef;
  owned: boolean;
  equipped: boolean;
  challengeUnlocked: boolean;
  limitedAvailable: boolean;
  canAfford: boolean;
  lang: Lang;
  onBuy: () => void;
  onEquip: () => void;
  onUnlock: () => void;
}) {
  if (equipped) {
    return (
      <div className="w-full py-3 rounded-2xl font-pixel text-center"
        style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', color: '#7DD3FC', fontSize: 9 }}>
        {lang === 'uk' ? '✓ ОДЯГНЕНО' : '✓ CURRENTLY EQUIPPED'}
      </div>
    );
  }

  if (owned) {
    return (
      <motion.button
        onClick={onEquip}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-2xl font-pixel text-center"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          boxShadow: '0 0 20px rgba(56,189,248,0.4)',
          color: '#fff',
          fontSize: 9,
        }}>
        {lang === 'uk' ? '👕 ВДЯГНУТИ' : '👕 EQUIP SKIN'}
      </motion.button>
    );
  }

  if (skin.type === 'challenge') {
    if (challengeUnlocked) {
      return (
        <motion.button
          onClick={onUnlock}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-2xl font-pixel text-center"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
            color: '#fff',
            fontSize: 9,
          }}>
          {lang === 'uk' ? '🔓 ОТРИМАТИ БЕЗКОШТОВНО' : '🔓 UNLOCK FREE'}
        </motion.button>
      );
    }
    return (
      <div className="w-full py-3 rounded-2xl font-pixel text-center"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>
        {lang === 'uk' ? '🔒 ВИКОНАЙ ВИКЛИК' : '🔒 COMPLETE CHALLENGE'}
      </div>
    );
  }

  if (skin.type === 'limited' && !limitedAvailable) {
    return (
      <div className="w-full py-3 rounded-2xl font-pixel text-center"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>
        {lang === 'uk' ? '⏰ ТЕРМІН ВИЙШОВ' : '⏰ OFFER EXPIRED'}
      </div>
    );
  }

  return (
    <motion.button
      onClick={canAfford ? onBuy : undefined}
      whileTap={canAfford ? { scale: 0.97 } : {}}
      className="w-full py-3 rounded-2xl font-pixel text-center"
      style={canAfford ? {
        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        boxShadow: '0 0 20px rgba(251,191,36,0.4)',
        color: '#78350f',
        fontSize: 9,
      } : {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        cursor: 'not-allowed',
      }}>
      {canAfford
        ? (lang === 'uk' ? `🛒 КУПИТИ — ${formatEnergy(skin.price)} kW` : `🛒 BUY — ${formatEnergy(skin.price)} kW`)
        : (lang === 'uk' ? `❌ МАЛО ЕНЕРГІЇ — ${formatEnergy(skin.price)} kW` : `❌ NOT ENOUGH — ${formatEnergy(skin.price)} kW`)}
    </motion.button>
  );
}
