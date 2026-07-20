import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Check, Clock, XCircle, Send, Flame, Link2, Camera, X } from 'lucide-react';
import RobotMascot from './RobotMascot';
import NativeAdBanner from './NativeAdBanner';
import { supabase } from '../lib/supabase';
import { DAILY_REWARDS } from '../lib/gameConfig';
import type { Translations } from '../lib/i18n';

const SUBMISSION_KEY = 'solarchik_boost_submission';

interface BinanceBoostTabProps {
  energy: number;
  playerId: string | null;
  playerName: string | null;
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  onClaimBonus: (amount: number) => void;
  onDailyClaim: () => void;
  onBack: () => void;
  t: Translations;
}

type SubmissionStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'claimed';
type InputMode = 'url' | 'photo';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
function fmt(n: number): string {
  return n >= 1_000 ? `${n / 1_000}k` : String(n);
}

export default function BinanceBoostTab({
  energy, playerId, playerName,
  dailyStreak, lastDailyClaimDate,
  onClaimBonus, onDailyClaim, onBack, t,
}: BinanceBoostTabProps) {
  const [status, setStatus] = useState<SubmissionStatus>('none');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [claimedReward, setClaimedReward] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const alreadyClaimedToday = lastDailyClaimDate === today;
  const missedDay = lastDailyClaimDate !== null
    && lastDailyClaimDate !== today
    && lastDailyClaimDate !== yesterday;
  const claimedInCycle = dailyStreak === 0 ? 0
    : missedDay ? 0
    : dailyStreak % 7 === 0 ? 7
    : dailyStreak % 7;
  const canClaimToday = !alreadyClaimedToday;
  const nextClaimIdx = missedDay ? 0 : claimedInCycle % 7;
  const todayReward = DAILY_REWARDS[nextClaimIdx];

  useEffect(() => {
    const saved = localStorage.getItem(SUBMISSION_KEY);
    if (saved) {
      const { id } = JSON.parse(saved);
      setSubmissionId(id);
      checkStatus(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkStatus = async (id: string) => {
    const { data } = await supabase
      .from('screenshot_submissions').select('status').eq('id', id).maybeSingle();
    if (data) setStatus(data.status as SubmissionStatus);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${playerId ?? 'anon'}/${Date.now()}.${ext}`;
    setUploading(true);
    setUploadProgress(30);

    const { data, error } = await supabase.storage
      .from('vote-screenshots')
      .upload(path, file, { contentType: file.type, upsert: false });

    setUploadProgress(80);
    setUploading(false);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('vote-screenshots')
      .getPublicUrl(data.path);

    setUploadProgress(100);
    return publicUrl;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let finalUrl = screenshotUrl.trim();

      if (inputMode === 'photo') {
        if (!selectedFile) return;
        finalUrl = await uploadFileToStorage(selectedFile);
      } else {
        if (!finalUrl) return;
      }

      const { data, error } = await supabase
        .from('screenshot_submissions')
        .insert({
          player_id: playerId ?? null,
          player_name: playerName ?? 'Unknown',
          screenshot_url: finalUrl,
          status: 'pending',
        })
        .select('id').single();

      if (!error && data) {
        setSubmissionId(data.id);
        setStatus('pending');
        localStorage.setItem(SUBMISSION_KEY, JSON.stringify({ id: data.id }));
      }
    } catch (err) {
      console.error('[BinanceBoostTab] submit error:', err);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleClaim = async () => {
    if (status !== 'approved' || !submissionId) return;
    await supabase.from('screenshot_submissions').update({ status: 'claimed' }).eq('id', submissionId);
    setStatus('claimed');
    onClaimBonus(100000);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDailyClaim = () => {
    if (!canClaimToday) return;
    onDailyClaim();
    setClaimedReward(todayReward);
    setShowDailyBonus(true);
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    clearFile();
    setScreenshotUrl('');
  };

  const statusConfig = {
    pending:  { icon: Clock,   color: 'text-amber-500', label: t.pending },
    approved: { icon: Check,   color: 'text-green-500', label: t.approved },
    rejected: { icon: XCircle, color: 'text-red-500',   label: t.rejected },
    claimed:  { icon: Check,   color: 'text-sky-500',   label: t.alreadyClaimed },
  };

  const canSubmit = inputMode === 'url'
    ? screenshotUrl.trim().length > 0
    : selectedFile !== null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold text-white text-lg">
            ‹
          </button>
          <h1 className="font-pixel text-white text-xs tracking-widest drop-shadow-md flex-1 text-center">
            {t.boostRewards}
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">

        {/* ── Daily Reward Calendar ───────────────────────────────────────── */}
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="card-white rounded-3xl px-5 py-5 pixel-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-500" />
            <h2 className="font-pixel text-gray-800 text-[10px] tracking-wide">{t.dailyRewards}</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-lg">🔥</span>
              <span className="font-pixel text-orange-500 text-sm font-bold">{dailyStreak}</span>
              <span className="font-pixel text-gray-400 text-[7px]">{t.days}</span>
            </div>
          </div>

          {/* 7-day calendar grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {DAILY_REWARDS.map((reward, i) => {
              const day = i + 1;
              const isClaimed = day <= claimedInCycle;
              const isToday = day === claimedInCycle + 1 && canClaimToday;
              const isTodayClaimed = alreadyClaimedToday && day === claimedInCycle;
              const isLocked = !isClaimed && !isToday && !isTodayClaimed;
              return (
                <motion.div
                  key={day}
                  className={`rounded-xl p-1.5 text-center border-2 transition-colors ${
                    isTodayClaimed ? 'bg-emerald-50 border-emerald-400' :
                    isClaimed ? 'bg-emerald-50 border-emerald-300' :
                    isToday ? 'bg-sky-50 border-sky-400 shadow-md' :
                    'bg-gray-50 border-gray-200'
                  }`}
                  animate={isToday && !alreadyClaimedToday ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="font-pixel text-[6px] text-gray-400">D{day}</p>
                  <p className="font-pixel text-[7px] mt-0.5 leading-tight" style={{
                    color: isClaimed || isTodayClaimed ? '#16a34a' : isToday ? '#0284c7' : '#D1D5DB'
                  }}>
                    {fmt(reward)}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-none">
                    {isClaimed || isTodayClaimed ? '✓' : isToday ? '⭐' : isLocked ? '🔒' : '⭐'}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Claim button */}
          {alreadyClaimedToday ? (
            <div className="w-full py-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
              <p className="font-pixel text-[9px] text-emerald-600">{t.claimedToday}</p>
            </div>
          ) : (
            <motion.button
              onClick={handleDailyClaim}
              disabled={!canClaimToday}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3.5 rounded-xl font-pixel text-[9px] flex items-center justify-center gap-2 bg-orange-400 text-white tap-btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base">🎁</span> {t.claimDay} {claimedInCycle + 1} — +{fmt(todayReward)} kW
            </motion.button>
          )}

          {missedDay && dailyStreak > 0 && (
            <p className="font-pixel text-[8px] text-red-500 text-center mt-2">{t.streakReset}</p>
          )}
        </motion.div>

        {/* ── Binance Vote / Screenshot ───────────────────────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="card-white rounded-3xl px-5 py-5"
        >
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute -top-2 -right-4">
                <div className="w-8 h-8 rounded-full bg-yellow-300 border-2 border-yellow-400 shadow-md flex items-center justify-center text-base">
                  ☀️
                </div>
              </div>
              <RobotMascot size={100} />
            </div>
          </div>

          <h2 className="font-pixel text-gray-800 text-[10px] text-center leading-relaxed mb-2">
            {t.binanceTitle}
          </h2>
          <p className="text-gray-600 text-xs text-center leading-relaxed mb-3">
            {t.binanceDesc}{' '}
            <span className="font-bold text-yellow-500">{t.binanceBonus}</span>.
          </p>
          <div className="text-center mb-4">
            <a href="https://www.binance.com/uk-UA/events/resiliencelabvotingforprojects"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-pixel text-[9px] text-sky-500 underline">
              <ExternalLink size={10} /> {t.voteLink}
            </a>
          </div>

          {(status === 'none' || status === 'rejected') && (
            <div className="space-y-3">
              {status === 'rejected' && (
                <p className="text-red-500 text-xs text-center font-medium">{t.rejectedNotice}</p>
              )}

              {/* Mode toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => switchMode('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-pixel text-[8px] transition-all ${
                    inputMode === 'url'
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-gray-400'
                  }`}
                >
                  <Link2 size={12} />
                  {t.pasteLink}
                </button>
                <button
                  onClick={() => switchMode('photo')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-pixel text-[8px] transition-all ${
                    inputMode === 'photo'
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-gray-400'
                  }`}
                >
                  <Camera size={12} />
                  {t.attachPhoto}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {inputMode === 'url' ? (
                  <motion.div
                    key="url"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <input
                      type="url"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder={t.screenshotPlaceholder}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 text-gray-700"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="photo"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {previewUrl ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-sky-300 bg-gray-50">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full max-h-48 object-contain"
                        />
                        <button
                          onClick={clearFile}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X size={14} className="text-white" />
                        </button>
                        <div className="px-3 py-1.5 bg-sky-50 border-t border-sky-200">
                          <p className="font-pixel text-[7px] text-sky-600 truncate">{selectedFile?.name}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-sky-400 hover:bg-sky-50 transition-colors"
                      >
                        <Camera size={28} className="text-gray-300" />
                        <p className="font-pixel text-[8px] text-gray-400">{t.tapToUpload}</p>
                        <p className="text-[10px] text-gray-300">JPG, PNG, WEBP — max 5 MB</p>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload progress bar */}
              {uploading && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || uploading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl bg-sky-500 text-white font-pixel text-[9px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(submitting || uploading)
                  ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  : <Send size={14} />}
                {t.submitScreenshot}
              </motion.button>
            </div>
          )}

          {status !== 'none' && status !== 'rejected' && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-2xl p-3 border-2 border-gray-100">
                {(() => {
                  const cfg = statusConfig[status];
                  const Icon = cfg.icon;
                  return (
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={cfg.color} />
                      <div>
                        <p className={`font-medium text-sm ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-gray-400 text-[9px] font-pixel">ID: {submissionId?.slice(0, 8)}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {status === 'pending' && (
                <button
                  onClick={() => submissionId && checkStatus(submissionId)}
                  className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-pixel text-[9px] flex items-center justify-center gap-2"
                >
                  <Clock size={12} /> {t.checkStatus}
                </button>
              )}
              <motion.button
                onClick={handleClaim}
                disabled={status !== 'approved'}
                whileTap={status === 'approved' ? { scale: 0.96 } : {}}
                className={`w-full py-3 rounded-xl font-pixel text-[9px] flex items-center justify-center gap-2 ${
                  status === 'claimed' ? 'bg-sky-100 text-sky-500 cursor-default' :
                  status === 'approved' ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {status === 'claimed' ? <><Check size={14} /> {t.claimed}</> : <><span>⚡</span> {t.claim100k}</>}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Native ad banner */}
        <NativeAdBanner className="min-h-[90px] w-full rounded-2xl overflow-hidden bg-white/70 border border-white/50" />
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50">
            <div className="bg-green-500 text-white rounded-2xl px-5 py-3 text-center shadow-xl font-pixel text-[10px]">
              +100,000 ⚡ BONUS RECEIVED!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showDailyBonus && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDailyBonus(false)} />
          <motion.div
            className="relative z-10 mx-6 w-full max-w-xs"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <div className="bg-gradient-to-b from-orange-400 to-amber-500 rounded-3xl px-6 py-6 shadow-2xl border-4 border-orange-300 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {['★', '★', '★'].map((s, i) => (
                  <motion.span key={i} className="text-white text-xl"
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 400 }}
                  >{s}</motion.span>
                ))}
              </div>
              <p className="font-pixel text-white text-xs tracking-widest mb-1">{t.dailyRewards}</p>
              <motion.div className="my-3"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 16 }}>
                <span className="font-pixel text-white text-4xl drop-shadow-lg">+{fmt(claimedReward)}</span>
                <span className="font-pixel text-yellow-200 text-lg ml-1">kW</span>
              </motion.div>
              <p className="font-pixel text-orange-100 text-[8px] tracking-wide mb-4">{t.claimed} ⚡</p>
              <motion.button
                onClick={() => setShowDailyBonus(false)}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-white rounded-xl font-pixel text-[9px] text-orange-600 tracking-wide"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              >
                ⚡ OK!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
