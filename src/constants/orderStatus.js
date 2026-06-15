// ============================================================
// constants/orderStatus.js
//
// PHASE 1 FIX — Status "Antrian" tidak terbaca oleh admin
//
// Sebelumnya, 4 modul memakai vocabulary status berbeda untuk
// konsep "order/servis" yang sama:
//   - Orders.jsx        : Menunggu | Sedang Dikerjakan | Selesai
//   - BookingService.jsx: Antrian
//   - TrackingStatus.jsx: Menunggu Konfirmasi | Dikonfirmasi |
//                         Sedang Dikerjakan | Selesai
//   - Vehicles.jsx      : Menunggu | Servis | Selesai
//
// Akibatnya, order baru dari customer (status: 'Antrian') tidak match
// key STATUS apapun di Orders.jsx -> tersembunyi dari filter dropdown
// "Status = Menunggu" dan tidak terhitung di counter ringkasan.
//
// PENDEKATAN (additive, tidak menghapus data lama):
// File ini TIDAK mengubah nilai status yang sudah tersimpan di
// localStorage/JSON. Sebaliknya, ia menyediakan:
//   1. CANONICAL_STATUS      - 3 status kanonik untuk tampilan admin
//   2. normalizeOrderStatus  - mapping semua varian lama -> kanonik,
//                              dipakai di titik BACA (filter, counter,
//                              badge), bukan menulis ulang data.
//
// Field status asli ('Antrian', dll) tetap tersimpan apa adanya.
// Phase 2 akan memperkenalkan state machine penuh
// (PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED) yang akan
// menggantikan file ini secara bertahap.
// ============================================================

/**
 * 3 status kanonik yang dipakai untuk filter, counter, dan badge
 * di halaman Orders (admin). Ini adalah "tampilan ringkas" dari
 * status asli yang lebih granular.
 */
export const CANONICAL_STATUS = {
  MENUNGGU: 'Menunggu',
  SEDANG_DIKERJAKAN: 'Sedang Dikerjakan',
  SELESAI: 'Selesai',
}

export const CANONICAL_STATUS_LIST = [
  CANONICAL_STATUS.MENUNGGU,
  CANONICAL_STATUS.SEDANG_DIKERJAKAN,
  CANONICAL_STATUS.SELESAI,
]

/**
 * Mapping dari SEMUA varian status yang pernah ditulis oleh modul
 * manapun (Orders, BookingService, TrackingStatus, Vehicles) ke
 * salah satu CANONICAL_STATUS.
 *
 * Key dibuat lowercase + trim agar tahan terhadap variasi kapitalisasi
 * kecil (mis. "selesai" vs "Selesai").
 */
const STATUS_ALIAS_MAP = {
  // Orders.jsx (kanonik, identity mapping)
  'menunggu': CANONICAL_STATUS.MENUNGGU,
  'sedang dikerjakan': CANONICAL_STATUS.SEDANG_DIKERJAKAN,
  'selesai': CANONICAL_STATUS.SELESAI,

  // BookingService.jsx — order baru dari customer
  'antrian': CANONICAL_STATUS.MENUNGGU,

  // TrackingStatus.jsx vocabulary
  'menunggu konfirmasi': CANONICAL_STATUS.MENUNGGU,
  'dikonfirmasi': CANONICAL_STATUS.MENUNGGU,

  // Vehicles.jsx vocabulary
  'servis': CANONICAL_STATUS.SEDANG_DIKERJAKAN,
}

/**
 * Normalisasi status apapun (dari sumber manapun) menjadi salah satu
 * dari CANONICAL_STATUS. Dipakai untuk:
 *   - filter dropdown "Status" di Orders.jsx
 *   - counter ringkasan (counts.menunggu, counts.proses, counts.selesai)
 *   - StatusBadge fallback styling
 *
 * Tidak mengubah data tersimpan — hanya transformasi saat membaca/render.
 *
 * @param {string} rawStatus - status asli dari order (mis. 'Antrian')
 * @returns {string} salah satu dari CANONICAL_STATUS, default MENUNGGU
 */
export function normalizeOrderStatus(rawStatus) {
  if (!rawStatus) return CANONICAL_STATUS.MENUNGGU
  const key = String(rawStatus).trim().toLowerCase()
  return STATUS_ALIAS_MAP[key] || CANONICAL_STATUS.MENUNGGU
}

/**
 * Helper untuk filter array order berdasarkan status kanonik yang dipilih
 * di dropdown, sambil tetap mendukung order dengan status mentah yang
 * bervariasi (mis. 'Antrian', 'Dikonfirmasi', dll).
 *
 * @param {Array} orders - daftar order
 * @param {string} canonicalStatus - salah satu CANONICAL_STATUS, atau '' (semua)
 * @returns {Array} order yang ter-filter
 */
export function filterByCanonicalStatus(orders, canonicalStatus) {
  if (!canonicalStatus) return orders
  return orders.filter(o => normalizeOrderStatus(o.status) === canonicalStatus)
}