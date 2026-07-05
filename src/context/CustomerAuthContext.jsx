// ============================================================
// CustomerAuthContext.jsx
// Auth customer — login & register via Supabase
// Data customer disimpan di tabel customers Supabase
// Session tetap via sessionStorage (pola existing)
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { customerAPI } from '../services/customerAPI'
import { pointAPI }    from '../services/pointAPI'
import { voucherAPI }  from '../services/voucherAPI'

const CustomerAuthContext = createContext(null)

// ─── Loyalty Engine ──────────────────────────────────────────
export const TIER_CONFIG = {
  Bronze:   { min: 0,    max: 499,  next: 'Silver',   color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  icon: '🥉' },
  Silver:   { min: 500,  max: 1499, next: 'Gold',     color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', icon: '🥈' },
  Gold:     { min: 1500, max: 2999, next: 'Platinum', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  icon: '🥇' },
  Platinum: { min: 3000, max: Infinity, next: null,   color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)',  icon: '💎' },
}

export const TIER_BENEFITS = {
  Bronze:   ['Promo umum & diskon seasonal', 'Voucher setelah setiap servis', 'Booking online 24/7'],
  Silver:   ['Semua benefit Bronze', 'Diskon 5% untuk setiap servis', 'Voucher bulanan eksklusif', 'Prioritas antrian'],
  Gold:     ['Semua benefit Silver', 'Diskon 10% untuk setiap servis', 'Prioritas booking jadwal', 'Early access promo spesial'],
  Platinum: ['Semua benefit Gold', 'Diskon 15% untuk setiap servis', 'Layanan antar-jemput kendaraan', 'Voucher eksklusif Platinum', 'Dedicated service advisor'],
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
  return Math.floor(Number(total) / 1000)
}

function generateMembershipId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'MBR-'
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

// ─── Achievement Engine ──────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { id: 'first_service',   label: 'First Service',   icon: '🔧', desc: 'Menyelesaikan servis pertama',          check: (c) => c.total_orders >= 1 },
  { id: 'loyal_5',         label: 'Loyal Customer',  icon: '⭐', desc: 'Sudah 5 kali servis di Esther Garage',  check: (c) => c.total_orders >= 5 },
  { id: 'loyal_10',        label: 'Elite Customer',  icon: '👑', desc: 'Sudah 10 kali servis di Esther Garage', check: (c) => c.total_orders >= 10 },
  { id: 'silver_member',   label: 'Silver Member',   icon: '🥈', desc: 'Mencapai tier Silver',                  check: (c) => ['Silver','Gold','Platinum'].includes(calcTier(c.points || 0)) },
  { id: 'gold_member',     label: 'Gold Member',     icon: '🥇', desc: 'Mencapai tier Gold',                    check: (c) => ['Gold','Platinum'].includes(calcTier(c.points || 0)) },
  { id: 'platinum_member', label: 'Platinum Member', icon: '💎', desc: 'Mencapai tier Platinum',                check: (c) => calcTier(c.points || 0) === 'Platinum' },
  { id: 'big_spender',     label: 'Big Spender',     icon: '💰', desc: 'Total pengeluaran di atas Rp 2.000.000', check: (c) => (c.total_spent || 0) >= 2000000 },
]

export function calcAchievements(customerData) {
  return ACHIEVEMENT_DEFS.map(def => ({ ...def, unlocked: def.check(customerData) }))
}

// ─── Session helpers ─────────────────────────────────────────
const LS_KEY_SESSION = 'eg_customer_session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(LS_KEY_SESSION)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ─── Provider ────────────────────────────────────────────────
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading]   = useState(true)

  // Restore session dari sessionStorage → fetch ulang dari Supabase
  useEffect(() => {
    const restore = async () => {
      const session = loadSession()
      if (session?.id) {
        try {
          const found = await customerAPI.fetchById(session.id)
          if (found) setCustomer(found)
        } catch {
          sessionStorage.removeItem(LS_KEY_SESSION)
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, phone, birthDate }) => {
    try {
      // Cek email duplikat
      const exists = await customerAPI.checkEmail(email)
      if (exists) return { success: false, message: 'Email sudah terdaftar.' }

      const today = new Date().toISOString().slice(0, 10)

      const newCustomer = await customerAPI.registerCustomer({
        name,
        email,
        password,
        phone:             phone || null,
        birth_date:        birthDate || null,
        membership_id:     generateMembershipId(),
        membership_status: 'active',
        member_since:      today,
        points:            50,
        total_orders:      0,
        total_spent:       0,
        review_count:      0,
        join_date:         today,
        is_active:         true,
      })

      if (!newCustomer) return { success: false, message: 'Gagal menyimpan data.' }

      // Bonus poin registrasi — opsional, tidak gagalkan register
      try {
        await pointAPI.addPoint({
          customer_id:  newCustomer.id,
          type:         'in',
          points:       50,
          description:  'Bonus Registrasi Member Baru',
          created_by:   'system',
        })
      } catch (e) { console.warn('point_history skip:', e.message) }

      // Voucher welcome — opsional, tidak gagalkan register
      try {
        await voucherAPI.create({
          customer_id:  newCustomer.id,
          code:         'WELCOME' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          title:        'Welcome Member — Diskon 15%',
          discount_pct: 15,
          status:       'active',
          type:         'member',
          valid_until:  new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          created_by:   'system',
        })
      } catch (e) { console.warn('vouchers skip:', e.message) }

      setCustomer(newCustomer)
      sessionStorage.setItem(LS_KEY_SESSION, JSON.stringify({ id: newCustomer.id }))
      return { success: true }
    } catch (err) {
      return { success: false, message: `Pendaftaran gagal: ${err.message}` }
    }
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const found = await customerAPI.loginCustomer(email, password)
      if (!found) return { success: false, message: 'Email atau password salah.' }
      setCustomer(found)
      sessionStorage.setItem(LS_KEY_SESSION, JSON.stringify({ id: found.id }))
      return { success: true }
    } catch (err) {
      return { success: false, message: `Terjadi kesalahan: ${err.message}` }
    }
  }, [])

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    setCustomer(null)
    sessionStorage.removeItem(LS_KEY_SESSION)
  }, [])

  // ── Update customer (refresh dari Supabase) ───────────────
  const refreshCustomer = useCallback(async () => {
    if (!customer?.id) return
    try {
      const updated = await customerAPI.fetchById(customer.id)
      if (updated) setCustomer(updated)
    } catch { /* silent */ }
  }, [customer])

  // ── Update profil customer ────────────────────────────────
  const updateCustomer = useCallback(async (data) => {
    if (!customer?.id) return { success: false }
    try {
      const updated = await customerAPI.update(customer.id, data)
      if (updated) setCustomer(updated)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
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
      refreshCustomer,
      // helpers
      getLoyaltyInfo:  () => customer ? calcLoyaltyProgress(customer.points || 0) : null,
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

// ── Helper publik untuk admin ─────────────────────────────────
export async function getAllCustomers() {
  return await customerAPI.fetchAll()
}

export async function getCustomerById(id) {
  return await customerAPI.fetchById(id)
}