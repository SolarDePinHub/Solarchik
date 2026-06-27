import { motion } from 'framer-motion';
import type { Translations } from '../lib/i18n';

type Tab = 'clicker' | 'shop' | 'leaderboard' | 'boost' | 'referral' | 'care';

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  hidden?: boolean;
  t: Translations;
}

export default function BottomNav({ active, onTabChange, hidden, t }: BottomNavProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'leaderboard', label: t.navTop,   icon: '🏆' },
    { id: 'shop',        label: t.navShop,  icon: '🛒' },
    { id: 'clicker',     label: t.navHome,  icon: '🏠' },
    { id: 'boost',       label: t.navBoost, icon: '⚡' },
    { id: 'care',        label: t.navCare,  icon: '🐾' },
    { id: 'referral',    label: t.navRefer, icon: '🔗' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ display: hidden ? 'none' : undefined }}>
      <div className="nav-frosted px-1 pb-safe">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center py-2.5 px-2 min-w-0 flex-1 overflow-hidden"
              >
                {/* Upward glow halo when active */}
                {isActive && (
                  <motion.div
                    layoutId="nav-halo"
                    className="nav-glow absolute bottom-0 left-0 right-0 h-full pointer-events-none"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Active underline accent */}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{ background: 'linear-gradient(90deg,transparent,#38bdf8,transparent)' }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <motion.span
                  className="relative z-10 text-lg leading-none"
                  animate={{ scale: isActive ? 1.25 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(56,189,248,.7))' : undefined }}
                >
                  {tab.icon}
                </motion.span>

                <span
                  className="relative z-10 mt-0.5 font-bold transition-colors"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '6px',
                    color: isActive ? '#7dd3fc' : 'rgba(148,163,184,.55)',
                    textShadow: isActive ? '0 0 8px rgba(56,189,248,.6)' : undefined,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
