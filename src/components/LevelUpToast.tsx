import { motion, AnimatePresence } from 'framer-motion';
import type { Translations } from '../lib/i18n';

interface LevelUpToastProps {
  level: number | null;
  t: Translations;
  onDismiss: () => void;
}

export default function LevelUpToast({ level, t, onDismiss }: LevelUpToastProps) {
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          key={level}
          initial={{ opacity: 0, scale: 0.6, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -40 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={onDismiss}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 pointer-events-auto mx-6 w-full max-w-xs"
            animate={{ rotate: [0, -1, 1, -1, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Burst rays */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="w-48 h-48 rounded-full bg-yellow-300/30" />
            </motion.div>

            <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-3xl px-6 py-6 shadow-2xl border-4 border-yellow-300 text-center">
              {/* Stars */}
              <motion.div
                className="flex justify-center gap-1 mb-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              >
                {['★', '★', '★'].map((s, i) => (
                  <motion.span
                    key={i}
                    className="text-white text-xl"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 400 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>

              {/* Title */}
              <motion.p
                className="font-pixel text-white text-xs tracking-widest mb-1"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              >
                {t.levelUpTitle}
              </motion.p>

              {/* Level number */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 500, damping: 16 }}
                className="my-3"
              >
                <span className="font-pixel text-white text-5xl drop-shadow-lg">{level}</span>
              </motion.div>

              {/* Robot message */}
              <motion.div
                className="bg-white/20 rounded-2xl px-4 py-3 mb-4"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                <p className="text-white text-xs leading-relaxed font-medium">
                  🤖 "{t.levelUpMessage}"
                </p>
              </motion.div>

              <motion.p
                className="font-pixel text-yellow-100 text-[8px] tracking-wide mb-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              >
                {t.levelUpSub}
              </motion.p>

              {/* Dismiss */}
              <motion.button
                onClick={onDismiss}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-white rounded-xl font-pixel text-[9px] text-orange-600 tracking-wide"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              >
                ⚡ OK!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
