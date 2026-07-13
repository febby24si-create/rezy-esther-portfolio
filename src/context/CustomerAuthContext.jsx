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
import { calcTier, calcLoyaltyProgress, calcPointsFromOrder, calcAchievements, TIER_CONFIG, TIER_BENEFITS } from '../lib/loyaltyConstants'

const CustomerAuthContext = createContext(null)

function generateMembershipId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'MBR-'
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
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