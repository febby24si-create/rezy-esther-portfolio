// ============================================================
// CustomerAuthContext.jsx
// Auth khusus customer — terpisah dari auth admin
// Menyimpan session, data customer, dan loyalty engine
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CustomerAuthContext = createContext(null)

// ─── Loyalty Engine ──────────────────────────────────────────
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

// ─── LocalStorage helpers ────────────────────────────────────
const LS_KEY_CUSTOMERS = 'eg_customers'
const LS_KEY_SESSION   = 'eg_customer_session'

function loadCustomers() {
  try {
    const raw = localStorage.getItem(LS_KEY_CUSTOMERS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCustomers(list) {
  localStorage.setItem(LS_KEY_CUSTOMERS, JSON.stringify(list))
}

function loadSession() {
  try {
    const raw = localStorage.getItem(LS_KEY_SESSION)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ─── Seed demo customer agar langsung bisa demo ──────────────
function seedDemoCustomer() {
  const existing = loadCustomers()
  if (existing.find(c => c.email === 'budi@esthergarage.id')) return
  const demo = {
    id:           'C-001',
    name:         'Budi Santoso',
    email:        'budi@esthergarage.id',
    password:     'budi123',
    phone:        '0812-3456-7890',
    birthDate:    '1990-05-15',
    joinDate:     '2023-03-15',
    points:       1850,
    totalOrders:  12,
    totalSpent:   4250000,
    reviewCount:  2,
    vehicles: [
      { id: 'V01', brand: 'Toyota', model: 'Avanza', year: 2020, plate: 'B 1234 ABC', color: 'Silver', type: 'mobil', lastService: '2025-05-10', nextService: '2025-11-10', km: 48500 },
      { id: 'V02', brand: 'Honda',  model: 'Beat',   year: 2022, plate: 'D 5678 XYZ', color: 'Merah',  type: 'motor', lastService: '2025-03-20', nextService: '2025-09-20', km: 15200 },
    ],
    vouchers: [
      { id: 'VC-2401', code: 'BDAY-BUDI-2024', title: 'Voucher Ulang Tahun',    diskon: 20,  status: 'active',  validUntil: '2026-07-31', type: 'birthday' },
      { id: 'VC-2402', code: 'AFTER-SVC-001',  title: 'Voucher Setelah Service', diskon: 10,  status: 'active',  validUntil: '2026-08-15', type: 'aftersvc' },
      { id: 'VC-2403', code: 'LOYAL-GOLD-01',  title: 'Reward Pelanggan Gold',   diskon: 15,  status: 'active',  validUntil: '2026-09-01', type: 'loyalty'  },
      { id: 'VC-2404', code: 'MEMBER-BARU',    title: 'Welcome Member',          diskon: 15,  status: 'used',    validUntil: '2024-12-31', usedAt: '2024-11-20', type: 'member' },
    ],
    pointHistory: [
      { id: 'LP-001', type: 'in',  desc: 'Service Berkala — #ORD-A1B2C3D4', points: 450,  date: '2025-05-10' },
      { id: 'LP-002', type: 'in',  desc: 'Bonus Loyal Customer',             points: 200,  date: '2025-04-28' },
      { id: 'LP-003', type: 'out', desc: 'Redeem Voucher Service',           points: -300, date: '2025-04-15' },
      { id: 'LP-004', type: 'in',  desc: 'Ganti Oli — #ORD-E5F6G7H8',       points: 120,  date: '2025-03-20' },
      { id: 'LP-005', type: 'in',  desc: 'Tune Up — #ORD-I9J0K1L2',         points: 350,  date: '2025-02-14' },
      { id: 'LP-006', type: 'out', desc: 'Redeem Free Service',              points: -500, date: '2025-01-30' },
      { id: 'LP-007', type: 'in',  desc: 'Service AC — #ORD-M3N4O5P6',      points: 280,  date: '2024-12-05' },
    ],
    reviews: [],
  }
  saveCustomers([...existing, demo])
}

// ─── Provider ────────────────────────────────────────────────
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    seedDemoCustomer()
    const session = loadSession()
    if (session) {
      const customers = loadCustomers()
      const found = customers.find(c => c.id === session.id)
      if (found) setCustomer(found)
    }
    setLoading(false)
  }, [])

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(({ name, email, password, phone, birthDate }) => {
    const customers = loadCustomers()
    if (customers.find(c => c.email === email)) {
      return { success: false, message: 'Email sudah terdaftar.' }
    }
    const newCustomer = {
      id:          'C-' + Date.now(),
      name, email, password, phone,
      birthDate:   birthDate || '',
      joinDate:    new Date().toISOString().slice(0, 10),
      points:      0,
      totalOrders: 0,
      totalSpent:  0,
      reviewCount: 0,
      vehicles:    [],
      vouchers: [
        {
          id:         'VC-WELCOME-' + Date.now(),
          code:       'WELCOME' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          title:      'Welcome Member — Diskon 15%',
          diskon:     15,
          status:     'active',
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          type:       'member',
        },
      ],
      pointHistory: [
        { id: 'LP-W01', type: 'in', desc: 'Bonus Registrasi Member Baru', points: 50, date: new Date().toISOString().slice(0, 10) },
      ],
      reviews: [],
    }
    // Beri 50 point bonus registrasi
    newCustomer.points = 50

    const updated = [...customers, newCustomer]
    saveCustomers(updated)
    setCustomer(newCustomer)
    localStorage.setItem(LS_KEY_SESSION, JSON.stringify({ id: newCustomer.id }))
    return { success: true }
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const customers = loadCustomers()
    const found = customers.find(c => c.email === email && c.password === password)
    if (!found) return { success: false, message: 'Email atau password salah.' }
    setCustomer(found)
    localStorage.setItem(LS_KEY_SESSION, JSON.stringify({ id: found.id }))
    return { success: true }
  }, [])

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    setCustomer(null)
    localStorage.removeItem(LS_KEY_SESSION)
  }, [])

  // ── Update customer di state + localStorage ───────────────
  const updateCustomer = useCallback((updatedData) => {
    const customers = loadCustomers()
    const idx = customers.findIndex(c => c.id === updatedData.id)
    if (idx === -1) return
    customers[idx] = updatedData
    saveCustomers(customers)
    setCustomer(updatedData)
  }, [])

  // ── Tambah point setelah order ────────────────────────────
  const addPoints = useCallback((orderId, total, serviceLabel) => {
    if (!customer) return
    const earned = calcPointsFromOrder(total)
    if (earned <= 0) return

    const customers = loadCustomers()
    const idx = customers.findIndex(c => c.id === customer.id)
    if (idx === -1) return

    const updated = {
      ...customers[idx],
      points:      (customers[idx].points || 0) + earned,
      totalOrders: (customers[idx].totalOrders || 0) + 1,
      totalSpent:  (customers[idx].totalSpent  || 0) + Number(total),
      pointHistory: [
        {
          id:     'LP-' + Date.now(),
          type:   'in',
          desc:   `${serviceLabel} — ${orderId}`,
          points: earned,
          date:   new Date().toISOString().slice(0, 10),
        },
        ...(customers[idx].pointHistory || []),
      ],
    }

    // Cek apakah naik tier → berikan bonus voucher
    const oldTier = calcTier(customers[idx].points || 0)
    const newTier = calcTier(updated.points)
    if (oldTier !== newTier) {
      updated.vouchers = [
        {
          id:         'VC-TIER-' + Date.now(),
          code:       newTier.toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          title:      `Selamat! Naik ke ${newTier} Member`,
          diskon:     newTier === 'Silver' ? 10 : newTier === 'Gold' ? 15 : 20,
          status:     'active',
          validUntil: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
          type:       'loyalty',
        },
        ...(updated.vouchers || []),
      ]
    }

    // Voucher setelah service (sekali per order)
    updated.vouchers = [
      {
        id:         'VC-AFTER-' + Date.now(),
        code:       'AFTER-' + orderId.replace('#', '').slice(-6),
        title:      'Voucher Setelah Service — Diskon 10%',
        diskon:     10,
        status:     'active',
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        type:       'aftersvc',
      },
      ...(updated.vouchers || []),
    ]

    customers[idx] = updated
    saveCustomers(customers)
    setCustomer(updated)
  }, [customer])

  // ── Tambah review ─────────────────────────────────────────
  const addReview = useCallback((orderId, reviewData) => {
    if (!customer) return

    const customers = loadCustomers()
    const idx = customers.findIndex(c => c.id === customer.id)
    if (idx === -1) return

    const newReview = {
      id:         'REV-' + Date.now(),
      orderId,
      rating:     reviewData.rating,
      reviewText: reviewData.reviewText,
      mechanic:   reviewData.mechanic,
      ratingMekanik:   reviewData.ratingMekanik,
      ratingPelayanan: reviewData.ratingPelayanan,
      ratingKecepatan: reviewData.ratingKecepatan,
      date:       new Date().toISOString().slice(0, 10),
    }

    const updated = {
      ...customers[idx],
      reviewCount: (customers[idx].reviewCount || 0) + 1,
      reviews:     [newReview, ...(customers[idx].reviews || [])],
      // Bonus 50 point per review
      points:      (customers[idx].points || 0) + 50,
      pointHistory: [
        { id: 'LP-REV-' + Date.now(), type: 'in', desc: 'Bonus Review Servis', points: 50, date: new Date().toISOString().slice(0, 10) },
        ...(customers[idx].pointHistory || []),
      ],
    }

    customers[idx] = updated

    // Simpan juga review ke garage_reviews untuk dibaca admin
    const allReviews = JSON.parse(localStorage.getItem('garage_reviews') || '[]')
    allReviews.unshift({
      ...newReview,
      customerName: customer.name,
      customerId:   customer.id,
    })
    localStorage.setItem('garage_reviews', JSON.stringify(allReviews))

    saveCustomers(customers)
    setCustomer(updated)
  }, [customer])

  // ── Redeem reward ─────────────────────────────────────────
  const redeemReward = useCallback((reward) => {
    if (!customer) return { success: false, message: 'Belum login.' }
    if (customer.points < reward.points) return { success: false, message: 'Poin tidak cukup.' }

    const customers = loadCustomers()
    const idx = customers.findIndex(c => c.id === customer.id)
    if (idx === -1) return { success: false, message: 'Data tidak ditemukan.' }

    const updated = {
      ...customers[idx],
      points: customers[idx].points - reward.points,
      vouchers: [
        {
          id:         'VC-REDEEM-' + Date.now(),
          code:       'REDEEM-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          title:      reward.name,
          diskon:     reward.diskonPct || 10,
          status:     'active',
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          type:       'loyalty',
        },
        ...(customers[idx].vouchers || []),
      ],
      pointHistory: [
        { id: 'LP-RD-' + Date.now(), type: 'out', desc: `Redeem: ${reward.name}`, points: -reward.points, date: new Date().toISOString().slice(0, 10) },
        ...(customers[idx].pointHistory || []),
      ],
    }

    customers[idx] = updated
    saveCustomers(customers)
    setCustomer(updated)
    return { success: true }
  }, [customer])

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      loading,
      isLoggedIn: !!customer,
      login,
      logout,
      register,
      updateCustomer,
      addPoints,
      addReview,
      redeemReward,
      // helpers
      getLoyaltyInfo: () => customer ? calcLoyaltyProgress(customer.points || 0) : null,
      getAchievements: () => customer ? calcAchievements(customer) : [],
    }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider')
  return ctx
}

// Fungsi publik untuk membaca semua customers (dipakai admin dashboard)
export function getAllCustomers() {
  return loadCustomers()
}