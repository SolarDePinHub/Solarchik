import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Milestone {
  id: string;
  threshold: number;
  label: string;
  icon: string;
  color: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'ms_1m',   threshold: 1_000_000,     label: '1 MILLION kW!',   icon: '⚡', color: 'from-sky-400 to-blue-600' },
  { id: 'ms_10m',  threshold: 10_000_000,    label: '10 MILLION kW!',  icon: '🔥', color: 'from-orange-400 to-red-600' },
  { id: 'ms_100m', threshold: 100_000_000,   label: '100 MILLION kW!', icon: '👑', color: 'from-yellow-400 to-amber-600' },
];

interface MilestoneToastProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

export default function MilestoneToast({ milestone, onDismiss }: MilestoneToastProps) {
  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [milestone, onDismiss]);

  return (
    <AnimatePresence>
      {milestone && (
        <>
          {/* Backdrop flash */}
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ background: 'radial-gradient(circle, rgba(255,220,0,0.5) 0%, transparent 70%)' }}
          />

          {/* Toast card */}
          <motion.div
            className="fixed top-16 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm"
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={onDismiss}
          >
            <div className={`bg-gradient-to-r ${milestone.color} rounded-2xl p-[3px] shadow-2xl`}>
              <div className="bg-white rounded-[14px] px-5 py-4 flex items-center gap-4">
                <motion.div
                  className="text-4xl flex-shrink-0"
                  animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1.3, 1.2, 1.2, 1] }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  {milestone.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[8px] text-gray-400 tracking-widest">MILESTONE!</p>
                  <p className="font-pixel text-gray-900 text-[11px] mt-1 leading-relaxed">
                    {milestone.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">You've reached a new energy record!</p>
                </div>
              </div>
            </div>

            {/* Particle bursts */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  background: ['#FFD700', '#00E5FF', '#FF4081', '#69F0AE', '#FF9800', '#E040FB'][i],
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 70,
                  y: Math.sin((i / 6) * Math.PI * 2) * 40,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.9, delay: 0.05 * i }}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
