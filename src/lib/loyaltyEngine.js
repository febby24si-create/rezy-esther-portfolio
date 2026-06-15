// ============================================================
// lib/loyaltyEngine.js
//
// PHASE 2 — Loyalty sebagai subscriber terhadap ORDER_COMPLETED
//
// Sebelumnya, seluruh logic poin/tier/voucher (addPoints) hanya
// ada sebagai method di CustomerAuthContext, yang HANYA bisa
// dipanggil ketika customer sedang login di portal (state
// `customer` ada). Ini cocok untuk dipanggil dari BookingService
// (customer login), TAPI tidak bisa dipanggil dari Orders.jsx
// (admin) saat admin mengubah status order menjadi 'Selesai' —
// admin tidak punya akses ke session customer tersebut.
//
// Fix: ekstrak logic addPoints/tier-voucher/after-service-voucher
// menjadi fungsi PURE (non-hook) yang operate langsung pada
// localStorage('eg_customers') by customerId. Fungsi ini bisa
// dipanggil dari:
//   - subscriber ORDER_COMPLETED yang didaftarkan di Orders.jsx
//     (admin mengubah status order)
//   - CustomerAuthContext (tetap didukung untuk backward-compat,
//     tapi sekarang context juga hanya jadi caller dari fungsi
//     di sini)
//
// RULE 2 — Loyalty hanya diproses saat IN_PROGRESS -> COMPLETED,
// dan WAJIB menggunakan finalTotal, BUKAN estimatedTotal.
// Fungsi di sini menerima `total` sebagai parameter eksplisit —
// caller (subscriber ORDER_COMPLETED) bertanggung jawab memastikan
// nilai yang dikirim adalah order.finalTotal.
// ============================================================

import { calcTier, calcPointsFromOrder } from './loyaltyConstants'
import { syncLoyaltyToUnifiedStore, loadUnifiedCustomers } from './customerMigration'

const LS_KEY_CUSTOMERS = 'eg_customers'

function loadCustomers() {
  try {
    const raw = localStorage.getItem(LS_KEY_CUSTOMERS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCustomers(list) {
  try {
    localStorage.setItem(LS_KEY_CUSTOMERS, JSON.stringify(list))
  } catch { /* ignore */ }
}

/**
 * PHASE 3 — Resolusi format customerId.
 *
 * Sejak unifikasi customer store, order.customerId bisa berisi
 * salah satu dari DUA format:
 *   1. Format LAMA ('C-001', 'C-{timestamp}') -- ditulis oleh
 *      BookingService.jsx via `customerId: customer.id` (id dari
 *      eg_customers, tidak diubah pada Phase 2/3).
 *   2. Format BARU ('CUST-xxx') -- di-resolve oleh Orders.jsx admin
 *      (handleSubmit, Phase 2) via lookup ke `customers` (unified,
 *      hasil getAllCustomersFromStore()).
 *
 * eg_customers (yang menjadi sumber kebenaran untuk loyalty engine,
 * karena CustomerAuthContext/portal login masih bergantung padanya)
 * HANYA mengenal format LAMA. Fungsi ini menerjemahkan format BARU
 * ('CUST-xxx') -> legacyPortalId sebelum lookup.
 *
 * @param {string} customerId
 * @returns {string} id yang valid untuk lookup di eg_customers,
 *                    atau customerId asli jika bukan format CUST-xxx
 *                    / tidak ditemukan (akan gagal di findCustomer
 *                    dengan pesan yang jelas, bukan silent error).
 */
function resolveToLegacyPortalId(customerId) {
  if (!customerId || !customerId.startsWith('CUST-')) return customerId

  const unified = loadUnifiedCustomers()
  const match = unified.find(c => c.id === customerId)
  if (match?.legacyPortalId) return match.legacyPortalId

  // Customer ini hanya ada di sisi admin (sourceMatch: 'admin_only'),
  // tidak punya akun loyalty di eg_customers. Kembalikan customerId
  // asli -- findCustomer akan return idx === -1, dan caller
  // (applyOrderCompletedLoyalty) akan skip loyalty dengan pesan yang
  // jelas, bukan error.
  return customerId
}

/**
 * Cari customer di eg_customers berdasarkan customerId.
 * Mengembalikan { customers, idx } — idx = -1 jika tidak ditemukan.
 */
function findCustomer(customerId) {
  const resolvedId = resolveToLegacyPortalId(customerId)
  const customers = loadCustomers()
  const idx = customers.findIndex(c => c.id === resolvedId)
  return { customers, idx, resolvedId }
}

/**
 * Tambahkan poin loyalty + cek tier-up + cek voucher after-service,
 * berdasarkan finalTotal sebuah order yang COMPLETED.
 *
 * Ini adalah versi non-hook dari CustomerAuthContext.addPoints,
 * dipanggil dari subscriber ORDER_COMPLETED.
 *
 * @param {string} customerId - id customer di eg_customers
 * @param {number} finalTotal - order.finalTotal (BUKAN estimatedTotal)
 * @param {string} orderId
 * @param {string} serviceLabel
 * @returns {{ success: boolean, message?: string, pointsEarned?: number, tierUp?: { from: string, to: string } }}
 */
export function applyOrderCompletedLoyalty(customerId, finalTotal, orderId, serviceLabel) {
  if (!customerId) {
    return { success: false, message: 'customerId kosong — tidak bisa memberikan poin.' }
  }

  const earned = calcPointsFromOrder(finalTotal)
  if (earned <= 0) {
    return { success: false, message: 'finalTotal terlalu kecil, tidak ada poin yang diberikan.' }
  }

  const { customers, idx, resolvedId } = findCustomer(customerId)
  if (idx === -1) {
    // Customer order ini tidak terdaftar di eg_customers (mis. order
    // dibuat langsung oleh admin untuk walk-in customer yang belum
    // pernah register di portal). Tidak error keras — cukup skip
    // loyalty, karena memang tidak ada akun loyalty untuk customer ini.
    return { success: false, message: `Customer ${customerId} tidak ditemukan di eg_customers — loyalty dilewati.` }
  }

  const current = customers[idx]
  const oldTier = calcTier(current.points || 0)
  const newPoints = (current.points || 0) + earned
  const newTier = calcTier(newPoints)

  const updated = {
    ...current,
    points: newPoints,
    totalOrders: (current.totalOrders || 0) + 1,
    totalSpent: (current.totalSpent || 0) + Number(finalTotal),
    lastOrderDate: new Date().toISOString().slice(0, 10),
    pointHistory: [
      {
        id: 'LP-' + Date.now(),
        type: 'in',
        desc: `${serviceLabel} — ${orderId}`,
        points: earned,
        date: new Date().toISOString().slice(0, 10),
      },
      ...(current.pointHistory || []),
    ],
  }

  let tierUp = null
  if (oldTier !== newTier) {
    tierUp = { from: oldTier, to: newTier }
    updated.vouchers = [
      {
        id: 'VC-TIER-' + Date.now(),
        code: newTier.toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        title: `Selamat! Naik ke ${newTier} Member`,
        diskon: newTier === 'Silver' ? 10 : newTier === 'Gold' ? 15 : 20,
        status: 'active',
        validUntil: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
        type: 'loyalty',
        customerId,
        sourceOrderId: orderId,
      },
      ...(updated.vouchers || current.vouchers || []),
    ]
  } else {
    updated.vouchers = current.vouchers || []
  }

  // Voucher setelah service (sekali per order COMPLETED)
  updated.vouchers = [
    {
      id: 'VC-AFTER-' + Date.now(),
      code: 'AFTER-' + String(orderId).replace('#', '').slice(-6),
      title: 'Voucher Setelah Service — Diskon 10%',
      diskon: 10,
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      type: 'aftersvc',
      customerId,
      sourceOrderId: orderId,
    },
    ...updated.vouchers,
  ]

  customers[idx] = updated
  saveCustomers(customers)

  // PHASE 3 — dual-write: sinkronkan field loyalty ke `customers`
  // (unified store) agar CRM/Customers/Orders tidak membaca data
  // stale. Gunakan resolvedId (format eg_customers lama) sebagai
  // key matching legacyPortalId di syncLoyaltyToUnifiedStore.
  // Lihat customerMigration.syncLoyaltyToUnifiedStore.
  syncLoyaltyToUnifiedStore(resolvedId, updated)

  return { success: true, pointsEarned: earned, tierUp }
}

/**
 * RULE 3 — Voucher dianggap "used" hanya saat ORDER_COMPLETED.
 *
 * Jika order.voucherId terisi (customer memilih voucher saat
 * booking/PENDING via VOUCHER_REDEEMED), maka saat ORDER_COMPLETED
 * voucher tersebut ditandai status: 'used', usedAt, usedInOrderId.
 *
 * Jika order dibatalkan sebelum COMPLETED, fungsi ini tidak pernah
 * dipanggil — voucher tetap 'active' dan bisa dipakai lagi
 * (sesuai desain: voucher hanya "terpakai" saat transaksi benar-benar
 * selesai).
 *
 * @param {string} customerId
 * @param {string} voucherId
 * @param {string} orderId
 * @returns {{ success: boolean, message?: string }}
 */
export function markVoucherAsUsed(customerId, voucherId, orderId) {
  if (!customerId || !voucherId) return { success: false, message: 'customerId/voucherId kosong.' }

  const { customers, idx, resolvedId } = findCustomer(customerId)
  if (idx === -1) return { success: false, message: `Customer ${customerId} tidak ditemukan.` }

  const current = customers[idx]
  const vouchers = current.vouchers || []
  const vIdx = vouchers.findIndex(v => v.id === voucherId)
  if (vIdx === -1) return { success: false, message: `Voucher ${voucherId} tidak ditemukan.` }

  if (vouchers[vIdx].status === 'used') {
    return { success: false, message: `Voucher ${voucherId} sudah pernah dipakai.` }
  }

  const updatedVouchers = vouchers.map((v, i) =>
    i === vIdx
      ? { ...v, status: 'used', usedAt: new Date().toISOString().slice(0, 10), usedInOrderId: orderId }
      : v
  )

  customers[idx] = { ...current, vouchers: updatedVouchers }
  saveCustomers(customers)

  // PHASE 3 — dual-write: sinkronkan vouchers ke `customers` (unified)
  syncLoyaltyToUnifiedStore(resolvedId, customers[idx])

  return { success: true }
}

/**
 * Baca data customer dari eg_customers by id (helper untuk Reports/CRM
 * jika butuh data loyalty terkini tanpa harus login sebagai customer
 * tersebut). Read-only.
 *
 * @param {string} customerId
 * @returns {object|null}
 */
export function getLoyaltyDataById(customerId) {
  const { customers, idx } = findCustomer(customerId)
  return idx === -1 ? null : customers[idx]
}