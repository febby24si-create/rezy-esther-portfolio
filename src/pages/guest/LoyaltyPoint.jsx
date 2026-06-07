import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdStar, MdArrowUpward, MdArrowDownward, MdCheckCircle } from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import {
  AnimatedPage, ScrollReveal, StaggerReveal, StaggerItem,
  AnimatedProgress, HoverCard, PressButton, fadeUp
} from '../../components/AnimatedPage'

const REWARDS = [
  { id: 'R01', name: 'Diskon 10% Service',    points: 500,  category: 'Voucher',     diskonPct: 10,  icon: '🏷️', available: true  },
  { id: 'R02', name: 'Ganti Oli Gratis',       points: 1000, category: 'Service',     diskonPct: 100, icon: '🛢️', available: true  },
  { id: 'R03', name: 'Service Berkala Gratis', points: 2500, category: 'Service',     diskonPct: 100, icon: '🔧', available: true  },
  { id: 'R04', name: 'Voucher Rp 100.000',     points: 800,  category: 'Voucher',     diskonPct: 15,  icon: '💳', available: true  },
  { id: 'R05', name: 'Tune Up Gratis',         points: 2000, category: 'Service',     diskonPct: 100, icon: '⚙️', available: true  },
  { id: 'R06', name: 'Cuci Mobil Gratis',      points: 300,  category: 'Service',     diskonPct: 100, icon: '🚿', available: true  },
  { id: 'R07', name: 'Merchandise Esther',     points: 1500, category: 'Merchandise', diskonPct: 0,   icon: '👕', available: false },
]

const TIER_BENEFITS = {
  Bronze:   ['Promo umum bengkel', 'Voucher dasar after-service', 'Booking online'],
  Silver:   ['Semua benefit Bronze', 'Diskon 5% setiap servis', 'Voucher berkala bulanan', 'Promo member eksklusif'],
  Gold:     ['Semua benefit Silver', 'Diskon 10% setiap servis', 'Voucher premium', 'Prioritas booking', 'Early access promo'],
  Platinum: ['Semua benefit Gold', 'Diskon 15% setiap servis', 'Voucher eksklusif', 'Prioritas booking tertinggi', 'Reward loyal customer', 'Antar-jemput kendaraan'],
}

const TIER_META = {
  Bronze:   { gradient: 'from-orange-900/80 to-orange-950', glow: 'rgba(249,115,22,0.3)',  shine: '#F97316' },
  Silver:   { gradient: 'from-slate-700/80  to-slate-900',  glow: 'rgba(148,163,184,0.3)', shine: '#94A3B8' },
  Gold:     { gradient: 'from-yellow-900/80 to-amber-950',  glow: 'rgba(251,191,36,0.35)', shine: '#FBBF24' },
  Platinum: { gradient: 'from-purple-900/80 to-indigo-950', glow: 'rgba(168,85,247,0.35)', shine: '#A855F7' },
}

export default function LoyaltyPoint() {
  const [tab, setTab]             = useState('riwayat')
  const [redeemMsg, setRedeemMsg] = useState(null)
  const { customer, redeemReward } = useCustomerAuth()
  if (!customer) return null

  const loyalty  = calcLoyaltyProgress(customer.points || 0)
  const tierCfg  = TIER_CONFIG[loyalty.tier]
  const tierMeta = TIER_META[loyalty.tier]
  const history  = customer.pointHistory || []
  const totalIn  = history.filter(h => h.type === 'in').reduce((a, b) => a + b.points, 0)
  const totalOut = Math.abs(history.filter(h => h.type === 'out').reduce((a, b) => a + b.points, 0))

  const handleRedeem = (reward) => {
    const result = redeemReward(reward)
    setRedeemMsg({ ok: result.success, text: result.success ? '✓ Berhasil! Cek Voucher Saya.' : result.message })
    setTimeout(() => setRedeemMsg(null), 3500)
  }

  const TABS = [['riwayat','Riwayat Poin'],['reward','Reward Catalog'],['tier','Semua Tier']]

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5 }} className="mb-8">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">Program Loyalitas</p>
            <h1 className="text-2xl font-extrabold text-white">Loyalty Point Anda</h1>
          </motion.div>

          {/* Redeem feedback */}
          <AnimatePresence>
            {redeemMsg && (
              <motion.div
                initial={{ opacity:0, y:-12, scale:0.95 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-12, scale:0.95 }}
                className={`mb-5 p-4 rounded-xl text-sm font-medium ${redeemMsg.ok ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                {redeemMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Hero Tier Card ──────────────────────────────── */}
          <ScrollReveal variant={fadeUp} className="mb-6">
            <div className={`relative rounded-2xl p-7 overflow-hidden bg-gradient-to-br ${tierMeta.gradient}`}
              style={{ boxShadow: `0 8px 40px ${tierMeta.glow}` }}>
              {/* Shine lines */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
                  style={{ background: `radial-gradient(circle, ${tierMeta.shine}22 0%, transparent 65%)` }} />
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
                      {customer.name} · {loyalty.tier} Member
                    </p>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={customer.points}
                        initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                        className="text-5xl font-black text-white"
                      >
                        {(customer.points||0).toLocaleString('id-ID')}
                      </motion.span>
                      <span className="text-white/40 text-lg">poin</span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">
                      ≈ Rp {((customer.points||0) * 100).toLocaleString('id-ID')} nilai tukar
                    </p>
                  </div>
                  <div className="text-right">
                    <motion.div
                      animate={{ rotate: [0,8,-8,0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-5xl mb-1"
                    >
                      {tierCfg.icon}
                    </motion.div>
                    <span className="text-white font-bold text-sm">{loyalty.tier}</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-white/50 text-xs mb-2">
                    <span>{loyalty.tier}</span>
                    {loyalty.nextTier
                      ? <span>{loyalty.pointsToNext.toLocaleString('id-ID')} poin menuju {loyalty.nextTier}</span>
                      : <span>🎉 Tier Tertinggi!</span>}
                  </div>
                  <AnimatedProgress value={loyalty.progress} color="rgba(255,255,255,0.9)"
                    height={12} bg="rgba(255,255,255,0.15)" delay={0.4} />
                  <p className="text-white/40 text-xs mt-1.5">
                    {loyalty.nextTier ? `${loyalty.progress}% menuju ${loyalty.nextTier}` : 'Platinum — Puncak Loyalitas!'}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Quick stats */}
          <StaggerReveal className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Poin Masuk',      value: totalIn.toLocaleString('id-ID'),                        color: '#4ADE80', prefix: '↑ ' },
              { label: 'Poin Digunakan',  value: totalOut.toLocaleString('id-ID'),                       color: '#F87171', prefix: '↓ ' },
              { label: 'Reward Tersedia', value: REWARDS.filter(r => r.available).length, color: '#FCD34D', prefix: '🎁 ' },
            ].map(({ label, value, color, prefix }) => (
              <StaggerItem key={label}>
                <div className="rounded-xl p-4 text-center border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xl font-extrabold" style={{ color }}>{prefix}{value}</div>
                  <div className="text-gray-500 text-xs mt-1">{label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          {/* Tier benefits */}
          <ScrollReveal className="mb-6">
            <div className="rounded-2xl border p-5"
              style={{ background: tierCfg.bg, borderColor: tierCfg.border }}>
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                {tierCfg.icon} Benefit {loyalty.tier} Member Anda
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(TIER_BENEFITS[loyalty.tier]||[]).map((b,i) => (
                  <motion.div key={b}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-xs text-gray-300">
                    <MdCheckCircle className="flex-shrink-0" style={{ color: tierCfg.color }} />
                    {b}
                  </motion.div>
                ))}
              </div>
              {loyalty.nextTier && (
                <p className="text-xs text-gray-500 mt-3 border-t border-white/5 pt-3">
                  Naik ke {loyalty.nextTier} untuk membuka lebih banyak benefit.
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Tabs */}
          <div className="flex border border-white/8 rounded-xl p-1 mb-6">
            {TABS.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === key ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                }`}>{label}</button>
            ))}
          </div>

          {/* ── Riwayat ───────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {tab === 'riwayat' && (
              <motion.div key="riwayat"
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:0.3 }}
                className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Belum ada riwayat poin.</div>
                ) : history.map((h, i) => (
                  <motion.div key={h.id}
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${h.type === 'in' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {h.type === 'in'
                        ? <MdArrowUpward className="text-green-400 text-lg" />
                        : <MdArrowDownward className="text-red-400 text-lg" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{h.desc}</p>
                      <p className="text-gray-500 text-xs">{new Date(h.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
                    </div>
                    <span className={`text-sm font-bold ${h.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                      {h.type === 'in' ? '+' : ''}{h.points.toLocaleString('id-ID')}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Reward Catalog ─────────────────────────────── */}
            {tab === 'reward' && (
              <motion.div key="reward"
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REWARDS.map((r, i) => {
                  const canRedeem = (customer.points||0) >= r.points && r.available
                  const short = (customer.points||0) < r.points ? r.points - (customer.points||0) : 0
                  const pct = Math.min(100, ((customer.points||0) / r.points) * 100)
                  return (
                    <motion.div key={r.id}
                      initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={r.available ? { y: -4 } : {}}
                      className={`p-5 rounded-2xl border transition-colors ${r.available ? 'border-white/10 hover:border-green-500/25' : 'border-white/5 opacity-50'}`}
                      style={{ background: 'rgba(34,197,94,0.04)' }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                          {r.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{r.name}</p>
                          <p className="text-gray-500 text-xs">{r.category}</p>
                          {!r.available && <p className="text-xs text-red-400 mt-1">Stok habis</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                          <MdStar className="text-base" /> {r.points.toLocaleString('id-ID')} poin
                        </div>
                        <motion.button
                          onClick={() => canRedeem && handleRedeem(r)}
                          disabled={!canRedeem}
                          whileHover={canRedeem ? { scale: 1.05 } : {}}
                          whileTap={canRedeem ? { scale: 0.95 } : {}}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            canRedeem
                              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                              : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                          }`}>
                          {!r.available ? 'Habis' : canRedeem ? 'Tukar Sekarang' : `Kurang ${short.toLocaleString('id-ID')}`}
                        </motion.button>
                      </div>
                      {!canRedeem && r.available && (
                        <AnimatedProgress value={pct} color={tierCfg.color} height={4} bg="rgba(255,255,255,0.06)" delay={0.2} />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* ── Semua Tier ─────────────────────────────────── */}
            {tab === 'tier' && (
              <motion.div key="tier"
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:0.3 }}
                className="space-y-4">
                {Object.entries(TIER_CONFIG).map(([tierName, cfg], i) => {
                  const isActive = loyalty.tier === tierName
                  const meta = TIER_META[tierName]
                  return (
                    <motion.div key={tierName}
                      initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ x: isActive ? 0 : 4 }}
                      className={`rounded-2xl border p-5 transition-all ${!isActive && 'opacity-60'}`}
                      style={{
                        background: isActive ? `bg-gradient-to-br ${meta.gradient}` : 'rgba(255,255,255,0.02)',
                        borderColor: isActive ? cfg.border : 'rgba(255,255,255,0.08)',
                        boxShadow: isActive ? `0 4px 24px ${meta.glow}` : 'none',
                        backgroundColor: isActive ? cfg.bg : undefined,
                      }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-bold">{tierName}</p>
                            {isActive && (
                              <motion.span initial={{ scale:0 }} animate={{ scale:1 }}
                                transition={{ type:'spring', stiffness:300 }}
                                className="text-xs px-2 py-0.5 rounded-full font-bold"
                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                Tier Anda
                              </motion.span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {cfg.max === Infinity ? `${cfg.min.toLocaleString('id-ID')}+ poin` : `${cfg.min.toLocaleString('id-ID')} – ${cfg.max.toLocaleString('id-ID')} poin`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {(TIER_BENEFITS[tierName]||[]).map(b => (
                          <div key={b} className="flex items-center gap-2 text-xs text-gray-400">
                            <MdCheckCircle className="flex-shrink-0 text-xs" style={{ color: cfg.color }} /> {b}
                          </div>
                        ))}
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