// ============================================================
// lib/loyaltyEngine.js
//
// Loyalty sebagai subscriber ORDER_COMPLETED (Supabase-backed)
//
// MIGRASI: file ini sebelumnya baca/tulis sessionStorage
// ('eg_customers'), lengkap dengan resolver format ID ganda
// ('C-xxx' lama vs 'CUST-xxx' unified) — peninggalan dari masa
// sebelum semua customer disatukan ke satu tabel Supabase.
//
// Sekarang seluruh order (baik dari Orders.jsx admin maupun dari
// workflowEngine.js/OrderDetail.jsx) sudah konsisten memakai
// `order.customerId` yang merujuk LANGSUNG ke `customers.id` di
// Supabase — jadi tidak perlu lagi resolver format ganda. File ini
// disederhanakan jadi operasi langsung ke customerAPI/pointAPI/voucherAPI.
//
// CATATAN: untuk order yang selesai lewat OrderDetail.jsx
// (workflowEngine.completeOrder), poin dasar SUDAH diberikan
// langsung di sana (lihat lib/workflowEngine.js). Fungsi
// applyOrderCompletedLoyalty di sini tetap dipertahankan sebagai
// SATU-SATUNYA jalur yang menangani tier-up voucher & voucher
// after-service (belum ada di workflowEngine.js), dan tetap jadi
// jalur utama untuk order yang selesai lewat Orders.jsx (yang
// memberi poin dasarnya sendiri, terpisah dari subscriber ini).
// ============================================================

import { calcTier, calcPointsFromOrder } from './loyaltyConstants'
import { customerAPI } from '../services/customerAPI'
import { pointAPI } from '../services/pointAPI'
import { voucherAPI } from '../services/voucherAPI'

/**
 * Tambahkan poin loyalty + cek tier-up + beri voucher after-service,
 * berdasarkan finalTotal sebuah order yang COMPLETED — langsung ke
 * Supabase (customers, point_history, vouchers).
 *
 * @param {string} customerId - customers.id (Supabase)
 * @param {number} finalTotal - order.finalTotal (BUKAN estimatedTotal)
 * @param {string} orderId
 * @param {string} serviceLabel
 * @returns {Promise<{ success: boolean, message?: string, pointsEarned?: number, tierUp?: { from: string, to: string } }>}
 */
export async function applyOrderCompletedLoyalty(customerId, finalTotal, orderId, serviceLabel) {
  if (!customerId) {
    return { success: false, message: 'customerId kosong — tidak bisa memberikan poin.' }
  }

  const earned = calcPointsFromOrder(finalTotal)
  if (earned <= 0) {
    return { success: false, message: 'finalTotal terlalu kecil, tidak ada poin yang diberikan.' }
  }

  let customer
  try {
    customer = await customerAPI.fetchById(customerId)
  } catch (err) {
    return { success: false, message: `Gagal mengambil data customer: ${err.message}` }
  }
  if (!customer) {
    return { success: false, message: `Customer ${customerId} tidak ditemukan di Supabase — loyalty dilewati.` }
  }

  const oldTier   = calcTier(customer.points || 0)
  const newPoints = (customer.points || 0) + earned
  const newTier   = calcTier(newPoints)

  try {
    await customerAPI.update(customerId, {
      points:            newPoints,
      total_orders:      (customer.total_orders || 0) + 1,
      total_spent:       (customer.total_spent || 0) + Number(finalTotal),
      membership_status: 'active',
      member_since:      customer.member_since || new Date().toISOString().slice(0, 10),
    })

    await pointAPI.addPoint({
      customer_id: customerId,
      type:        'in',
      points:      earned,
      description: `${serviceLabel} — ${orderId}`,
      order_id:    orderId,
      created_by:  'system',
    })
  } catch (err) {
    return { success: false, message: `Gagal update poin: ${err.message}` }
  }

  let tierUp = null
  try {
    if (oldTier !== newTier) {
      tierUp = { from: oldTier, to: newTier }
      await voucherAPI.create({
        customer_id:  customerId,
        code:         newTier.toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        title:        `Selamat! Naik ke ${newTier} Member`,
        discount_pct: newTier === 'Silver' ? 10 : newTier === 'Gold' ? 15 : 20,
        status:       'active',
        type:         'loyalty',
        valid_until:  new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
        created_by:   'system',
      })
    }

    // Voucher setelah service (sekali per order COMPLETED)
    await voucherAPI.create({
      customer_id:  customerId,
      code:         'AFTER-' + String(orderId).replace('#', '').slice(-6),
      title:        'Voucher Setelah Service — Diskon 10%',
      discount_pct: 10,
      status:       'active',
      type:         'aftersvc',
      valid_until:  new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      created_by:   'system',
    })
  } catch (err) {
    // Poin sudah tersimpan — voucher gagal dibuat bukan alasan untuk
    // melaporkan keseluruhan operasi sebagai gagal ke caller.
    console.error('[loyaltyEngine] Poin tersimpan, tapi gagal membuat voucher:', err)
  }

  return { success: true, pointsEarned: earned, tierUp }
}

/**
 * RULE 3 — Voucher dianggap "used" hanya saat ORDER_COMPLETED.
 *
 * @param {string} customerId - tidak lagi dipakai untuk lookup (voucher
 *   di Supabase dicari langsung by id), tapi dipertahankan di signature
 *   untuk kompatibilitas caller & sebagai sanity-check kepemilikan.
 * @param {string} voucherId
 * @param {string} orderId
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function markVoucherAsUsed(customerId, voucherId, orderId) {
  if (!customerId || !voucherId) return { success: false, message: 'customerId/voucherId kosong.' }

  let voucher
  try {
    voucher = await voucherAPI.fetchById(voucherId)
  } catch (err) {
    return { success: false, message: `Gagal mengambil voucher: ${err.message}` }
  }
  if (!voucher) return { success: false, message: `Voucher ${voucherId} tidak ditemukan.` }
  if (voucher.customer_id !== customerId) {
    return { success: false, message: `Voucher ${voucherId} bukan milik customer ${customerId}.` }
  }
  if (voucher.status === 'used') {
    return { success: false, message: `Voucher ${voucherId} sudah pernah dipakai.` }
  }

  try {
    await voucherAPI.update(voucherId, {
      status:        'used',
      used_at:       new Date().toISOString(),
      used_on_order: orderId,
    })
  } catch (err) {
    return { success: false, message: `Gagal update voucher: ${err.message}` }
  }

  return { success: true }
}

/**
 * Baca data loyalty customer terkini langsung dari Supabase.
 * @param {string} customerId
 * @returns {Promise<object|null>}
 */
export async function getLoyaltyDataById(customerId) {
  return await customerAPI.fetchById(customerId)
}