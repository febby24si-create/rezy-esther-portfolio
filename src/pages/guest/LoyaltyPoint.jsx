import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdStar, MdArrowUpward, MdArrowDownward, MdCheckCircle,
  MdCardGiftcard, MdShield, MdLocalOffer, MdAutorenew,
  MdArrowForward, MdLock,
} from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import {
  AnimatedPage, ScrollReveal, StaggerReveal, StaggerItem,
  AnimatedProgress, fadeUp
} from '../../components/AnimatedPage'
import PageSkeleton from '../../components/ui/PageSkeleton'

// ─── Reward catalog ────────────────────────────────────────────────────
const REWARDS = [
  { id: 'R01', name: 'Diskon 10% Service',    points: 500,  category: 'Voucher',     diskonPct: 10,  icon: '🏷️', available: true,  color: '#60A5FA' },
  { id: 'R02', name: 'Ganti Oli Gratis',       points: 1000, category: 'Service',     diskonPct: 100, icon: '🛢️', available: true,  color: '#34D399' },
  { id: 'R03', name: 'Service Berkala Gratis', points: 2500, category: 'Service',     diskonPct: 100, icon: '🔧', available: true,  color: '#F59E0B' },
  { id: 'R04', name: 'Voucher Rp 100.000',     points: 800,  category: 'Voucher',     diskonPct: 15,  icon: '💳', available: true,  color: '#A78BFA' },
  { id: 'R05', name: 'Tune Up Gratis',         points: 2000, category: 'Service',     diskonPct: 100, icon: '⚙️', available: true,  color: '#F472B6' },
  { id: 'R06', name: 'Cuci Mobil Gratis',      points: 300,  category: 'Service',     diskonPct: 100, icon: '🚿', available: true,  color: '#22D3EE' },
  { id: 'R07', name: 'Merchandise Esther',     points: 1500, category: 'Merchandise', diskonPct: 0,   icon: '👕', available: false, color: '#94A3B8' },
]

const TIER_BENEFITS = {
  Bronze:   ['Promo umum bengkel', 'Voucher dasar after-service', 'Booking online'],
  Silver:   ['Semua benefit Bronze', 'Diskon 5% setiap servis', 'Voucher berkala bulanan', 'Promo member eksklusif'],
  Gold:     ['Semua benefit Silver', 'Diskon 10% setiap servis', 'Voucher premium', 'Prioritas booking', 'Early access promo'],
  Platinum: ['Semua benefit Gold', 'Diskon 15% setiap servis', 'Voucher eksklusif', 'Prioritas booking tertinggi', 'Reward loyal customer', 'Antar-jemput kendaraan'],
}

const TIER_META = {
  Bronze:   { gradient: 'linear-gradient(135deg,#431407 0%,#7C2D12 50%,#431407 100%)', glow: 'rgba(249,115,22,0.4)',  accent: '#F97316', shimmer: 'rgba(249,115,22,0.15)' },
  Silver:   { gradient: 'linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)', glow: 'rgba(148,163,184,0.35)', accent: '#94A3B8', shimmer: 'rgba(148,163,184,0.12)' },
  Gold:     { gradient: 'linear-gradient(135deg,#451A03 0%,#78350F 50%,#451A03 100%)', glow: 'rgba(251,191,36,0.45)',  accent: '#FBBF24', shimmer: 'rgba(251,191,36,0.18)' },
  Platinum: { gradient: 'linear-gradient(135deg,#2E1065 0%,#4C1D95 50%,#2E1065 100%)', glow: 'rgba(168,85,247,0.45)',  accent: '#A855F7', shimmer: 'rgba(168,85,247,0.15)' },
}

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum']

// ─── Mini progress ring ────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, stroke = 7, color = '#22C55E' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

// ─── Star display ──────────────────────────────────────────────────────
function Stars({ count = 5, filled = 5, color = '#FBBF24', size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <MdStar key={i} size={size} style={{ color: i < filled ? color : 'rgba(255,255,255,0.1)' }} />
      ))}
    </div>
  )
}

export default function LoyaltyPoint() {
  const [tab, setTab]             = useState('riwayat')
  const [redeemMsg, setRedeemMsg] = useState(null)
  const [history, setHistory]     = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const { customer, refreshCustomer } = useCustomerAuth()

  // Load riwayat poin dari Supabase
  useEffect(() => {
    if (!customer?.id) return
    import('../../services/pointAPI').then(({ pointAPI }) => {
      pointAPI.fetchByCustomer(customer.id).then(setHistory).catch(() => {}).finally(() => setLoadingHistory(false))
    })
  }, [customer?.id])

  if (!customer) return null

  const loyalty  = calcLoyaltyProgress(customer.points || 0)
  const tierCfg  = TIER_CONFIG[loyalty.tier]
  const tierMeta = TIER_META[loyalty.tier]
  const totalIn  = history.filter(h => h.type === 'in').reduce((a, b) => a + b.points, 0)
  const totalOut = Math.abs(history.filter(h => h.type === 'out').reduce((a, b) => a + b.points, 0))

  const handleRedeem = async (reward) => {
    if ((customer.points || 0) < reward.points) {
      setRedeemMsg({ ok: false, text: 'Poin tidak cukup untuk redeem reward ini.' })
      setTimeout(() => setRedeemMsg(null), 3500)
      return
    }
    try {
      const { customerAPI } = await import('../../services/customerAPI')
      const { pointAPI }    = await import('../../services/pointAPI')
      const { voucherAPI }  = await import('../../services/voucherAPI')

      // Kurangi poin
      const newPoints = (customer.points || 0) - reward.points
      await customerAPI.update(customer.id, { points: newPoints })

      // Catat riwayat poin keluar
      await pointAPI.addPoint({
        customer_id:  customer.id,
        type:         'out',
        points:       -reward.points,
        description:  `Redeem: ${reward.name}`,
        created_by:   'system',
      })

      // Buat voucher reward
      await voucherAPI.create({
        customer_id:  customer.id,
        code:         'RWD' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        title:        reward.name,
        discount_pct: reward.discount || 10,
        status:       'active',
        type:         'loyalty',
        valid_until:  new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        created_by:   'system',
      })

      await refreshCustomer()

      // Refresh history
      const { pointAPI: pAPI } = await import('../../services/pointAPI')
      const updated = await pAPI.fetchByCustomer(customer.id)
      setHistory(updated)

      setRedeemMsg({ ok: true, text: '✓ Berhasil ditukar! Cek Voucher Saya.' })
      setTimeout(() => setRedeemMsg(null), 3500)
    } catch (err) {
      setRedeemMsg({ ok: false, text: `Gagal redeem: ${err.message}` })
      setTimeout(() => setRedeemMsg(null), 3500)
    }
  }

  const TABS = [
    { key: 'riwayat', label: 'Riwayat', icon: '📋' },
    { key: 'reward',  label: 'Reward',  icon: '🎁' },
    { key: 'tier',    label: 'Semua Tier', icon: '🏆' },
  ]

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          {/* ── Page title ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Program Loyalitas</p>
            <h1 className="text-3xl font-black text-white">Loyalty Point Anda</h1>
            <p className="text-gray-500 text-sm mt-1">Kumpulkan poin, naik tier, tukar hadiah eksklusif</p>
          </motion.div>

          {/* ── Redeem feedback ─────────────────────────────────── */}
          <AnimatePresence>
            {redeemMsg && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                className={`mb-5 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${redeemMsg.ok ? 'text-green-400' : 'text-red-400'}`}
                style={{
                  background: redeemMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${redeemMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}
              >
                <span className="text-xl">{redeemMsg.ok ? '🎉' : '⚠️'}</span>
                {redeemMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── HERO TIER CARD ───────────────────────────────────── */}
          <ScrollReveal variant={fadeUp} className="mb-5">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: tierMeta.gradient,
                boxShadow: `0 12px 60px ${tierMeta.glow}`,
              }}
            >
              {/* Background decorations */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
                  style={{ background: `radial-gradient(circle, ${tierMeta.shimmer} 0%, transparent 70%)` }} />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
                  style={{ background: `radial-gradient(circle, ${tierMeta.shimmer} 0%, transparent 70%)` }} />
                <div className="absolute inset-0 opacity-[0.025]"
                  style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              <div className="relative p-6 sm:p-8">
                {/* Top row */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
                      {customer.name}
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <motion.span
                        key={customer.points}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-5xl sm:text-6xl font-black text-white tabular-nums"
                      >
                        {(customer.points || 0).toLocaleString('id-ID')}
                      </motion.span>
                      <span className="text-white/40 text-xl font-semibold">poin</span>
                    </div>
                    <p className="text-white/35 text-sm">
                      ≈ Rp {((customer.points || 0) * 100).toLocaleString('id-ID')} nilai tukar
                    </p>
                  </div>

                  {/* Tier badge with progress ring */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <ProgressRing pct={loyalty.progress} size={72} stroke={5} color={tierMeta.accent} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                          animate={{ rotate: [0, 6, -6, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-2xl"
                        >
                          {tierCfg.icon}
                        </motion.span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-black px-3 py-1 rounded-full"
                      style={{ background: `${tierMeta.accent}25`, color: tierMeta.accent, border: `1px solid ${tierMeta.accent}40` }}
                    >
                      {loyalty.tier}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-white/40 text-xs mb-2">
                    <span className="font-semibold">{loyalty.tier}</span>
                    {loyalty.nextTier
                      ? <span>{loyalty.pointsToNext.toLocaleString('id-ID')} poin lagi → <strong className="text-white/60">{loyalty.nextTier}</strong></span>
                      : <span className="text-white/60 font-bold">🏆 Tier Tertinggi!</span>
                    }
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${tierMeta.accent}cc, ${tierMeta.accent})` }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${loyalty.progress}%` }}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-1.5">{loyalty.progress}% selesai</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Quick Stats ──────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Poin Masuk',      value: totalIn.toLocaleString('id-ID'),  icon: <MdArrowUpward />,     color: '#34D399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)' },
              { label: 'Poin Keluar',     value: totalOut.toLocaleString('id-ID'), icon: <MdArrowDownward />,   color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)' },
              { label: 'Reward Tersedia', value: REWARDS.filter(r => r.available).length, icon: <MdCardGiftcard />, color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  border: 'rgba(252,211,77,0.15)' },
            ].map(({ label, value, icon, color, bg, border }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.2 }}
                className="rounded-2xl p-4 text-center"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 text-lg" style={{ background: `${color}18`, color }}>
                  {icon}
                </div>
                <div className="text-xl font-black" style={{ color }}>{value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* ── Current tier benefits card ───────────────────────── */}
          <ScrollReveal className="mb-6">
            <div
              className="rounded-2xl p-5"
              style={{ background: tierCfg.bg, border: `1px solid ${tierCfg.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${tierCfg.color}20` }}>
                  <MdShield size={16} style={{ color: tierCfg.color }} />
                </div>
                <h3 className="text-white font-bold text-sm">Benefit {loyalty.tier} Member</h3>
                <span className="ml-auto text-xl">{tierCfg.icon}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(TIER_BENEFITS[loyalty.tier] || []).map((b, i) => (
                  <motion.div key={b}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-xs text-gray-300 bg-white/3 rounded-lg px-3 py-2"
                  >
                    <MdCheckCircle className="flex-shrink-0 text-sm" style={{ color: tierCfg.color }} />
                    {b}
                  </motion.div>
                ))}
              </div>
              {loyalty.nextTier && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                  <MdArrowForward size={13} style={{ color: TIER_CONFIG[loyalty.nextTier].color }} />
                  <p className="text-xs text-gray-500">
                    Naik ke <span className="font-bold" style={{ color: TIER_CONFIG[loyalty.nextTier].color }}>{loyalty.nextTier}</span> untuk membuka lebih banyak benefit
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* ── Tab navigation ──────────────────────────────────── */}
          <div
            className="flex gap-1 p-1 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={tab === key
                  ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }
                  : { color: '#6B7280' }
                }
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
                {tab === key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border: '1px solid rgba(74,222,128,0.2)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ─────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* RIWAYAT POIN */}
            {tab === 'riwayat' && (
              <motion.div key="riwayat"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {loadingHistory ? (
                  <PageSkeleton variant="list" count={4} />
                ) : history.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 flex flex-col items-center gap-3">
                    <div className="text-5xl opacity-30">📋</div>
                    <p className="text-sm">Belum ada riwayat poin.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <motion.div key={h.id}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
                        style={{
                          background: h.type === 'in' ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.04)',
                          borderColor: h.type === 'in' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: h.type === 'in' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }}
                        >
                          {h.type === 'in'
                            ? <MdArrowUpward className="text-emerald-400 text-xl" />
                            : <MdArrowDownward className="text-red-400 text-xl" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{h.desc}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <span
                          className="text-sm font-black tabular-nums px-3 py-1 rounded-full"
                          style={h.type === 'in'
                            ? { color: '#34D399', background: 'rgba(52,211,153,0.12)' }
                            : { color: '#F87171', background: 'rgba(248,113,113,0.12)' }
                          }
                        >
                          {h.type === 'in' ? '+' : ''}{h.points.toLocaleString('id-ID')}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* REWARD CATALOG */}
            {tab === 'reward' && (
              <motion.div key="reward"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {REWARDS.map((r, i) => {
                  const canRedeem = (customer.points || 0) >= r.points && r.available
                  const short = (customer.points || 0) < r.points ? r.points - (customer.points || 0) : 0
                  const pct = Math.min(100, ((customer.points || 0) / r.points) * 100)
                  return (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={r.available ? { y: -4, scale: 1.01 } : {}}
                      className="relative rounded-2xl overflow-hidden border transition-all"
                      style={{
                        background: r.available ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                        borderColor: r.available
                          ? canRedeem ? `${r.color}35` : 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.05)',
                        opacity: r.available ? 1 : 0.5,
                      }}
                    >
                      {/* Top accent line */}
                      <div className="h-0.5" style={{ background: r.available ? r.color : 'rgba(255,255,255,0.08)' }} />

                      {/* "Can Redeem" glow badge */}
                      {canRedeem && (
                        <div
                          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}35` }}
                        >
                          ✓ Bisa Ditukar
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: `${r.color}15`, border: `1px solid ${r.color}25` }}
                          >
                            {r.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-tight">{r.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `${r.color}12`, color: r.color }}
                              >
                                {r.category}
                              </span>
                              {!r.available && <span className="text-xs text-red-400">Stok habis</span>}
                            </div>
                          </div>
                        </div>

                        {/* Point cost */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <MdStar className="text-yellow-400 text-base" />
                            <span className="text-white font-black text-base">{r.points.toLocaleString('id-ID')}</span>
                            <span className="text-gray-500 text-xs">poin</span>
                          </div>
                          <motion.button
                            onClick={() => canRedeem && handleRedeem(r)}
                            disabled={!canRedeem}
                            whileHover={canRedeem ? { scale: 1.05 } : {}}
                            whileTap={canRedeem ? { scale: 0.95 } : {}}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                            style={canRedeem
                              ? { background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}35` }
                              : { background: 'rgba(255,255,255,0.04)', color: '#4B5563', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.06)' }
                            }
                          >
                            {!r.available
                              ? <><MdLock size={12} /> Habis</>
                              : canRedeem
                                ? <><MdAutorenew size={12} /> Tukar Sekarang</>
                                : <>Kurang {short.toLocaleString('id-ID')}</>
                            }
                          </motion.button>
                        </div>

                        {/* Progress bar untuk yang belum bisa redeem */}
                        {!canRedeem && r.available && (
                          <div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${r.color}88, ${r.color})` }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: i * 0.05 + 0.3 }}
                              />
                            </div>
                            <p className="text-gray-600 text-xs mt-1">{Math.round(pct)}% terkumpul</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* SEMUA TIER */}
            {tab === 'tier' && (
              <motion.div key="tier"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {TIER_ORDER.map((tierName, i) => {
                  const cfg = TIER_CONFIG[tierName]
                  const meta = TIER_META[tierName]
                  const isActive = loyalty.tier === tierName
                  const tierIdx = TIER_ORDER.indexOf(tierName)
                  const userIdx = TIER_ORDER.indexOf(loyalty.tier)
                  const isPassed = tierIdx < userIdx
                  const isLocked = tierIdx > userIdx

                  return (
                    <motion.div key={tierName}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: isActive ? 1 : 1.01 }}
                      className="relative rounded-2xl overflow-hidden border transition-all"
                      style={{
                        background: isActive ? meta.gradient : isPassed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                        borderColor: isActive ? cfg.color + '55' : isPassed ? cfg.color + '25' : 'rgba(255,255,255,0.06)',
                        boxShadow: isActive ? `0 8px 40px ${meta.glow}` : 'none',
                        opacity: isLocked ? 0.6 : 1,
                      }}
                    >
                      {/* Active indicator strip */}
                      {isActive && (
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}55)` }} />
                      )}

                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: isActive ? `${cfg.color}25` : `${cfg.color}12`, border: `1px solid ${cfg.color}30` }}
                          >
                            {cfg.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-black text-base">{tierName}</p>
                              {isActive && (
                                <motion.span
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300 }}
                                  className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                                >
                                  ✓ Tier Anda
                                </motion.span>
                              )}
                              {isPassed && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-gray-400" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                  ✓ Tercapai
                                </span>
                              )}
                              {isLocked && (
                                <span className="text-xs px-2 py-0.5 rounded-full text-gray-600 flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <MdLock size={10} /> Terkunci
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {cfg.max === Infinity
                                ? `${cfg.min.toLocaleString('id-ID')}+ poin`
                                : `${cfg.min.toLocaleString('id-ID')} – ${cfg.max.toLocaleString('id-ID')} poin`
                              }
                            </p>
                          </div>
                          <Stars count={4} filled={i + 1} color={cfg.color} size={13} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(TIER_BENEFITS[tierName] || []).map((b, bi) => (
                            <div key={b}
                              className="flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5"
                              style={{
                                color: isActive || isPassed ? '#D1FAE5' : '#6B7280',
                                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                              }}
                            >
                              <MdCheckCircle
                                className="flex-shrink-0"
                                size={13}
                                style={{ color: isActive || isPassed ? cfg.color : '#374151' }}
                              />
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  )
}