// ============================================================
// CustomerAuthContext.jsx
// Auth khusus customer — terpisah dari auth admin
// Menyimpan session, data customer, dan loyalty engine
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { applyOrderCompletedLoyalty } from '../lib/loyaltyEngine'
import {
  TIER_CONFIG,
  calcTier,
  calcLoyaltyProgress,
  calcPointsFromOrder,
  calcAchievements,
} from '../lib/loyaltyConstants'

const CustomerAuthContext = createContext(null)

// PHASE 2 — TIER_CONFIG, calcTier, calcLoyaltyProgress,
// calcPointsFromOrder, calcAchievements dipindahkan ke
// lib/loyaltyConstants.js (untuk menghindari circular import
// dengan lib/loyaltyEngine.js, lihat komentar di file tersebut).
// Re-export di sini agar SEMUA import existing dari
// '../../context/CustomerAuthContext' (GuestNavbar, CRMAutomation,
// LoyaltyPoint, DashboardCustomer, Leaderboard) tetap berfungsi
// tanpa perlu diubah satu pun — additive, tidak ada breaking change.
export { TIER_CONFIG, calcTier, calcLoyaltyProgress, calcPointsFromOrder, calcAchievements }

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
  // ============================================================
  // PHASE 2 — DEPRECATED dari jalur booking.
  //
  // Fungsi ini SEBELUMNYA dipanggil langsung dari
  // BookingService.handleSubmit saat order baru dibuat (status
  // 'Antrian'), memberikan poin/tier-voucher/after-service-voucher
  // berdasarkan totalEstimate — sebelum servis benar-benar
  // dikerjakan/selesai. Ini melanggar Rule 1 & 2.
  //
  // Sekarang: BookingService TIDAK memanggil fungsi ini lagi.
  // Logic poin/tier/voucher telah diekstrak ke
  // lib/loyaltyEngine.js (applyOrderCompletedLoyalty), yang
  // dipanggil oleh subscriber ORDER_COMPLETED
  // (lib/orderSubscribers.js) saat admin menandai order 'Selesai',
  // menggunakan finalTotal.
  //
  // addPoints tetap diekspor untuk backward-compat (jika ada kode
  // lain yang memanggilnya), tapi sekarang hanya mendelegasikan ke
  // loyaltyEngine agar tidak ada dua implementasi logic yang
  // divergen. Idealnya dihapus sepenuhnya begitu dipastikan tidak
  // ada caller tersisa.
  // ============================================================
  const addPoints = useCallback((orderId, total, serviceLabel) => {
    if (!customer) return
    const result = applyOrderCompletedLoyalty(customer.id, total, orderId, serviceLabel)
    if (result.success) {
      // Sinkronkan state customer di context dengan data terbaru
      // yang sudah ditulis applyOrderCompletedLoyalty ke eg_customers.
      const customers = loadCustomers()
      const fresh = customers.find(c => c.id === customer.id)
      if (fresh) setCustomer(fresh)
    }
    return result
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