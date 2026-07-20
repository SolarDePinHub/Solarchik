import { motion } from 'framer-motion';
import type { Translations } from '../lib/i18n';
import NativeAdBanner from './NativeAdBanner';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  passiveRate: number;
  owned: number;
  icon: string;
  color: string;
}

interface ShopTabProps {
  energy: number;
  upgrades: Upgrade[];
  onPurchase: (upgradeId: string) => void;
  onBack: () => void;
  t: Translations;
}

type UpgradeId = 'inverter' | 'solar_panels' | 'battery_bank' | 'solarchyk';

function resolveUpgradeStrings(id: string, t: Translations): { name: string; description: string } {
  const map: Record<UpgradeId, { name: string; description: string }> = {
    inverter:     { name: t.upgradeInverterName,  description: t.upgradeInverterDesc },
    solar_panels: { name: t.upgradePanelsName,    description: t.upgradePanelsDesc },
    battery_bank: { name: t.upgradeBatteryName,   description: t.upgradeBatteryDesc },
    solarchyk:    { name: t.upgradeSolarchykName, description: t.upgradeSolarchykDesc },
  };
  return map[id as UpgradeId] ?? { name: id, description: '' };
}

function UpgradeCard({
  upgrade, energy, onPurchase, index, t,
}: {
  upgrade: Upgrade;
  energy: number;
  onPurchase: (id: string) => void;
  index: number;
  t: Translations;
}) {
  const canAfford = energy >= upgrade.cost;
  const { name, description } = resolveUpgradeStrings(upgrade.id, t);

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300 }}
      className="card-white rounded-2xl p-3 flex items-center gap-3"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 pixel-border"
        style={{ background: upgrade.color }}
      >
        {upgrade.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm leading-tight">{name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-sm">⚡</span>
            <span className="font-pixel text-[9px] text-yellow-700">
              {upgrade.cost.toLocaleString()}
            </span>
          </div>
          {upgrade.passiveRate > 0 && (
            <span className="font-pixel text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
              +{upgrade.passiveRate}/s
            </span>
          )}
        </div>
        {upgrade.owned > 0 && (
          <span className="text-[9px] text-sky-500 font-bold">{t.owned} {upgrade.owned}</span>
        )}
      </div>

      {/* Buy button */}
      <motion.button
        onClick={() => onPurchase(upgrade.id)}
        disabled={!canAfford}
        className={`px-3 py-2 rounded-xl font-pixel text-[8px] pixel-btn flex-shrink-0 ${
          canAfford
            ? 'bg-sky-400 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-gray-300'
        }`}
        whileTap={canAfford ? { scale: 0.92 } : {}}
      >
        {canAfford ? t.buy : t.cantAfford}
      </motion.button>
    </motion.div>
  );
}

export default function ShopTab({ energy, upgrades, onPurchase, onBack, t }: ShopTabProps) {
  const formatEnergy = (val: number) =>
    val >= 1_000_000
      ? `${(val / 1_000_000).toFixed(2)}M`
      : `${val.toLocaleString()}`;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold text-white text-lg"
          >
            ‹
          </button>
          <h1 className="font-pixel text-white text-xs tracking-widest drop-shadow-md flex-1 text-center">
            {t.theShop}
          </h1>
          <div className="w-8" />
        </div>

        {/* Energy display */}
        <motion.div
          className="card-white rounded-2xl px-5 py-3 pixel-border"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="font-pixel text-gray-500 text-[7px] tracking-widest text-center">
            {t.currentEnergy}
          </p>
          <p className="font-pixel text-sky-600 text-xl text-center mt-1">
            {formatEnergy(energy)}{' '}
            <span className="text-yellow-400">kW</span>
          </p>
          <p className="text-center text-gray-500 text-[10px] mt-1">
            {t.shopTagline} <span className="text-yellow-500 font-bold">$SOLARCHIK</span>
          </p>
        </motion.div>
      </div>

      {/* Native ad banner */}
      <div className="px-4 mt-1.5">
        <NativeAdBanner className="h-[60px] w-full rounded-xl overflow-hidden bg-white/70 border border-white/50" />
      </div>

      {/* Upgrades list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2 mt-1.5">
        {upgrades.map((upgrade, i) => (
          <UpgradeCard
            key={upgrade.id}
            upgrade={upgrade}
            energy={energy}
            onPurchase={onPurchase}
            index={i}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
