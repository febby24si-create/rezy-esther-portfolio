// ============================================================
// lib/customerMigration.js
//
// PHASE 3 — Customer Store Unification
//
// Menggabungkan dua source of truth customer yang sebelumnya
// terpisah:
//   - garage_customers (via useCustomerStore, basis: customersData.json
//                        50 record marketing/CRM seed)
//   - eg_customers     (via CustomerAuthContext, basis: portal
//                        register/login/booking, struktur loyalty-centric)
//
// menjadi SATU store baru: `customers` (sessionStorage key: 'customers').
//
// STRATEGI MATCHING (sesuai spesifikasi):
//   1. Match by phone (normalized: hapus spasi/dash, bandingkan digit)
//   2. Jika tidak match by phone, coba match by email
//   3. Jika hanya match by name (phone & email berbeda/kosong),
//      JANGAN auto-merge -- tandai sebagai duplicate candidate untuk
//      review manual admin.
//   4. Record yang hanya ada di satu sisi dibawa apa adanya.
//
// HASIL MERGE per record:
//   - Field marketing (dari garage_customers): adminNotes, device,
//     campaignJoined, memberStatus, dll -- dipertahankan apa adanya.
//   - Field loyalty (points, totalOrders, totalSpent, vouchers,
//     pointHistory, achievements-related data): eg_customers MENANG
//     jika ada match, karena merepresentasikan aktivitas live
//     (meski berasal dari estimasi booking pre-Phase-2). garage_customers
//     yang statis-seed dianggap stale dan dicatat di legacy field
//     untuk audit, tidak dipakai sebagai nilai aktif.
//   - lastOrderDate: TIDAK diambil dari kedua sumber lama (keduanya
//     statis/stale) -- akan di-recalculate dari `garage_orders` oleh
//     recalculateLastOrderDates() setelah merge.
//
// STORE LAMA (garage_customers, eg_customers) TETAP ADA SEBAGAI
// DEPRECATED -- tidak dihapus oleh fungsi ini. Lihat
// markLegacyStoresDeprecated().
//
// Migrasi bersifat ADDITIVE & IDEMPOTEN:
//   - Memanggil runCustomerMigration() berkali-kali aman -- jika
//     'customers' sudah ada di sessionStorage, fungsi akan
//     mengembalikan data existing tanpa menulis ulang, KECUALI
//     dipanggil dengan { force: true }.
// ============================================================

const LS_KEY_GARAGE_CUSTOMERS = 'garage_customers'
const LS_KEY_EG_CUSTOMERS = 'eg_customers'
const LS_KEY_UNIFIED = 'customers'
const LS_KEY_ORDERS = 'garage_orders'

import customersDataSeed from '../data/customersData.json'
import { calcTier } from './loyaltyConstants'

function loadJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

/**
 * Normalisasi nomor telepon untuk matching: hanya digit, hapus
 * leading zero/country code variance minimal (cukup untuk data
 * demo yang formatnya konsisten "0812-xxxx-xxxx").
 */
function normalizePhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}

function normalizeEmail(email) {
  if (!email) return ''
  return String(email).trim().toLowerCase()
}

/**
 * Baca garage_customers (merge dengan seed customersData.json,
 * mengikuti pola useCustomerStore.loadCustomers).
 */
function loadGarageCustomers() {
  const stored = loadJSON(LS_KEY_GARAGE_CUSTOMERS, null)
  if (!stored) return customersDataSeed
  const enriched = stored.map(s => {
    const fresh = customersDataSeed.find(c => c.id === s.id)
    return fresh ? { ...fresh, ...s } : s
  })
  const storedIds = new Set(stored.map(c => c.id))
  const newOnes = customersDataSeed.filter(c => !storedIds.has(c.id))
  return [...enriched, ...newOnes]
}

function loadEgCustomers() {
  return loadJSON(LS_KEY_EG_CUSTOMERS, [])
}

/**
 * Jalankan migrasi merge garage_customers + eg_customers -> customers.
 *
 * @param {{ force?: boolean }} options
 * @returns {{
 *   customers: Array,
 *   report: {
 *     totalGarage: number,
 *     totalEg: number,
 *     matchedByPhone: number,
 *     matchedByEmail: number,
 *     duplicateCandidates: Array<{ garageId, egId, name }>,
 *     onlyInGarage: number,
 *     onlyInEg: number,
 *   }
 * }}
 */
export function runCustomerMigration({ force = false } = {}) {
  if (!force) {
    const existing = loadJSON(LS_KEY_UNIFIED, null)
    if (existing) {
      return { customers: existing, report: null, skipped: true }
    }
  }

  const garageCustomers = loadGarageCustomers()
  const egCustomers = loadEgCustomers()

  const merged = []
  const usedEgIds = new Set()
  const duplicateCandidates = []
  let matchedByPhone = 0
  let matchedByEmail = 0

  for (const gc of garageCustomers) {
    const gcPhone = normalizePhone(gc.phone || gc.whatsapp)
    const gcEmail = normalizeEmail(gc.email)

    // 1. Match by phone
    let match = egCustomers.find(ec =>
      !usedEgIds.has(ec.id) && gcPhone && normalizePhone(ec.phone) === gcPhone
    )
    let matchType = match ? 'phone' : null

    // 2. Secondary match by email
    if (!match) {
      match = egCustomers.find(ec =>
        !usedEgIds.has(ec.id) && gcEmail && normalizeEmail(ec.email) === gcEmail
      )
      if (match) matchType = 'email'
    }

    // 3. Name-only match -> duplicate candidate, JANGAN auto-merge
    if (!match) {
      const nameMatch = egCustomers.find(ec =>
        !usedEgIds.has(ec.id) &&
        ec.name?.trim().toLowerCase() === gc.name?.trim().toLowerCase()
      )
      if (nameMatch) {
        duplicateCandidates.push({ garageId: gc.id, egId: nameMatch.id, name: gc.name })
      }
    }

    if (match) {
      usedEgIds.add(match.id)
      if (matchType === 'phone') matchedByPhone++
      else matchedByEmail++

      merged.push(mergeCustomerRecord(gc, match, matchType))
    } else {
      // Hanya ada di garage_customers -- bawa apa adanya, beri
      // loyaltyAccountId default agar struktur konsisten.
      merged.push({
        ...gc,
        id: 'CUST-' + gc.id, // namespace baru, lihat catatan ID di bawah
        legacyAdminId: gc.id,
        legacyPortalId: null,
        vehicleIds: [],
        vouchers: gc.vouchers || [],
        pointHistory: gc.pointHistory || [],
        achievements: [],
        sourceMatch: 'admin_only',
      })
    }
  }

  // Record eg_customers yang tidak ter-match sama sekali -> bawa
  // apa adanya sebagai customer baru (umumnya: customer yang register
  // via portal, belum pernah ada di seed admin).
  for (const ec of egCustomers) {
    if (usedEgIds.has(ec.id)) continue
    merged.push({
      id: 'CUST-' + ec.id,
      legacyAdminId: null,
      legacyPortalId: ec.id,
      name: ec.name,
      phone: ec.phone || '',
      email: ec.email || '',
      address: ec.address || '',
      vehicleIds: (ec.vehicles || []).map(v => v.id),
      vehicles: ec.vehicles || [], // dipertahankan sementara untuk Vehicle migration
      points: ec.points || 0,
      totalOrders: ec.totalOrders || 0,
      totalSpent: ec.totalSpent || 0,
      loyalty: 'Bronze', // recalculated di bawah
      vouchers: ec.vouchers || [],
      pointHistory: ec.pointHistory || [],
      reviewCount: ec.reviewCount || 0,
      reviews: ec.reviews || [],
      joinDate: ec.joinDate || '',
      birthDate: ec.birthDate || '',
      source: 'portal',
      sourceMatch: 'portal_only',
      createdAt: ec.joinDate || new Date().toISOString().slice(0, 10),
    })
  }

  let customers = merged.map(c => ({ ...c, loyalty: calcTier(c.points || 0) }))
  customers = recalculateLastOrderDates(customers)

  saveJSON(LS_KEY_UNIFIED, customers)
  markLegacyStoresDeprecated()

  const report = {
    totalGarage: garageCustomers.length,
    totalEg: egCustomers.length,
    matchedByPhone,
    matchedByEmail,
    duplicateCandidates,
    onlyInGarage: customers.filter(c => c.sourceMatch === 'admin_only').length,
    onlyInEg: customers.filter(c => c.sourceMatch === 'portal_only').length,
    merged: customers.filter(c => c.sourceMatch === 'merged').length,
  }

  return { customers, report, skipped: false }
}

/**
 * Gabungkan satu record garage_customers dengan satu record
 * eg_customers yang sudah dipastikan match (by phone/email).
 *
 * - id baru: 'CUST-' + id eg_customers (portal id, biasanya lebih
 *   "baru"/live). legacyAdminId & legacyPortalId disimpan untuk audit.
 * - Field marketing dari garage_customers dipertahankan.
 * - Field loyalty (points/totalOrders/totalSpent/vouchers/pointHistory)
 *   dari eg_customers MENANG (live data).
 * - vehicleIds di-extract dari eg_customers.vehicles (akan di-migrasi
 *   ke entitas Vehicle terpisah oleh vehicleMigration).
 */
function mergeCustomerRecord(garageRecord, egRecord, matchType) {
  return {
    ...garageRecord, // field marketing: adminNotes, device, campaignJoined, dll
    id: 'CUST-' + egRecord.id,
    legacyAdminId: garageRecord.id,
    legacyPortalId: egRecord.id,
    matchedBy: matchType,
    sourceMatch: 'merged',

    name: egRecord.name || garageRecord.name,
    phone: egRecord.phone || garageRecord.phone,
    email: egRecord.email || garageRecord.email,

    // ── Loyalty fields: eg_customers menang (live data) ──
    points: egRecord.points ?? garageRecord.points ?? 0,
    totalOrders: egRecord.totalOrders ?? garageRecord.totalOrders ?? 0,
    totalSpent: egRecord.totalSpent ?? garageRecord.totalSpent ?? 0,
    vouchers: egRecord.vouchers || [],
    pointHistory: egRecord.pointHistory || [],
    reviewCount: egRecord.reviewCount || 0,
    reviews: egRecord.reviews || [],

    // Catat nilai garage_customers lama sebagai referensi historis,
    // TIDAK dipakai aktif (sesuai strategi: "dicatat di log migrasi
    // sebagai referensi historis, tidak dipakai").
    legacyGaragePoints: garageRecord.points,
    legacyGarageTotalSpent: garageRecord.totalSpent,
    legacyGarageTotalOrders: garageRecord.totalOrders,

    vehicleIds: (egRecord.vehicles || []).map(v => v.id),
    vehicles: egRecord.vehicles || [], // sementara, untuk Vehicle migration

    loyalty: garageRecord.loyalty || 'Bronze', // recalculated di bawah
  }
}

/**
 * Tandai store lama sebagai deprecated dengan menulis flag metadata,
 * TANPA menghapus isinya. Modul yang belum migrasi tetap bisa
 * membaca garage_customers/eg_customers seperti biasa.
 */
function markLegacyStoresDeprecated() {
  try {
    sessionStorage.setItem('garage_customers__deprecated', JSON.stringify({
      deprecatedAt: new Date().toISOString(),
      replacedBy: LS_KEY_UNIFIED,
      note: 'Gunakan hooks/useCustomerStore.js (sudah diarahkan ke `customers`). Jangan menulis ke garage_customers secara langsung.',
    }))
    sessionStorage.setItem('eg_customers__deprecated', JSON.stringify({
      deprecatedAt: new Date().toISOString(),
      replacedBy: LS_KEY_UNIFIED,
      note: 'Gunakan lib/loyaltyEngine.js / lib/customerMigration.js. Jangan menulis ke eg_customers secara langsung untuk customer baru.',
    }))
  } catch { /* ignore */ }
}

/**
 * Hitung ulang lastOrderDate setiap customer dari garage_orders
 * (bukan dari store lama yang statis), berdasarkan order yang
 * sudah COMPLETED dan customerId-nya match.
 *
 * Dipanggil setelah migrasi awal, dan idealnya setiap kali ada
 * ORDER_COMPLETED baru (lihat lib/orderSubscribers.js Phase 3
 * extension).
 */
export function recalculateLastOrderDates(customers) {
  const orders = loadJSON(LS_KEY_ORDERS, [])
  return customers.map(c => {
    // customerId di order mengacu pada id LAMA (garage/portal),
    // bukan id baru 'CUST-xxx'. Cek kedua kemungkinan legacy id.
    const candidateIds = [c.legacyAdminId, c.legacyPortalId, c.id].filter(Boolean)
    const customerOrders = orders.filter(o =>
      candidateIds.includes(o.customerId) &&
      o.completedAt
    )
    if (customerOrders.length === 0) return c
    const latest = customerOrders.reduce((a, b) =>
      (a.completedAt > b.completedAt ? a : b)
    )
    return { ...c, lastOrderDate: latest.completedAt.slice(0, 10) }
  })
}

/**
 * Helper baca customers (unified). Dipakai oleh useCustomerStore
 * setelah refactor Phase 3.
 */
export function loadUnifiedCustomers() {
  const { customers } = runCustomerMigration()
  return customers
}

export function saveUnifiedCustomers(list) {
  saveJSON(LS_KEY_UNIFIED, list)
}

/**
 * PHASE 3 — Dual-write sync (strangler pattern, langkah 3 dari
 * strategi migrasi).
 *
 * loyaltyEngine.applyOrderCompletedLoyalty / markVoucherAsUsed
 * menulis ke eg_customers (karena CustomerAuthContext/portal
 * login masih bergantung pada store ini untuk autentikasi).
 *
 * Setelah menulis ke eg_customers, panggil fungsi ini agar
 * `customers` (unified, dibaca CRM/Customers/Orders via
 * useCustomerStore) ikut terupdate dengan field loyalty yang sama
 * -- mencegah `customers` menjadi snapshot stale begitu loyalty
 * engine berjalan pasca-migrasi.
 *
 * Matching: cari customer di `customers` dengan
 * `legacyPortalId === egCustomerId`. Jika tidak ditemukan (mis.
 * migrasi belum pernah jalan / customer baru register setelah
 * migrasi), no-op secara aman -- akan tersinkron pada migrasi
 * berikutnya atau saat customer tersebut pertama kali muncul di
 * order yang COMPLETED (re-resolve by phone/email tidak dilakukan
 * di sini untuk menghindari side effect tak terduga; cukup
 * best-effort).
 *
 * @param {string} egCustomerId - id di eg_customers (format lama, 'C-xxx')
 * @param {object} egCustomerRecord - record eg_customers terbaru setelah update
 */
export function syncLoyaltyToUnifiedStore(egCustomerId, egCustomerRecord) {
  const customers = loadJSON(LS_KEY_UNIFIED, null)
  if (!customers) return // belum pernah migrasi, tidak ada yang perlu disync

  const idx = customers.findIndex(c => c.legacyPortalId === egCustomerId)
  if (idx === -1) return // best-effort, lihat catatan di atas

  customers[idx] = {
    ...customers[idx],
    points: egCustomerRecord.points,
    totalOrders: egCustomerRecord.totalOrders,
    totalSpent: egCustomerRecord.totalSpent,
    vouchers: egCustomerRecord.vouchers,
    pointHistory: egCustomerRecord.pointHistory,
    loyalty: calcTier(egCustomerRecord.points || 0),
    lastOrderDate: egCustomerRecord.lastOrderDate || customers[idx].lastOrderDate,
  }
  saveJSON(LS_KEY_UNIFIED, customers)
}