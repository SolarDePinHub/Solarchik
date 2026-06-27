import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Users, Gift, Link, Shield, Share2 } from 'lucide-react';
import type { Translations } from '../lib/i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & { Telegram?: any };

interface ReferralTabProps {
  playerId: string | null;
  referralCount: number;
  bonusClaimed: boolean;
  isAdmin: boolean;
  onBack: () => void;
  onOpenAdmin: () => void;
  t: Translations;
}

export default function ReferralTab({
  playerId,
  referralCount,
  bonusClaimed,
  isAdmin,
  onBack,
  onOpenAdmin,
  t,
}: ReferralTabProps) {
  const [copied, setCopied] = useState(false);

  const botUsername = import.meta.env.VITE_BOT_USERNAME;
  const isBotConfigured = botUsername && botUsername !== 'YOUR_BOT_USERNAME';
  const referralLink = playerId && isBotConfigured
    ? `https://t.me/${botUsername}?start=ref_${playerId}`
    : null;

  const tgWebApp = window.Telegram?.WebApp;

  const handleShare = () => {
    if (!referralLink) return;
    const shareText = 'Грай у SOLARCHYK та збирай сонячну енергію разом зі мною!';
    if (tgWebApp?.openTelegramLink) {
      tgWebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`
      );
    } else if (navigator.share) {
      navigator.share({ title: 'SOLARCHYK', text: shareText, url: referralLink }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for Telegram WebApp where clipboard API may be restricted
        const el = document.createElement('textarea');
        el.value = referralLink;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    } catch { /* silent — user will see the link anyway */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {t.referrals}
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {/* Hero card */}
        <motion.div
          className="card-white rounded-2xl px-5 py-5 pixel-border text-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users size={32} className="text-white" />
          </div>
          <h2 className="font-pixel text-gray-800 text-[10px] tracking-wide">{t.inviteFriends}</h2>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            {t.inviteDesc}{' '}
            <span className="text-sky-600 font-bold">{t.inviteBonus}</span>{' '}
            {t.inviteWhen}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="card-white rounded-2xl p-4 pixel-border text-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            <p className="font-pixel text-[8px] text-gray-400 tracking-widest">{t.invited}</p>
            <p className="font-pixel text-sky-600 text-2xl mt-1">{referralCount}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{t.friends}</p>
          </motion.div>

          <motion.div
            className="card-white rounded-2xl p-4 pixel-border text-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            <p className="font-pixel text-[8px] text-gray-400 tracking-widest">{t.earned}</p>
            <p className="font-pixel text-emerald-500 text-2xl mt-1">
              {(referralCount * 50000).toLocaleString()}
            </p>
            <p className="text-gray-400 text-[10px] mt-0.5">{t.kwTotal}</p>
          </motion.div>
        </div>

        {/* Referral bonus status */}
        {bonusClaimed && (
          <motion.div
            className="card-white rounded-2xl px-4 py-3 pixel-border flex items-center gap-3 border-2 border-emerald-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{t.joinedViaReferral}</p>
              <p className="text-emerald-600 text-xs font-pixel text-[8px]">{t.referralBonusApplied}</p>
            </div>
          </motion.div>
        )}

        {/* Your link */}
        <motion.div
          className="card-white rounded-2xl px-4 py-4 pixel-border"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Link size={14} className="text-sky-500" />
            <p className="font-pixel text-gray-600 text-[8px] tracking-widest">{t.yourReferralLink}</p>
          </div>

          {referralLink ? (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                <p className="text-gray-600 text-xs break-all leading-relaxed font-mono">
                  {referralLink}
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  className={`flex-1 py-3 rounded-xl pixel-btn font-pixel text-[9px] tracking-wide flex items-center justify-center gap-2 transition-colors ${
                    copied ? 'bg-emerald-400 text-emerald-900' : 'bg-sky-400 text-white'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="copied" className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <Check size={14} />{t.copied}
                      </motion.span>
                    ) : (
                      <motion.span key="copy" className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <Copy size={14} />{t.copyLink}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl pixel-btn bg-green-400 text-white flex items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={16} />
                </motion.button>
              </div>
            </>
          ) : !isBotConfigured ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 text-center">
              <p className="text-amber-700 font-pixel text-[8px] leading-relaxed">
                Set VITE_BOT_USERNAME in .env to enable referral links
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl px-3 py-3 text-center">
              <p className="text-gray-400 font-pixel text-[8px]">{t.loadingCode}</p>
            </div>
          )}
        </motion.div>

        {/* How it works */}
        <motion.div
          className="card-white rounded-2xl px-4 py-4 pixel-border"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          <p className="font-pixel text-gray-600 text-[8px] tracking-widest mb-3">{t.howItWorks}</p>
          {[
            t.step1, t.step2, t.step3, t.step4,
          ].map((text, i) => (
            <motion.div key={i} className="flex items-start gap-3 mb-2.5 last:mb-0"
              initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.18 + i * 0.04 }}>
              <div className="w-6 h-6 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-pixel text-sky-600 text-[8px]">{i + 1}</span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Admin access — only visible for admin Telegram ID */}
        {isAdmin && (
          <motion.button
            onClick={onOpenAdmin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            className="w-full card-white rounded-2xl px-4 py-3 pixel-border flex items-center gap-3 border-2 border-red-200"
          >
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-800 text-sm">{t.adminDashboard}</p>
              <p className="text-gray-400 text-[10px]">{t.restrictedAccess}</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-red-500 text-white rounded-full font-bold">{t.admin}</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
