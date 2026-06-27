import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RefreshCw, Check, AlertTriangle, Users, Settings,
  Image, ChevronRight, Save, Zap, DollarSign, Edit3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  UPGRADE_DEFINITIONS,
  type ConfigOverrides,
} from '../lib/gameConfig';
import type { Translations } from '../lib/i18n';

const ADMIN_TG_ID = '574814684';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Submission {
  id: string;
  player_id: string | null;
  player_name: string;
  screenshot_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'claimed';
  created_at: string;
}

interface UserRow {
  id: string;
  name: string;
  telegram_id: string | null;
  avatar: string;
  energy: number;
  multiplier: number;
  passive_income: number;
}

interface EconomyForm {
  upgrades: Record<string, { baseCost: string; passiveRate: string }>;
  tapCost: string;
  tapRegenRate: string;
  tapCapacityMax: string;
  batteryFeedCost: string;
  batteryDecayPerHour: string;
}

interface AdminDashboardProps {
  onClose: () => void;
  onConfigChange: (overrides: ConfigOverrides) => void;
  t: Translations;
}

// ─── Section: Screenshots ─────────────────────────────────────────────────────

function ScreenshotsSection() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('screenshot_submissions').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') q = q.eq('status', 'pending');
    const { data } = await q.limit(50);
    setSubmissions((data as Submission[]) ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const approve = async (sub: Submission) => {
    setProcessing(sub.id);
    await supabase
      .from('screenshot_submissions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', sub.id);
    if (sub.player_id) {
      // Fetch current energy and add 100k
      const { data: player } = await supabase
        .from('players').select('energy').eq('id', sub.player_id).maybeSingle();
      if (player) {
        await supabase
          .from('players')
          .update({ energy: player.energy + 100000, updated_at: new Date().toISOString() })
          .eq('id', sub.player_id);
      }
    }
    setProcessing(null);
    fetchSubmissions();
  };

  const reject = async (sub: Submission) => {
    setProcessing(sub.id);
    await supabase
      .from('screenshot_submissions')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', sub.id);
    setProcessing(null);
    fetchSubmissions();
  };

  const statusBadge: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600' },
    claimed:  { label: 'Claimed',  cls: 'bg-slate-100 text-slate-500' },
  };

  return (
    <div>
      {/* Filter + refresh row */}
      <div className="flex items-center gap-2 mb-4">
        {(['pending', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {f === 'pending' ? 'Pending' : 'All'}
          </button>
        ))}
        <button
          onClick={fetchSubmissions}
          className="ml-auto p-1.5 rounded-lg bg-slate-700 text-slate-300"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && submissions.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8">
          <Image size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-slate-500 text-sm">No {filter === 'pending' ? 'pending' : ''} submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const badge = statusBadge[sub.status];
            const busy = processing === sub.id;
            return (
              <div key={sub.id} className="bg-slate-700/60 rounded-xl p-3 border border-slate-600">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{sub.player_name || 'Unknown'}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {sub.screenshot_url && (
                  <a
                    href={sub.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 text-xs underline flex items-center gap-1 mb-3 truncate"
                  >
                    <Image size={11} />
                    {sub.screenshot_url}
                  </a>
                )}

                {sub.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      onClick={() => approve(sub)}
                      disabled={busy}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {busy ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve +100k kW
                    </motion.button>
                    <motion.button
                      onClick={() => reject(sub)}
                      disabled={busy}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-lg bg-red-600/80 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <X size={12} /> Reject
                    </motion.button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Section: Economy Settings ────────────────────────────────────────────────

function EconomySection({ onConfigChange }: { onConfigChange: AdminDashboardProps['onConfigChange'] }) {
  const [form, setForm] = useState<EconomyForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('game_config').select('*').eq('id', 1).maybeSingle();
      const ov = (data?.upgrade_overrides ?? {}) as Record<string, { baseCost?: number; passiveRate?: number }>;
      const upgrades: EconomyForm['upgrades'] = {};
      for (const def of UPGRADE_DEFINITIONS) {
        upgrades[def.id] = {
          baseCost: String(ov[def.id]?.baseCost ?? def.baseCost),
          passiveRate: String(ov[def.id]?.passiveRate ?? def.passiveRate),
        };
      }
      setForm({
        upgrades,
        tapCost: String(data?.tap_cost ?? 10),
        tapRegenRate: String(data?.tap_regen_rate ?? 10),
        tapCapacityMax: String(data?.tap_capacity_max ?? 1000),
        batteryFeedCost: String(data?.battery_feed_cost ?? 1000),
        batteryDecayPerHour: String(data?.battery_decay_per_hour ?? 5),
      });
      setLoading(false);
    }
    load();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const upgradeOverrides: Record<string, { baseCost: number; passiveRate: number }> = {};
    for (const def of UPGRADE_DEFINITIONS) {
      upgradeOverrides[def.id] = {
        baseCost: parseInt(form.upgrades[def.id].baseCost) || def.baseCost,
        passiveRate: parseInt(form.upgrades[def.id].passiveRate) || def.passiveRate,
      };
    }
    const payload = {
      upgrade_overrides: upgradeOverrides,
      tap_cost: parseInt(form.tapCost) || 10,
      tap_regen_rate: parseInt(form.tapRegenRate) || 10,
      tap_capacity_max: parseInt(form.tapCapacityMax) || 1000,
      battery_feed_cost: parseInt(form.batteryFeedCost) || 1000,
      battery_decay_per_hour: parseFloat(form.batteryDecayPerHour) || 5,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('game_config').update(payload).eq('id', 1);
    const overrides: ConfigOverrides = {
      upgradeOverrides: {},
      tapCost: payload.tap_cost,
      tapRegenRate: payload.tap_regen_rate,
      tapCapacityMax: payload.tap_capacity_max,
      batteryFeedCost: payload.battery_feed_cost,
      batteryDecayPerHour: payload.battery_decay_per_hour,
    };
    for (const def of UPGRADE_DEFINITIONS) {
      overrides.upgradeOverrides![def.id] = upgradeOverrides[def.id];
    }
    onConfigChange(overrides);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading || !form) {
    return <div className="text-slate-500 text-sm text-center py-8">Loading config...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Upgrade costs */}
      <div>
        <p className="text-slate-400 text-[10px] tracking-widest mb-3 font-bold">UPGRADE PRICES</p>
        {UPGRADE_DEFINITIONS.map((def) => (
          <div key={def.id} className="bg-slate-700/60 rounded-xl p-3 mb-2 border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{def.icon}</span>
              <span className="text-white text-xs font-medium">{def.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-slate-400 text-[9px] tracking-wide">BASE COST (kW)</span>
                <input
                  type="number"
                  value={form.upgrades[def.id].baseCost}
                  onChange={(e) =>
                    setForm((f) => f ? { ...f, upgrades: { ...f.upgrades, [def.id]: { ...f.upgrades[def.id], baseCost: e.target.value } } } : f)
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </label>
              <label className="block">
                <span className="text-slate-400 text-[9px] tracking-wide">PASSIVE kW/s</span>
                <input
                  type="number"
                  value={form.upgrades[def.id].passiveRate}
                  onChange={(e) =>
                    setForm((f) => f ? { ...f, upgrades: { ...f.upgrades, [def.id]: { ...f.upgrades[def.id], passiveRate: e.target.value } } } : f)
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Global tap settings */}
      <div>
        <p className="text-slate-400 text-[10px] tracking-widest mb-3 font-bold">TAP SETTINGS</p>
        <div className="bg-slate-700/60 rounded-xl p-3 border border-slate-600 grid grid-cols-3 gap-2">
          {[
            { label: 'TAP COST', key: 'tapCost' as const },
            { label: 'REGEN/s', key: 'tapRegenRate' as const },
            { label: 'CAPACITY', key: 'tapCapacityMax' as const },
          ].map(({ label, key }) => (
            <label key={key} className="block">
              <span className="text-slate-400 text-[9px] tracking-wide">{label}</span>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm((f) => f ? { ...f, [key]: e.target.value } : f)}
                className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Battery settings */}
      <div>
        <p className="text-slate-400 text-[10px] tracking-widest mb-3 font-bold">BATTERY / TAMAGOTCHI</p>
        <div className="bg-slate-700/60 rounded-xl p-3 border border-slate-600 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-slate-400 text-[9px] tracking-wide">FEED COST (kW)</span>
            <input
              type="number"
              value={form.batteryFeedCost}
              onChange={(e) => setForm((f) => f ? { ...f, batteryFeedCost: e.target.value } : f)}
              className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </label>
          <label className="block">
            <span className="text-slate-400 text-[9px] tracking-wide">DECAY %/HOUR</span>
            <input
              type="number"
              step="0.5"
              value={form.batteryDecayPerHour}
              onChange={(e) => setForm((f) => f ? { ...f, batteryDecayPerHour: e.target.value } : f)}
              className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </label>
        </div>
        <p className="text-slate-600 text-[9px] mt-1 px-1">
          Current: full battery lasts {(100 / (parseFloat(form.batteryDecayPerHour) || 5)).toFixed(1)} hours
        </p>
      </div>

      <motion.button
        onClick={save}
        disabled={saving}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          saved ? 'bg-green-600 text-white' : 'bg-sky-500 text-white'
        }`}
      >
        {saving ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : saved ? (
          <><Check size={16} /> Saved!</>
        ) : (
          <><Save size={16} /> Save Settings</>
        )}
      </motion.button>

      <p className="text-slate-500 text-[10px] text-center">
        Changes apply immediately to all active sessions.
      </p>
    </div>
  );
}

// ─── Section: User Management ─────────────────────────────────────────────────

function UsersSection() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('players')
      .select('id, name, telegram_id, avatar, energy, multiplier, passive_income')
      .order('energy', { ascending: false })
      .limit(30);
    setUsers((data as UserRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const startEdit = (user: UserRow) => {
    setEditing(user.id);
    setEditValue(String(user.energy));
  };

  const saveEnergy = async (userId: string) => {
    const newEnergy = parseInt(editValue);
    if (isNaN(newEnergy) || newEnergy < 0) return;
    setSaving(true);
    await supabase
      .from('players')
      .update({ energy: newEnergy, updated_at: new Date().toISOString() })
      .eq('id', userId);
    setUsers((u) => u.map((p) => p.id === userId ? { ...p, energy: newEnergy } : p));
    setEditing(null);
    setSaving(false);
  };

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n.toLocaleString();

  if (loading) {
    return <div className="text-slate-500 text-sm text-center py-8">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-[10px] tracking-widest font-bold">TOP 30 PLAYERS</p>
        <button onClick={fetchUsers} className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {users.map((user, i) => (
          <div key={user.id} className="bg-slate-700/60 rounded-xl border border-slate-600">
            <div className="flex items-center gap-2 p-3">
              <span className="text-slate-500 text-xs w-5 text-center">{i + 1}</span>
              <span className="text-xl">{user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{user.name}</p>
                <p className="text-slate-500 text-[9px]">
                  {user.telegram_id ? `TG: ${user.telegram_id}` : 'No Telegram'} · ×{user.multiplier} · {user.passive_income}/s
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sky-400 text-xs font-bold">{fmt(user.energy)}</span>
                <button
                  onClick={() => startEdit(user)}
                  className="p-1.5 rounded-lg bg-slate-600 text-slate-300"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {editing === user.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 flex gap-2 border-t border-slate-600 pt-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="New energy value"
                      className="flex-1 bg-slate-800 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                    <motion.button
                      onClick={() => saveEnergy(user.id)}
                      disabled={saving}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold"
                    >
                      {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={14} />}
                    </motion.button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

type AdminSection = 'screenshots' | 'economy' | 'users';

const SECTIONS: { id: AdminSection; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'screenshots', label: 'Screenshots', icon: Image },
  { id: 'economy',     label: 'Economy',     icon: DollarSign },
  { id: 'users',       label: 'Users',       icon: Users },
];

export default function AdminDashboard({ onClose, onConfigChange, t }: AdminDashboardProps) {
  const [section, setSection] = useState<AdminSection>('screenshots');

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"
          >
            <X size={16} className="text-slate-300" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-sky-400" />
              <h1 className="font-bold text-white text-sm tracking-wide">{t.adminTitle}</h1>
              <span className="text-[9px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 font-bold">
                RESTRICTED
              </span>
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5">TG: {ADMIN_TG_ID}</p>
          </div>
          <Zap size={18} className="text-yellow-400" />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex-shrink-0 flex border-b border-slate-700">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
              section === id
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {section === 'screenshots' && <ScreenshotsSection />}
            {section === 'economy' && <EconomySection onConfigChange={onConfigChange} />}
            {section === 'users' && <UsersSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Guard component ─────────────────────────────────────────────────────────

interface AdminGuardProps extends AdminDashboardProps {
  telegramId: string | null;
}

export function AdminGuard({ telegramId, ...rest }: AdminGuardProps) {
  if (telegramId !== ADMIN_TG_ID) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-8">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <h2 className="font-bold text-lg mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm text-center mb-6">This area is restricted to admins.</p>
        <button
          onClick={rest.onClose}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 rounded-xl text-sm font-medium"
        >
          <ChevronRight size={14} className="rotate-180" /> Go back
        </button>
      </div>
    );
  }
  return <AdminDashboard {...rest} />;
}
