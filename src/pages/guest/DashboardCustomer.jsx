import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useSpring, useTransform } from 'framer-motion'
import {
  MdDirectionsCar, MdBuild, MdCardGiftcard, MdStars, MdNotifications,
  MdArrowForward, MdGpsFixed, MdCheckCircle, MdEmojiEvents, MdLogout,
  MdRefresh, MdShare, MdCopyAll, MdInfoOutline,
} from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import {
  AnimatedPage, ScrollReveal, StaggerReveal, StaggerItem,
  AnimatedProgress, HoverCard, PressButton, GlowDot, fadeUp, scaleIn
} from '../../components/AnimatedPage'
import { getCustomerAvatar } from '../../utils/randomAvatar'

// ===================== NEW COMPONENTS =====================
function AnimatedNumber({ value, format = (v) => v.toLocaleString('id-ID'), duration = 0.6 }) {
  const [displayValue, setDisplayValue] = useState(value)
  const springValue = useSpring(value, { stiffness: 100, damping: 20, duration })

  useEffect(() => {
    const unsubscribe = springValue.onChange(v => setDisplayValue(Math.floor(v)))
    springValue.set(value)
    return () => unsubscribe()
  }, [springValue, value])

  return <motion.span>{format(displayValue)}</motion.span>
}

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColors = {
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    error: 'bg-gradient-to-r from-red-600 to-rose-600',
    info: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl ${bgColors[type]} text-white font-medium flex items-center gap-3 backdrop-blur-sm`}
    >
      <span>{type === 'success' ? '✨' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </motion.div>
  )
}

function Shimmer({ className = "h-4 w-full rounded" }) {
  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Shimmer className="w-16 h-16 rounded-2xl" />
          <div className="flex-1">
            <Shimmer className="w-32 h-4 mb-2" />
            <Shimmer className="w-48 h-6" />
          </div>
        </div>
        <Shimmer className="w-full h-32 rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Shimmer className="h-64 rounded-2xl" />
            <Shimmer className="h-40 rounded-2xl" />
            <Shimmer className="h-48 rounded-2xl" />
          </div>
          <Shimmer className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ===================== MAIN COMPONENT =====================
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
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [toast, setToast] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh - in real app, you'd refetch data
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsRefreshing(false)
    setToast({ message: 'Data berhasil diperbarui!', type: 'success' })
  }

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout()
      setToast({ message: 'Anda telah keluar', type: 'info' })
    }
  }

  const copyReferralCode = () => {
    const code = customer?.referralCode || 'GARAGE2024'
    navigator.clipboard.writeText(code)
    setShowCopied(true)
    setToast({ message: 'Kode berhasil disalin!', type: 'success' })
    setTimeout(() => setShowCopied(false), 2000)
  }

  if (!customer) return <DashboardSkeleton />

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

  const stats = [
    { icon: MdStars,         label: 'Loyalty Point', value: customer.points || 0, color: tierCfg.color, path: '/guest/loyalty', formatter: v => v.toLocaleString('id-ID') },
    { icon: MdCardGiftcard,  label: 'Voucher Aktif', value: activeVouchers,       color: '#A855F7',      path: '/guest/voucher', formatter: v => v },
    { icon: MdBuild,         label: 'Total Servis',  value: customer.totalOrders || 0, color: '#22C55E', path: '/guest/riwayat', formatter: v => v },
    { icon: MdDirectionsCar, label: 'Kendaraan',     value: (customer.vehicles||[]).length, color: '#60A5FA', path: '/guest/dashboard', formatter: v => v },
  ]

  return (
    <AnimatedPage>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          background: inherit;
        }
      `}</style>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

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
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden relative"
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
                    <div
                      className="w-full h-full absolute inset-0 items-center justify-center text-2xl font-extrabold text-white rounded-2xl"
                      style={{ display: 'none', background: TIER_GRADIENT[loyalty.tier] }}
                    >
                      {getInitials(customer.name)}
                    </div>
                  </div>
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 rounded-full"
                    style={{ borderColor: '#041C15' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-sm"
                  >
                    Selamat datang kembali 👋
                  </motion.p>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-extrabold text-white mt-0.5"
                  >
                    {customer.name}
                  </motion.h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
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
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="p-3 rounded-xl text-white/70 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 0.6 }}>
                    <MdRefresh size={20} />
                  </motion.div>
                </motion.button>
                
                <motion.div
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.16,1,0.3,1] }}
                >
                  <Link to="/guest/booking"
                    className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
                  >
                    🚗 Booking Service <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}><MdArrowForward /></motion.span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Membership Banner (Non-Member) ───────────────── */}
          {customer.membershipStatus !== 'active' && (
            <ScrollReveal className="mb-6">
              <motion.div
                className="relative rounded-2xl overflow-hidden p-5"
                style={{
                  background: 'linear-gradient(135deg, #052015 0%, #082b1e 100%)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  boxShadow: '0 4px 24px rgba(34,197,94,0.08)',
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: 'rgba(34,197,94,0.12)' }}>🎖️</div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">Aktifkan Membership Gratis</p>
                    <p className="text-gray-400 text-xs mt-0.5">Kumpulkan poin, naik tier, dan nikmati diskon eksklusif setiap servis.</p>
                  </div>
                  <Link to="/guest/profil"
                    className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                    Daftar
                  </Link>
                </div>
              </motion.div>
            </ScrollReveal>
          )}

          {/* ── Voucher Spotlight ─────────────────────────────── */}
          {(customer.vouchers||[]).filter(v => v.status === 'active').length > 0 && (
            <ScrollReveal className="mb-6">
              <div className="rounded-2xl border p-5"
                style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.15)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold text-sm flex items-center gap-2">
                    <MdCardGiftcard className="text-purple-400" /> Voucher Aktif
                  </h2>
                  <Link to="/guest/voucher" className="text-xs text-purple-400 hover:text-purple-300">Lihat semua →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(customer.vouchers||[]).filter(v => v.status === 'active').slice(0,2).map(v => (
                    <motion.div key={v.id} whileHover={{ scale: 1.02, y: -2 }}
                      className="p-3 rounded-xl border flex items-center gap-3"
                      style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'rgba(168,85,247,0.15)' }}>🎫</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs truncate">{v.title}</p>
                        <p className="text-purple-400 font-bold text-sm">Diskon {v.diskon}%</p>
                        <p className="text-gray-500 text-xs">s/d {v.validUntil}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* ── Loyalty Progress Premium Card ──────────────────── */}
          <ScrollReveal variant={fadeUp} className="mb-6">
            <motion.div 
              className="relative rounded-2xl overflow-hidden p-6 cursor-pointer"
              style={{ background: TIER_GRADIENT[loyalty.tier], boxShadow: `0 4px 32px ${TIER_GLOW[loyalty.tier]}` }}
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => window.location.href = '/guest/loyalty'}
            >
              <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${tierCfg.color}44 0%, transparent 70%)`, transform: 'translate(20%,-20%)' }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        <MdStars style={{ color: tierCfg.color }} className="text-xl" />
                      </motion.div>
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Loyalty Program</span>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <motion.span
                        key={customer.points}
                        initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="text-4xl font-extrabold text-white"
                      >
                        <AnimatedNumber value={customer.points || 0} />
                      </motion.span>
                      {loyalty.nextTier && (
                        <span className="text-white/40 text-base">
                          / {TIER_CONFIG[loyalty.nextTier].min.toLocaleString('id-ID')} poin
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    className="text-right"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-3xl mb-1">{tierCfg.icon}</div>
                    <div className="text-white font-bold text-sm">{loyalty.tier}</div>
                    {loyalty.nextTier && <div className="text-white/40 text-xs mt-0.5">→ {loyalty.nextTier}</div>}
                  </motion.div>
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
            </motion.div>
          </ScrollReveal>

          {/* ── Quick Stats ─────────────────────────────────────── */}
          <StaggerReveal className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.map(({ icon: Icon, label, value, color, path, formatter }) => (
              <StaggerItem key={label}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link to={path}
                    className="block rounded-xl p-4 border transition-all duration-300 hover:border-green-500/40"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <motion.div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 relative"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Icon className="text-lg" style={{ color }} />
                    </motion.div>
                    <p className="text-white font-extrabold text-2xl leading-none">
                      <AnimatedNumber value={value} format={formatter} />
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{label}</p>
                  </Link>
                  {label === 'Loyalty Point' && value > 0 && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ background: color }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">

              {/* Kendaraan Section with Add Button */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5 transition-all hover:border-green-500/20"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <MdDirectionsCar className="text-green-400" />
                      </motion.div>
                      Kendaraan Saya
                    </h2>
                    <Link to="/guest/add-vehicle" 
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                      + Tambah
                    </Link>
                  </div>
                  
                  {(customer.vehicles||[]).length === 0 ? (
                    <motion.div 
                      className="p-8 rounded-xl border border-dashed text-center"
                      style={{ borderColor: 'rgba(34,197,94,0.2)' }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <p className="text-gray-500 text-sm">Belum ada kendaraan terdaftar.</p>
                      <Link to="/guest/add-vehicle" className="text-green-400 text-sm hover:text-green-300 mt-2 inline-block">
                        Tambah kendaraan sekarang →
                      </Link>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {(customer.vehicles||[]).map((v, i) => {
                        const daysUntil = Math.ceil((new Date(v.nextService) - new Date()) / 86400000)
                        const urgent = daysUntil <= 30
                        const isOverdue = daysUntil < 0
                        return (
                          <motion.div key={v.id}
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                            whileHover={{ x: 6, scale: 1.01 }}
                            className="flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: urgent ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)' }}>
                            <motion.div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden"
                              style={{ background: 'rgba(34,197,94,0.08)' }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              {v.photo
                                ? <img src={v.photo} alt={v.model} className="w-full h-full object-cover" />
                                : <span>{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                              }
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm">{v.brand} {v.model} {v.year}</p>
                              <p className="text-gray-500 text-xs">{v.plate} · {(v.km||0).toLocaleString('id-ID')} km</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1.5 justify-end">
                                {(urgent || isOverdue) && <GlowDot color={isOverdue ? '#EF4444' : '#FB923C'} size={6} />}
                                <p className={`text-xs font-semibold ${isOverdue ? 'text-red-400' : urgent ? 'text-orange-400' : 'text-gray-400'}`}>
                                  {isOverdue ? 'Terlambat!' : daysUntil > 0 ? `${daysUntil} hari` : 'Hari ini'}
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

              {/* Active Tracking with better visual */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5 transition-all hover:border-green-500/20"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <MdGpsFixed className="text-green-400" />
                      </motion.div>
                      Service Aktif
                    </h2>
                    <Link to="/guest/tracking" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                      Detail <MdArrowForward size={12} />
                    </Link>
                  </div>
                  
                  {myOrders.filter(o => o.status === 'Sedang Dikerjakan').length > 0 ? (
                    myOrders.filter(o => o.status === 'Sedang Dikerjakan').slice(0,1).map(o => (
                      <motion.div key={o.id}
                        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-xl border relative overflow-hidden"
                        style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.2)' }}>
                        <motion.div 
                          className="absolute inset-0 opacity-20"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }}
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-bold text-sm">{o.id}</p>
                            <p className="text-gray-400 text-xs">{o.service}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1.5">
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <GlowDot color="#FBBF24" size={6} />
                            </motion.span>
                            Dalam Proses
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">Mekanik: <span className="text-white">{o.mechanic}</span></p>
                        <motion.div 
                          className="mt-3 h-1 rounded-full bg-yellow-500/30 overflow-hidden"
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        >
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '100%' }} />
                        </motion.div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="p-5 rounded-xl border border-green-500/15 bg-green-500/5 text-center"
                      whileHover={{ scale: 1.01 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MdCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                      </motion.div>
                      <p className="text-gray-400 text-sm">Tidak ada service aktif saat ini.</p>
                      <Link to="/guest/booking" className="text-green-400 text-sm hover:text-green-300 mt-2 inline-block">
                        Buat booking baru →
                      </Link>
                    </motion.div>
                  )}
                </div>
              </ScrollReveal>

              {/* Achievements with celebration effects */}
              <ScrollReveal>
                <div className="rounded-2xl border p-5 transition-all hover:border-green-500/20"
                  style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MdEmojiEvents className="text-yellow-400" />
                      </motion.div>
                      Achievement
                    </h2>
                    <motion.span 
                      className="text-xs text-gray-500"
                      animate={{ scale: unlockedCount > 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {unlockedCount}/{achievements.length} terbuka
                    </motion.span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {achievements.map((a, i) => (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.1, type: 'spring', stiffness: 200 }}
                        whileHover={a.check ? { scale: 1.08, y: -4 } : {}}
                        className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                        style={{
                          background: a.check ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${a.check ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          opacity: a.check ? 1 : 0.45,
                        }}>
                        <motion.span 
                          className="text-xl"
                          animate={a.check ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          {a.icon}
                        </motion.span>
                        <span className="text-xs text-gray-400 leading-tight">{a.label}</span>
                        {a.check && (
                          <motion.span 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: i * 0.05 }}
                            className="absolute -top-1 -right-1 text-xs text-yellow-400 font-bold bg-black/50 rounded-full px-1"
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Notifications Panel with improved UX */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-2xl border p-5 sticky top-20 transition-all hover:border-green-500/20"
                style={{ background: 'rgba(34,197,94,0.025)', borderColor: 'rgba(34,197,94,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      <MdNotifications className="text-green-400" />
                    </motion.div>
                    Notifikasi CRM
                    {highPriority > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold"
                      >
                        {highPriority}
                      </motion.span>
                    )}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-500 text-xs hover:text-gray-400"
                    onClick={() => setToast({ message: 'Semua notifikasi telah dibaca', type: 'info' })}
                  >
                    Tandai baca
                  </motion.button>
                </div>
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {notifications.map((n, i) => (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 + 0.4 }}
                      whileHover={{ x: 4, scale: 1.01 }}
                      className="p-3 rounded-xl border cursor-pointer transition-all"
                      style={{ background: n.color, borderColor: `${n.textColor}20` }}
                      onClick={() => window.location.href = n.actionPath}
                    >
                      <div className="flex items-start gap-2.5">
                        <motion.span 
                          className="text-lg flex-shrink-0 mt-0.5"
                          animate={n.priority === 'high' ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {n.icon}
                        </motion.span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-white leading-tight mb-0.5">{n.title}</p>
                          <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{n.desc}</p>
                          <motion.span 
                            className="text-xs font-semibold inline-block"
                            style={{ color: n.textColor }}
                            whileHover={{ x: 3 }}
                          >
                            {n.action} →
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Referral Code Section */}
                <motion.div 
                  className="mt-4 pt-4 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <MdShare size={12} /> Kode Referral
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-black/30 px-3 py-2 rounded-lg text-green-400 font-mono">
                      {customer.referralCode || 'GARAGE2024'}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyReferralCode}
                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      <MdCopyAll size={16} />
                    </motion.button>
                  </div>
                  {showCopied && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-400 text-xs mt-1 text-center"
                    >
                      ✓ Tersalin!
                    </motion.p>
                  )}
                </motion.div>

                <motion.button 
                  onClick={handleLogout}
                  whileHover={{ background: 'rgba(239,68,68,0.15)', scale: 1.02 }} 
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm text-red-400 transition-all"
                  style={{ border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <MdLogout size={16} /> Keluar
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34,197,94,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34,197,94,0.5);
        }
      `}</style>
    </AnimatedPage>
  )
}