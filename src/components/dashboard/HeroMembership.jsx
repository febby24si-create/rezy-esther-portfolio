import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdArrowForward, MdRefresh } from 'react-icons/md'
import { getCustomerAvatar } from '../../utils/randomAvatar'
import { calcLoyaltyProgress, TIER_CONFIG } from '../../lib/loyaltyConstants'
import { AnimatedProgress } from '../AnimatedPage'

const TIER_GRADIENT = {
  Bronze: 'linear-gradient(135deg, #431407 0%, #7C2D12 50%, #431407 100%)',
  Silver: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
  Gold:   'linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)',
  Platinum: 'linear-gradient(135deg, #2E1065 0%, #3B0764 50%, #2E1065 100%)',
}
const TIER_GLOW = {
  Bronze: 'rgba(249,115,22,0.28)',  Silver: 'rgba(148,163,184,0.25)',
  Gold:   'rgba(251,191,36,0.32)',  Platinum: 'rgba(168,85,247,0.32)',
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function HeroMembership({ customer, onRefresh }) {
  const loyalty = calcLoyaltyProgress(customer.points || 0)
  const tierCfg = TIER_CONFIG[loyalty.tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl overflow-hidden p-6 md:p-8"
      style={{
        background: TIER_GRADIENT[loyalty.tier],
        boxShadow: `0 8px 48px ${TIER_GLOW[loyalty.tier]}`,
      }}
    >
      {/* Background pattern & glow */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tierCfg.color}44 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: `0 8px 28px ${TIER_GLOW[loyalty.tier]}` }}
          >
            <img
              src={getCustomerAvatar(customer.name, 150)}
              alt={customer.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div
              className="w-full h-full absolute inset-0 items-center justify-center text-3xl font-extrabold text-white"
              style={{ display: 'none', background: TIER_GRADIENT[loyalty.tier] }}
            >
              {getInitials(customer.name)}
            </div>
          </motion.div>
          <div>
            <p className="text-white/60 text-sm">Selamat datang kembali 👋</p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">{customer.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}
              >
                {tierCfg.icon} {loyalty.tier} Member
              </span>
              <span className="text-white/40 text-xs">{customer.totalOrders || 0}× servis</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/40 text-xs">Sejak {new Date(customer.joinDate).getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-3 rounded-xl text-white/70 hover:text-white transition-all bg-white/5 border border-white/10"
          >
            <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.6 }}>
              <MdRefresh size={20} />
            </motion.div>
          </motion.button>

          <Link to="/member/booking"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
          >
            🚗 Booking Service <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}><MdArrowForward /></motion.span>
          </Link>
        </div>
      </div>

      {/* ─── Loyalty Progress ─────────────────────────────────── */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
          <span className="flex items-center gap-2">
            <span>⭐ {loyalty.tier}</span>
            {loyalty.nextTier && (
              <span className="text-xs">→ {loyalty.nextTier}</span>
            )}
          </span>
          <span>
            {loyalty.nextTier
              ? `${loyalty.pointsToNext.toLocaleString('id-ID')} poin menuju ${loyalty.nextTier}`
              : '🏆 Tier Tertinggi!'}
          </span>
        </div>
        <AnimatedProgress value={loyalty.progress} color={tierCfg.color} height={6} bg="rgba(255,255,255,0.15)" delay={0.4} />
        <div className="flex justify-between mt-1.5 text-xs text-white/30">
          <span>{loyalty.progress}% selesai</span>
          <Link to="/member/loyalty" className="text-white/50 hover:text-white transition-colors">Detail →</Link>
        </div>
      </div>
    </motion.div>
  )
}