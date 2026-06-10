import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  MdDirectionsCar, MdBuild, MdCardGiftcard, MdStars, MdNotifications,
  MdArrowForward, MdGpsFixed, MdCheckCircle, MdEmojiEvents, MdLogout,
} from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import {
  AnimatedPage, ScrollReveal, StaggerReveal, StaggerItem,
  AnimatedProgress, HoverCard, PressButton, GlowDot, fadeUp, scaleIn
} from '../../components/AnimatedPage'
import { getCustomerAvatar } from '../../utils/randomAvatar'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function buildNotifications(customer) {
  const notifs = []
  const today = new Date()
  if (customer.vehicles) {
    customer.vehicles.forEach(v => {
      const days = Math.ceil((new Date(v.nextService) - today) / 86400000)
      if (days <= 60 && days > 0) {
        notifs.push({
          id: 'N-SVC-' + v.id, type: 'reminder', icon: '🔔',
          title: `Reminder Service — ${v.brand} ${v.model}`,
          desc: `Service berikutnya ${days} hari lagi.`,
          action: 'Booking', actionPath: '/guest/booking',
          priority: days <= 14 ? 'high' : 'medium',
          color: 'rgba(249,115,22,0.10)', textColor: '#FB923C',
        })
      }
    })
  }
  if (customer.birthDate) {
    const birth = new Date(customer.birthDate)
    const bday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    const diff = Math.ceil((bday - today) / 86400000)
    if (diff >= 0 && diff <= 30) {
      notifs.push({
        id: 'N-BDAY', type: 'promo', icon: '🎂',
        title: diff === 0 ? 'Selamat Ulang Tahun! 🎉' : `Ulang Tahun ${diff} Hari Lagi`,
        desc: 'Voucher spesial menunggumu!',
        action: 'Klaim', actionPath: '/guest/voucher',
        priority: 'high', color: 'rgba(168,85,247,0.10)', textColor: '#C084FC',
      })
    }
  }
  const lastPoint = (customer.pointHistory || [])[0]
  if (lastPoint?.type === 'in') {
    notifs.push({
      id: 'N-PTS', type: 'point', icon: '⭐',
      title: `+${lastPoint.points} Poin Masuk`,
      desc: lastPoint.desc,
      action: 'Lihat', actionPath: '/guest/loyalty',
      priority: 'medium', color: 'rgba(251,191,36,0.10)', textColor: '#FCD34D',
    })
  }
  const activeVc = (customer.vouchers || []).filter(v => v.status === 'active')
  if (activeVc.length > 0) {
    notifs.push({
      id: 'N-VCH', type: 'promo', icon: '🎁',
      title: `${activeVc.length} Voucher Aktif`,
      desc: 'Gunakan sebelum kadaluarsa.',
      action: 'Pakai', actionPath: '/guest/voucher',
      priority: 'low', color: 'rgba(96,165,250,0.10)', textColor: '#60A5FA',
    })
  }
  notifs.push({
    id: 'N-REV', type: 'followup', icon: '💬',
    title: 'Beri Review, Dapat +50 Poin',
    desc: 'Rating servis terakhir Anda.',
    action: 'Review', actionPath: '/guest/riwayat',
    priority: 'low', color: 'rgba(34,197,94,0.08)', textColor: '#4ADE80',
  })
  return notifs.slice(0, 5)
}

const TIER_GRADIENT = {
  Bronze:   'linear-gradient(135deg, #431407 0%, #7C2D12 50%, #431407 100%)',
  Silver:   'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
  Gold:     'linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)',
  Platinum: 'linear-gradient(135deg, #2E1065 0%, #3B0764 50%, #2E1065 100%)',
}
const TIER_GLOW = {
  Bronze: 'rgba(249,115,22,0.28)',  Silver: 'rgba(148,163,184,0.25)',
  Gold:   'rgba(251,191,36,0.32)',  Platinum: 'rgba(168,85,247,0.32)',
}

export default function DashboardCustomer() {
  const { customer, logout } = useCustomerAuth()
  if (!customer) return null

  const loyalty        = calcLoyaltyProgress(customer.points || 0)
  const tierCfg        = TIER_CONFIG[loyalty.tier]
  const activeVouchers = (customer.vouchers || []).filter(v => v.status === 'active').length
  const orders         = JSON.parse(localStorage.getItem('garage_orders') || '[]')
  const myOrders       = orders.filter(o => o.customer === customer.name)
  const notifications  = buildNotifications(customer)
  const highPriority   = notifications.filter(n => n.priority === 'high').length

  const achievements = [
    { id: 'first_service',   label: 'First Service', icon: '🔧', check: customer.totalOrders >= 1 },
    { id: 'loyal_5',         label: 'Loyal 5x',      icon: '⭐', check: customer.totalOrders >= 5 },
    { id: 'loyal_10',        label: 'Elite 10x',     icon: '👑', check: customer.totalOrders >= 10 },
    { id: 'silver_member',   label: 'Silver',        icon: '🥈', check: ['Silver','Gold','Platinum'].includes(loyalty.tier) },
    { id: 'gold_member',     label: 'Gold',          icon: '🥇', check: ['Gold','Platinum'].includes(loyalty.tier) },
    { id: 'platinum_member', label: 'Platinum',      icon: '💎', check: loyalty.tier === 'Platinum' },
    { id: 'big_spender',     label: 'Big Spender',   icon: '💰', check: (customer.totalSpent || 0) >= 2000000 },
    { id: 'top_reviewer',    label: 'Top Reviewer',  icon: '📝', check: (customer.reviewCount || 0) >= 3 },
  ]
  const unlockedCount = achievements.filter(a => a.check).length

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>

        {/* ── Hero Header ─────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(180deg, #041C15 0%, #020f09 100%)',
          borderBottom: '1px solid rgba(34,197,94,0.08)'
        }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${TIER_GLOW[loyalty.tier]} 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', transform: 'translate(-30%,30%)' }} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <motion.div
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden relative"
                    style={{ boxShadow: `0 8px 28px ${TIER_GLOW[loyalty.tier]}` }}
                  >
                    <img
                      src={getCustomerAvatar(customer.name, 150)}
                      alt={customer.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={e => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    {/* Fallback initials */}
                    <div
                      className="w-full h-full absolute inset-0 items-center justify-center text-2xl font-extrabold text-white rounded-2xl"
                      style={{ display: 'none', background: TIER_GRADIENT[loyalty.tier] }}
                    >
                      {getInitials(customer.name)}
                    </div>
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 rounded-full"
                    style={{ borderColor: '#041C15' }} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Selamat datang kembali 👋</p>
                  <h1 className="text-xl font-extrabold text-white mt-0.5">{customer.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}
                    >
                      {tierCfg.icon} {loyalty.tier} Member
                    </motion.span>
                    <span className="text-gray-500 text-xs">{customer.totalOrders || 0}× servis</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">Sejak {new Date(customer.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16,1,0.3,1] }}>
                <Link to="/guest/booking"
                  className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
                  🚗 Booking Service <MdArrowForward />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Loyalty Progress Premium Card ──────────────────── */}
          <ScrollReveal variant={fadeUp} className="mb-6">
            <div className="relative rounded-2xl overflow-hidden p-6"
              style={{ background: TIER_GRADIENT[loyalty.tier], boxShadow: `0 4px 32px ${TIER_GLOW[loyalty.tier]}` }}>
              <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${tierCfg.color}44 0%, transparent 70%)`, transform: 'translate(20%,-20%)' }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MdStars style={{ color: tierCfg.color }} className="text-xl" />
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Loyalty Program</span>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <motion.span
                        key={customer.points}
                        initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-4xl font-extrabold text-white"
                      >
                        {(customer.points || 0).toLocaleString('id-ID')}
                      </motion.span>
                      {loyalty.nextTier && (
                        <span className="text-white/40 text-base">
                          / {TIER_CONFIG[loyalty.nextTier].min.toLocaleString('id-ID')} poin
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl mb-1">{tierCfg.icon}</div>
                    <div className="text-white font-bold text-sm">{loyalty.tier}</div>
                    {loyalty.nextTier && <div className="text-white/40 text-xs mt-0.5">→ {loyalty.nextTier}</div>}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-white/50 mb-2">
                    <span>{loyalty.tier}</span>
                    {loyalty.nextTier
                      ? <span>{loyalty.pointsToNext.toLocaleString('id-ID')} poin menuju {loyalty.nextTier}</span>
                      : <span>🏆 Tier Tertinggi!</span>}
                  </div>
                  <AnimatedProgress value={loyalty.progress} color={tierCfg.color}
                    height={10} bg="rgba(255,255,255,0.15)" delay={0.5} />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-white/40 text-xs">{loyalty.progress}% selesai</span>
                    {loyalty.nextTier && (
                      <Link to="/guest/loyalty" className="text-xs text-white/60 hover:text-white transition-colors">Detail →</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Quick Stats ─────────────────────────────────────── */}
          <StaggerReveal className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: MdStars,         label: 'Loyalty Point', value: (customer.points||0).toLocaleString('id-ID'), color: tierCfg.color, path: '/guest/loyalty'   },
              { icon: MdCardGiftcard,  label: 'Voucher Aktif', value: activeVouchers,                               color: '#A855F7',      path: '/guest/voucher'   },
              { icon: MdBuild,         label: 'Total Servis',  value: customer.totalOrders || 0,                    color: '#22C55E',      path: '/guest/riwayat'   },
              { icon: MdDirectionsCar, label: 'Kendaraan',     value: (customer.vehicles||[]).length,               color: '#60A5FA',      path: '/guest/dashboard' },
            ].map(({ icon: Icon, label, value, color, path }) => (
              <StaggerItem key={label}>
                <Link to={path}
                  className="block rounded-xl p-4 border transition-all hover:border-green-500/25 hover:-translate-y-1 group"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="text-lg" style={{ color }} />
                  </div>
                  <p className="text-white font-extrabold text-2xl leading-none">{value}</p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">

              {/* Kendaraan */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <h2 className="text-white font-bold flex items-center gap-2 mb-4">
                    <MdDirectionsCar className="text-green-400" /> Kendaraan Saya
                  </h2>
                  {(customer.vehicles||[]).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">Belum ada kendaraan terdaftar.</p>
                  ) : (
                    <div className="space-y-3">
                      {(customer.vehicles||[]).map((v, i) => {
                        const daysUntil = Math.ceil((new Date(v.nextService) - new Date()) / 86400000)
                        const urgent = daysUntil <= 30
                        return (
                          <motion.div key={v.id}
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 p-3.5 rounded-xl border"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                              style={{ background: 'rgba(34,197,94,0.08)' }}>
                              {v.type === 'motor' ? '🏍️' : '🚗'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm">{v.brand} {v.model} {v.year}</p>
                              <p className="text-gray-500 text-xs">{v.plate} · {(v.km||0).toLocaleString('id-ID')} km</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1.5 justify-end">
                                {urgent && <GlowDot color="#FB923C" size={6} />}
                                <p className={`text-xs font-semibold ${urgent ? 'text-orange-400' : 'text-gray-400'}`}>
                                  {daysUntil > 0 ? `${daysUntil} hari` : 'Terlambat!'}
                                </p>
                              </div>
                              <p className="text-gray-600 text-xs">service berikutnya</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Active Tracking */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2"><MdGpsFixed className="text-green-400" /> Service Aktif</h2>
                    <Link to="/guest/tracking" className="text-xs text-green-400 hover:text-green-300">Detail →</Link>
                  </div>
                  {myOrders.filter(o => o.status === 'Sedang Dikerjakan').length > 0 ? (
                    myOrders.filter(o => o.status === 'Sedang Dikerjakan').slice(0,1).map(o => (
                      <motion.div key={o.id}
                        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border"
                        style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.2)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-bold text-sm">{o.id}</p>
                            <p className="text-gray-400 text-xs">{o.service}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1.5">
                            <GlowDot color="#FBBF24" size={6} /> Dalam Proses
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">Mekanik: <span className="text-white">{o.mechanic}</span></p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-5 rounded-xl border border-green-500/15 bg-green-500/5 text-center">
                      <MdCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Tidak ada service aktif saat ini.</p>
                      <Link to="/guest/booking" className="text-green-400 text-xs hover:text-green-300 mt-1 inline-block">Buat booking baru →</Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Achievements */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <MdEmojiEvents className="text-yellow-400" /> Achievement
                    </h2>
                    <span className="text-xs text-gray-500">{unlockedCount}/{achievements.length} terbuka</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {achievements.map((a, i) => (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.1, type: 'spring', stiffness: 200 }}
                        whileHover={a.check ? { scale: 1.08, y: -2 } : {}}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                        style={{
                          background: a.check ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${a.check ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          opacity: a.check ? 1 : 0.35,
                        }}>
                        <span className="text-xl">{a.icon}</span>
                        <span className="text-xs text-gray-400 leading-tight">{a.label}</span>
                        {a.check && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="text-xs text-yellow-400 font-bold">✓</motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Notifications */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-2xl border p-5 sticky top-20"
                style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                    <MdNotifications className="text-green-400" /> Notifikasi CRM
                    {highPriority > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                        {highPriority}
                      </motion.span>
                    )}
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {notifications.map((n, i) => (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 + 0.4 }}
                      whileHover={{ x: 3 }}
                      className="p-3 rounded-xl border"
                      style={{ background: n.color, borderColor: `${n.textColor}20` }}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-white leading-tight mb-0.5">{n.title}</p>
                          <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{n.desc}</p>
                          <Link to={n.actionPath} className="text-xs font-semibold" style={{ color: n.textColor }}>{n.action} →</Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button onClick={logout}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)' }} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm text-red-400 transition-colors"
                  style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
                  <MdLogout size={16} /> Keluar
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}