// ============================================================
// lib/loyaltyConstants.js
//
// PHASE 2 — Ekstraksi loyalty/tier constants & pure functions
//
// Sebelumnya TIER_CONFIG, calcTier, calcLoyaltyProgress,
// calcPointsFromOrder, dan calcAchievements didefinisikan di
// CustomerAuthContext.jsx. lib/loyaltyEngine.js (yang dipakai
// oleh subscriber ORDER_COMPLETED di Orders.jsx/admin) butuh
// calcTier & calcPointsFromOrder, tapi CustomerAuthContext.jsx
// juga butuh applyOrderCompletedLoyalty dari loyaltyEngine.js
// (untuk addPoints yang sudah dideprecate) -- ini membentuk
// circular import.
//
// Fix: pindahkan constants & pure functions ke file netral ini.
// CustomerAuthContext.jsx me-re-export semuanya agar SEMUA
// import existing dari '../../context/CustomerAuthContext'
// (GuestNavbar, CRMAutomation, LoyaltyPoint, DashboardCustomer,
// Leaderboard) tetap berfungsi tanpa perlu diubah -- additive,
// tidak ada breaking change pada consumer.
// ============================================================

export const TIER_CONFIG = {
  Bronze:   { min: 0,    max: 499,  next: 'Silver',   color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  icon: '🥉' },
  Silver:   { min: 500,  max: 1499, next: 'Gold',     color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', icon: '🥈' },
  Gold:     { min: 1500, max: 2999, next: 'Platinum', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  icon: '🥇' },
  Platinum: { min: 3000, max: Infinity, next: null,   color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)',  icon: '💎' },
}

export function calcTier(points) {
  if (points >= 3000) return 'Platinum'
  if (points >= 1500) return 'Gold'
  if (points >= 500)  return 'Silver'
  return 'Bronze'
}

export function calcLoyaltyProgress(points) {
  const tier = calcTier(points)
  const cfg  = TIER_CONFIG[tier]
  if (!cfg.next) return { tier, nextTier: null, progress: 100, pointsToNext: 0 }
  const nextCfg   = TIER_CONFIG[cfg.next]
  const rangeSize = nextCfg.min - cfg.min
  const inRange   = points - cfg.min
  const progress  = Math.min(Math.round((inRange / rangeSize) * 100), 100)
  return { tier, nextTier: cfg.next, progress, pointsToNext: nextCfg.min - points }
}

export function calcPointsFromOrder(total) {
  // 1 point per Rp 1.000 transaksi
  return Math.floor(Number(total) / 1000)
}

// ─── Achievement Engine ──────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { id: 'first_service',   label: 'First Service',    icon: '🔧', desc: 'Menyelesaikan servis pertama',           check: (c) => c.totalOrders >= 1    },
  { id: 'loyal_5',         label: 'Loyal Customer',   icon: '⭐', desc: 'Sudah 5 kali servis di Esther Garage',   check: (c) => c.totalOrders >= 5    },
  { id: 'loyal_10',        label: 'Elite Customer',   icon: '👑', desc: 'Sudah 10 kali servis di Esther Garage',  check: (c) => c.totalOrders >= 10   },
  { id: 'silver_member',   label: 'Silver Member',    icon: '🥈', desc: 'Mencapai tier Silver',                   check: (c) => ['Silver','Gold','Platinum'].includes(calcTier(c.points)) },
  { id: 'gold_member',     label: 'Gold Member',      icon: '🥇', desc: 'Mencapai tier Gold',                     check: (c) => ['Gold','Platinum'].includes(calcTier(c.points))          },
  { id: 'platinum_member', label: 'Platinum Member',  icon: '💎', desc: 'Mencapai tier Platinum',                 check: (c) => calcTier(c.points) === 'Platinum'                         },
  { id: 'top_reviewer',    label: 'Top Reviewer',     icon: '📝', desc: 'Memberikan 3 review atau lebih',         check: (c) => (c.reviewCount || 0) >= 3                                 },
  { id: 'big_spender',     label: 'Big Spender',      icon: '💰', desc: 'Total pengeluaran di atas Rp 2.000.000', check: (c) => (c.totalSpent || 0) >= 2000000                            },
]

export function calcAchievements(customerData) {
  return ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlocked: def.check(customerData),
  }))
}