// ============================================================
// LoyaltyAdmin.jsx — /loyalty
// Halaman manajemen loyalty komprehensif untuk admin
// Tab: Analytics | Tier Management | Recommendations
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPeople, MdStars, MdCardMembership, MdBarChart,
  MdSearch, MdCheck, MdEdit, MdSave, MdClose,
  MdEmojiEvents, MdTrendingUp, MdCardGiftcard,
  MdPerson, MdRefresh,
  MdSettings,
} from 'react-icons/md'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  getAllCustomers,
  calcTier,
  calcLoyaltyProgress,
  TIER_CONFIG,
  TIER_BENEFITS,
  TIER_DISCOUNT,
  TIER_BONUS_POINTS,
  TIER_ORDER_DESC,
} from '../lib/loyaltyConstants'

const TIER_COLORS = {
  Bronze:      '#F97316',
  Silver:      '#94A3B8',
  Gold:        '#FBBF24',
  Platinum:    '#A855F7',
  'VIP Mahkota': '#EC4899',
}

// ─── Stats Card ────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : <icon size={20} style={{ color }} />}
        </div>
      </div>
      <p className="text-white font-extrabold text-2xl">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </motion.div>
  )
}

// ─── Section Card ──────────────────────────────────────────
function SectionCard({ title, icon, action, children }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Insight Card ──────────────────────────────────────────
function InsightCard({ icon, color, title, message, severity = 'info' }) {
  const severityStyles = {
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22C55E' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#F59E0B' },
    info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#3B82F6' },
    danger:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
  }
  const style = severityStyles[severity] || severityStyles.info
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl p-4 border"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-semibold">{title}</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
              {severity.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tier Config Editor ────────────────────────────────────
function TierConfigEditor({ onSave, onClose }) {
  const [configs, setConfigs] = useState(() => {
    const tiers = {}
    TIER_ORDER_DESC.forEach((tier) => {
      const cfg = TIER_CONFIG[tier]
      tiers[tier] = {
        min: cfg.min,
        discount: TIER_DISCOUNT[tier] || 0,
        bonusPoints: TIER_BONUS_POINTS[tier] || 0,
      }
    })
    return tiers
  })

  const handleSave = () => {
    onSave(configs)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{ background: '#061a14', borderColor: 'rgba(34,197,94,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-green-500/10 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">⚙️ Kelola Konfigurasi Tier</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
        </div>
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {TIER_ORDER_DESC.map((tier) => {
            const cfg = TIER_CONFIG[tier]
            const t = configs[tier]
            return (
              <div key={tier} className="rounded-xl p-4 border"
                style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}20` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cfg.icon}</span>
                  <p className="text-white font-bold text-sm">{tier}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 text-[10px] mb-1 block">Minimal Poin</label>
                    <input type="number" value={t.min} onChange={(e) => setConfigs((prev) => ({
                      ...prev, [tier]: { ...prev[tier], min: Number(e.target.value) }
                    }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] mb-1 block">Diskon Servis (%)</label>
                    <input type="number" min="0" max="100" value={t.discount}
                      onChange={(e) => setConfigs((prev) => ({
                        ...prev, [tier]: { ...prev[tier], discount: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] mb-1 block">Bonus Poin</label>
                    <input type="number" min="0" value={t.bonusPoints}
                      onChange={(e) => setConfigs((prev) => ({
                        ...prev, [tier]: { ...prev[tier], bonusPoints: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-5 border-t border-green-500/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-white/10 transition-all">
            Batal
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all">
            <MdSave size={14} /> Simpan Konfigurasi
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── MAIN ──────────────────────────────────────────────────
export default function LoyaltyAdmin() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('analytics')
  const [showConfig, setShowConfig] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { customerAPI } = await import('../services/customerAPI')
        const data = await customerAPI.fetchAll()
        setCustomers(data || [])
      } catch (err) {
        console.error('Loyalty: Gagal load customers:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showMsg = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = customers.filter((c) => (c.membership_status || c.membershipStatus) !== 'inactive')
    const byTier = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0, 'VIP Mahkota': 0 }
    active.forEach((c) => {
      const tier = calcTier(c.points || 0)
      byTier[tier] = (byTier[tier] || 0) + 1
    })
    const totalPts = active.reduce((s, c) => s + (c.points || 0), 0)
    const topPoints = [...active].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5)
    const topVouchers = [...active].sort((a, b) => ((b.voucherCount || b.vouchers?.length || 0)) - ((a.voucherCount || a.vouchers?.length || 0))).slice(0, 5)
    return { active, byTier, totalPts, topPoints, topVouchers }
  }, [customers])

  const tierPieData = Object.entries(stats.byTier)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: TIER_COLORS[name] || '#6B7280' }))

  // ── Near-tier-up customers ───────────────────────────────
  const nearTierUp = useMemo(() => {
    return customers
      .filter((c) => {
        const loyalty = calcLoyaltyProgress(c.points || 0)
        return loyalty.nextTier && loyalty.progress >= 80
      })
      .sort((a, b) => {
        const la = calcLoyaltyProgress(a.points || 0)
        const lb = calcLoyaltyProgress(b.points || 0)
        return lb.progress - la.progress
      })
      .slice(0, 10)
  }, [customers])

  // ── Newly tiered up customers ────────────────────────────
  const newlyTieredUp = useMemo(() => {
    return customers
      .filter((c) => {
        const loyalty = calcLoyaltyProgress(c.points || 0)
        // Customers who just passed their tier minimum
        const tier = calcTier(c.points || 0)
        const cfg = TIER_CONFIG[tier]
        const margin = (c.points || 0) - cfg.min
        return tier !== 'Bronze' && margin < 100 && margin >= 0
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
  }, [customers])

  // ── Inactive at-risk customers ───────────────────────────
  const atRiskCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const daysSince = c.lastOrderDate
          ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
          : 9999
        return daysSince > 60 && daysSince <= 180 && calcTier(c.points || 0) !== 'Bronze'
      })
      .sort((a, b) => {
        const da = a.lastOrderDate ? Math.floor((new Date() - new Date(a.lastOrderDate)) / 86400000) : 0
        const db = b.lastOrderDate ? Math.floor((new Date() - new Date(b.lastOrderDate)) / 86400000) : 0
        return db - da
      })
      .slice(0, 10)
  }, [customers])

  // ── Reward Recommendations ───────────────────────────────
  const recommendations = useMemo(() => {
    const recs = []

    // Near tier-up count
    const nearSilver = customers.filter((c) => {
      const p = c.points || 0
      return p >= 400 && p < 500
    }).length
    if (nearSilver > 0) recs.push({
      icon: '🥈',
      title: `${nearSilver} customer hampir naik ke Silver`,
      message: `${nearSilver} customer hanya butuh < 100 poin lagi untuk naik ke Silver. Dorong dengan servis ringan.`,
      severity: 'success',
    })

    const nearGold = customers.filter((c) => {
      const p = c.points || 0
      return p >= 1400 && p < 1500
    }).length
    if (nearGold > 0) recs.push({
      icon: '🥇',
      title: `${nearGold} customer hampir naik ke Gold`,
      message: `${nearGold} customer hanya butuh < 100 poin lagi untuk naik ke Gold. Tawarkan servise bernilai tambah.`,
      severity: 'success',
    })

    const nearPlatinum = customers.filter((c) => {
      const p = c.points || 0
      return p >= 2900 && p < 3000
    }).length
    if (nearPlatinum > 0) recs.push({
      icon: '💎',
      title: `${nearPlatinum} customer hampir naik ke Platinum`,
      message: `${nearPlatinum} customer hanya butuh < 100 poin untuk mencapai Platinum! Beri penawaran spesial.`,
      severity: 'info',
    })

    const nearVIP = customers.filter((c) => {
      const p = c.points || 0
      return p >= 4900 && p < 5000
    }).length
    if (nearVIP > 0) recs.push({
      icon: '👑',
      title: `${nearVIP} customer hampir naik ke VIP Mahkota!`,
      message: `${nearVIP} customer hanya butuh < 100 poin untuk mencapai tier tertinggi! Beri layanan VIP treatment.`,
      severity: 'info',
    })

    // Most populated tier
    const tierCounts = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0, 'VIP Mahkota': 0 }
    customers.forEach((c) => {
      const tier = calcTier(c.points || 0)
      tierCounts[tier] = (tierCounts[tier] || 0) + 1
    })
    const maxTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]
    if (maxTier && maxTier[1] > 0) {
      recs.push({
        icon: '📊',
        title: `${maxTier[0]} adalah tier dengan customer terbanyak`,
        message: `Tier ${maxTier[0]} memiliki ${maxTier[1]} customer (${Math.round((maxTier[1] / customers.length) * 100)}% dari total). Fokuskan campaign untuk mempertahankan mereka.`,
        severity: 'info',
      })
    }

    // VIP at risk
    const vipAtRisk = customers.filter((c) => {
      const tier = calcTier(c.points || 0)
      const daysSince = c.lastOrderDate
        ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
        : 9999
      return tier === 'VIP Mahkota' && daysSince > 60
    }).length
    if (vipAtRisk > 0) recs.push({
      icon: '👑',
      title: `${vipAtRisk} VIP Mahkota tidak aktif > 60 hari`,
      message: `${vipAtRisk} customer VIP belum servis selama lebih dari 60 hari. Kirim reminder eksklusif untuk retain tier tertinggi.`,
      severity: 'warning',
    })

    // Inactive Bronze - churn risk
    const churnRisk = customers.filter((c) => {
      const daysSince = c.lastOrderDate
        ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
        : 9999
      return daysSince > 180 && (c.points || 0) < 500
    }).length
    if (churnRisk > 0) recs.push({
      icon: '🚨',
      title: `${churnRisk} customer berpotensi churn`,
      message: `${churnRisk} customer tidak aktif > 180 hari dengan poin rendah. Kirim campaign re-engagement dengan diskon besar.`,
      severity: 'danger',
    })

    return recs
  }, [customers])

  const handleSaveConfig = (configs) => {
    // Simpan ke sessionStorage untuk sementara (karena tidak ada DB untuk config)
    sessionStorage.setItem('eg_tier_config', JSON.stringify(configs))
    showMsg('✅ Konfigurasi tier berhasil disimpan!')
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-64 rounded-lg bg-white/5" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
        </div>
      </div>
    )
  }

  const TABS = [
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'management', label: '⚙️ Benefit Management' },
    { key: 'recommendations', label: '🎯 Rekomendasi' },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020f09' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white font-medium text-sm flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 8px 32px rgba(34,197,94,0.3)' }}>
            <MdCheck size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfig && <TierConfigEditor onSave={handleSaveConfig} onClose={() => setShowConfig(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)' }}>
              <MdStars size={20} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl">Loyalty Management</h1>
              <p className="text-gray-500 text-xs">{stats.active.length} member aktif · {customers.length} total customer</p>
            </div>
          </div>
          <button onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all">
            <MdSettings size={14} /> Kelola Tier
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
            style={tab === t.key
              ? { background: 'rgba(236,72,153,0.15)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.25)' }
              : { color: '#6B7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: ANALYTICS ── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* 5 Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TIER_ORDER_DESC.map((tier, i) => {
              const cfg = TIER_CONFIG[tier]
              const count = stats.byTier[tier] || 0
              return (
                <StatCard key={tier}
                  icon={cfg.icon}
                  label={`Member ${tier}`}
                  value={count}
                  sub={customers.length > 0 ? `${Math.round((count / customers.length) * 100)}%` : '0%'}
                  color={cfg.color}
                  delay={i * 0.06}
                />
              )
            })}
          </div>

          {/* Pie Chart + Bar Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SectionCard icon="📊" title="Distribusi Tier Member">
              {tierPieData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Belum ada data member.</p>
              ) : (
                <div className="flex flex-col items-center">
                  <PieChart width={200} height={200}>
                    <Pie data={tierPieData} cx={100} cy={100}
                      innerRadius={60} outerRadius={85}
                      paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {tierPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 6px ${entry.color}30)` }} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {tierPieData.map((t) => (
                      <div key={t.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                        <span className="text-gray-400">{t.name}</span>
                        <span className="text-white font-bold">{t.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard icon="📈" title="Top 5 Member Poin Tertinggi">
              <div className="space-y-2">
                {stats.topPoints.map((c, i) => {
                  const tier = calcTier(c.points || 0)
                  const cfg = TIER_CONFIG[tier]
                  const maxPts = stats.topPoints[0]?.points || 1
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                        i === 0 ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-gray-500'
                      }`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                          <span className="text-[9px]" style={{ color: cfg.color }}>{cfg.icon}</span>
                        </div>
                        <div className="h-1 rounded-full mt-1 overflow-hidden bg-white/5">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${((c.points || 0) / maxPts) * 100}%`, background: cfg.color }} />
                        </div>
                      </div>
                      <p className="text-white font-bold text-xs flex-shrink-0">{(c.points || 0).toLocaleString('id-ID')}</p>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          </div>

          {/* Near Tier-Up + Newly Tiered */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SectionCard icon="🚀" title="Customer Hampir Naik Tier (≥80%)">
              {nearTierUp.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Tidak ada customer yang hampir naik tier.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {nearTierUp.map((c) => {
                    const loyalty = calcLoyaltyProgress(c.points || 0)
                    const cfg = TIER_CONFIG[loyalty.tier]
                    const nextCfg = TIER_CONFIG[loyalty.nextTier]
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-lg">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px]" style={{ color: cfg.color }}>{loyalty.tier}</span>
                            <span className="text-gray-600 text-[9px]">→</span>
                            <span className="text-[9px]" style={{ color: nextCfg.color }}>{loyalty.nextTier}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-bold text-xs">{loyalty.progress}%</p>
                          <p className="text-gray-500 text-[9px]">{loyalty.pointsToNext} poin lagi</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard icon="🎉" title="Customer Baru Naik Tier">
              {newlyTieredUp.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Belum ada customer yang baru naik tier.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newlyTieredUp.map((c) => {
                    const tier = calcTier(c.points || 0)
                    const cfg = TIER_CONFIG[tier]
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-lg">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                          <p className="text-gray-500 text-[9px]">{tier} · {(c.points || 0).toLocaleString('id-ID')} poin</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.icon} Baru!
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* At Risk Customers + Voucher */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SectionCard icon="⚠️" title="Customer Berpotensi Turun Loyalitas (Inactive >60 hari)">
              {atRiskCustomers.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Tidak ada customer berisiko.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {atRiskCustomers.map((c) => {
                    const tier = calcTier(c.points || 0)
                    const cfg = TIER_CONFIG[tier]
                    const days = c.lastOrderDate
                      ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
                      : 9999
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-lg">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                          <p className="text-gray-500 text-[9px]">{days} hari tidak servis · {tier}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          days > 120 ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                          {days > 120 ? 'Kritis' : 'Warning'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard icon="🎟️" title="Top 5 Customer Voucher Terbanyak">
              <div className="space-y-2">
                {stats.topVouchers.map((c, i) => {
                  const tier = calcTier(c.points || 0)
                  const cfg = TIER_CONFIG[tier]
                  const vCount = c.voucherCount || c.vouchers?.length || 0
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0 bg-white/10 text-gray-500">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                        <span className="text-[9px]" style={{ color: cfg.color }}>{cfg.icon} {tier}</span>
                      </div>
                      <p className="text-purple-400 font-bold text-xs">{vCount} voucher</p>
                    </div>
                  )
                })}
                {stats.topVouchers.length === 0 && (
                  <p className="text-gray-500 text-sm italic">Belum ada data voucher.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── TAB: BENEFIT MANAGEMENT ── */}
      {tab === 'management' && (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">Kelola benefit, diskon, dan bonus poin untuk setiap tier.</p>

          <div className="grid gap-4">
            {TIER_ORDER_DESC.map((tier) => {
              const cfg = TIER_CONFIG[tier]
              const benefits = TIER_BENEFITS[tier] || []
              const discount = TIER_DISCOUNT[tier] || 0
              const bonusPts = TIER_BONUS_POINTS[tier] || 0
              return (
                <motion.div key={tier} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 border"
                  style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}20` }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{tier}</h3>
                        <p className="text-gray-500 text-xs">{cfg.min.toLocaleString('id-ID')} poin minimum</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <div className="text-center px-4 py-2 rounded-xl" style={{ background: `${cfg.color}12` }}>
                        <p className="text-white font-bold text-lg">{discount}%</p>
                        <p className="text-gray-400 text-[10px]">Diskon</p>
                      </div>
                      <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.12)' }}>
                        <p className="text-yellow-400 font-bold text-lg">{bonusPts.toLocaleString('id-ID')}</p>
                        <p className="text-gray-400 text-[10px]">Bonus Poin</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-black/20 rounded-lg px-3 py-2">
                        <MdCheck size={12} style={{ color: cfg.color }} />
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t" style={{ borderColor: `${cfg.color}15` }}>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>🔹 Booking Priority: {['VIP Mahkota', 'Platinum', 'Gold'].includes(tier) ? '✅ Ya' : '❌ Tidak'}</span>
                      <span>🔹 Antar-Jemput: {['VIP Mahkota', 'Platinum'].includes(tier) ? '✅ Ya' : '❌ Tidak'}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB: RECOMMENDATIONS ── */}
      {tab === 'recommendations' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Rekomendasi otomatis berdasarkan data loyalty customer.</p>
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">🎯</span>
              <p className="text-gray-500 text-sm mt-2">Belum ada rekomendasi yang tersedia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <InsightCard key={i} {...rec} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
