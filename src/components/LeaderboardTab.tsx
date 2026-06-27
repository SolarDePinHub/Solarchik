import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Star } from 'lucide-react';
import RobotMascot from './RobotMascot';
import { supabase, type Player } from '../lib/supabase';
import type { Translations } from '../lib/i18n';

interface LeaderboardTabProps {
  currentPlayerId: string | null;
  onBack: () => void;
  onVote: () => void;
  t: Translations;
}

export default function LeaderboardTab({ currentPlayerId, onBack, onVote, t }: LeaderboardTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async (attempt = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('id, name, avatar, energy, total_energy_earned, is_you')
        .order('total_energy_earned', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setPlayers((data as Player[]) || []);
    } catch (err) {
      // Handle both PostgrestError (has .message) and native Error
      const msg = (err != null && typeof (err as Record<string, unknown>).message === 'string')
        ? (err as Record<string, unknown>).message as string
        : 'Failed to load leaderboard';
      console.error('[LeaderboardTab] fetch error:', err);
      // Auto-retry once after 2s on first failure (handles Telegram slow init)
      if (attempt === 0) {
        setTimeout(() => fetchPlayers(1), 2000);
      } else {
        setError(msg);
        setLoading(false);
      }
      return;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const formatEnergy = (val: number) =>
    val >= 1_000_000 ? `${(val / 1_000_000).toFixed(2)}M kW` : `${val.toLocaleString()} kW`;

  const rankColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600',
  };

  const rankBg: Record<number, string> = {
    1: 'bg-yellow-50 border-yellow-300',
    2: 'bg-gray-50 border-gray-200',
    3: 'bg-amber-50 border-amber-300',
  };

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
            {t.leaderboard}
          </h1>
          <button
            onClick={fetchPlayers}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center disabled:opacity-60"
          >
            <RefreshCw size={16} className={`text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mascot hero */}
      <div className="flex justify-center py-2">
        <RobotMascot size={130} />
      </div>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 mt-1">
        {loading && players.length === 0 ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <RefreshCw size={32} className="text-white/50" />
            </motion.div>
            <p className="font-pixel text-white/70 text-xs mt-3">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="font-pixel text-red-400 text-xs">{error}</p>
            <button
              onClick={fetchPlayers}
              className="mt-3 px-4 py-2 bg-sky-400 text-white rounded-xl font-pixel text-[9px]"
            >
              {t.retry}
            </button>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={40} className="mx-auto text-white/40 mb-3" />
            <p className="font-pixel text-white/80 text-xs leading-relaxed px-6">{t.noPlayers}</p>
          </div>
        ) : (
          players.map((player, i) => {
            const rank = i + 1;
            const isCurrentPlayer = !!currentPlayerId && player.id === currentPlayerId;
            return (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.6), type: 'spring', stiffness: 300 }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 ${
                  isCurrentPlayer
                    ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 ring-offset-1'
                    : rankBg[rank] ?? 'bg-white/90 border-white/60'
                }`}
              >
                <span className={`font-pixel text-sm w-6 text-center flex-shrink-0 ${rankColors[rank] ?? 'text-gray-400'}`}>
                  {rank}.
                </span>
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-xl border-2 border-sky-200 flex-shrink-0">
                  {player.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-gray-800 text-sm truncate">{player.name}</p>
                    {isCurrentPlayer && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-400 text-white rounded-full font-pixel text-[7px] flex-shrink-0">
                        <Star size={8} fill="currentColor" />
                        {t.you}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 font-pixel text-[8px]">
                    {formatEnergy(player.total_energy_earned ?? player.energy)}
                  </p>
                </div>
                {rank === 1 && <span className="text-2xl flex-shrink-0">👑</span>}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Vote bonus banner */}
      <div className="px-4 pb-24">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card-white rounded-2xl px-4 py-3 text-center"
        >
          <p className="text-gray-700 text-xs font-bold">
            {t.voteBanner}{' '}
            <span className="text-yellow-500">{t.voteBonus}</span>
          </p>
          <button
            onClick={onVote}
            className="mt-2 px-5 py-2 bg-sky-400 text-white rounded-xl font-pixel text-[9px] pixel-btn"
          >
            {t.voteBtn}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
