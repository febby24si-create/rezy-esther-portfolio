// ============================================================
// lib/orderEvents.js
//
// PHASE 2 — Order Event System
//
// Order menjadi PUSAT business event. Semua side effect
// (Loyalty, Voucher, Inventory, Mechanic) yang sebelumnya
// dipanggil langsung dari UI component (mis. BookingService.jsx
// memanggil addPoints() langsung saat booking dibuat) sekarang
// menjadi SUBSCRIBER terhadap event yang di-dispatch dari sini.
//
// Event yang didukung:
//   ORDER_CREATED    - order baru dibuat (booking atau admin)
//   ORDER_CONFIRMED  - admin assign mekanik & konfirmasi
//   ORDER_STARTED    - pengerjaan dimulai
//   ORDER_COMPLETED  - order selesai, finalTotal terisi
//   ORDER_CANCELLED  - order dibatalkan
//   VOUCHER_REDEEMED - customer memilih voucher untuk dipakai di order
//   VOUCHER_APPLIED  - voucher benar-benar terpakai (saat ORDER_COMPLETED)
//   VOUCHER_GRANTED  - voucher baru diberikan (tier-up / achievement)
//
// PRINSIP PENTING (Rule 1-5 dari spesifikasi refactor):
//   - ORDER_CREATED tidak boleh memicu side effect ke Loyalty/
//     Voucher/Inventory/Mechanic. Hanya Order yang ditulis.
//   - Loyalty (poin, tier, achievement) HANYA diproses di
//     ORDER_COMPLETED, menggunakan finalTotal (bukan estimatedTotal).
//   - Voucher dianggap "used" HANYA saat ORDER_COMPLETED
//     (via VOUCHER_APPLIED), bukan saat dipilih (VOUCHER_REDEEMED).
//   - Inventory deduction HANYA terjadi di ORDER_COMPLETED.
//   - Mechanic status adalah derived state dari activeOrderIds,
//     diupdate melalui ORDER_CONFIRMED / ORDER_COMPLETED / ORDER_CANCELLED.
//
// Implementasi sengaja sederhana (synchronous pub-sub in-memory):
// cukup untuk arsitektur frontend-only saat ini, dan API-nya
// (emit/subscribe) akan tetap relevan ketika side effect ini
// dipindahkan ke backend (Phase 4) — hanya implementasi internal
// `emit` yang akan berubah dari "panggil subscriber langsung"
// menjadi "kirim ke message queue/API".
// ============================================================

export const ORDER_EVENTS = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_STARTED: 'ORDER_STARTED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  VOUCHER_REDEEMED: 'VOUCHER_REDEEMED',
  VOUCHER_APPLIED: 'VOUCHER_APPLIED',
  VOUCHER_GRANTED: 'VOUCHER_GRANTED',
}

// Registry subscriber per event type.
// Map<eventName, Set<handler>>
const subscribers = new Map()

/**
 * Daftarkan handler untuk sebuah event.
 * Mengembalikan fungsi unsubscribe.
 *
 * @param {string} eventName - salah satu dari ORDER_EVENTS
 * @param {(payload: object) => void} handler
 * @returns {() => void} unsubscribe function
 */
export function subscribe(eventName, handler) {
  if (!subscribers.has(eventName)) subscribers.set(eventName, new Set())
  subscribers.get(eventName).add(handler)
  return () => {
    subscribers.get(eventName)?.delete(handler)
  }
}

/**
 * Dispatch event ke semua subscriber yang terdaftar.
 * Berjalan synchronous, berurutan sesuai urutan subscribe.
 *
 * Jika satu subscriber throw, error di-log dan subscriber
 * lain tetap dijalankan (satu side effect gagal tidak boleh
 * menggagalkan side effect lain — mis. jika Inventory deduction
 * error, Loyalty tetap harus jalan).
 *
 * @param {string} eventName - salah satu dari ORDER_EVENTS
 * @param {object} payload - data event, minimal berisi { order }
 */
export function emit(eventName, payload) {
  const handlers = subscribers.get(eventName)
  if (!handlers || handlers.size === 0) return
  for (const handler of handlers) {
    try {
      handler(payload)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[orderEvents] subscriber error on ${eventName}:`, err)
    }
  }
}

/**
 * Helper untuk testing/debugging — hapus semua subscriber.
 * Tidak dipakai di runtime normal.
 */
export function _clearAllSubscribers() {
  subscribers.clear()
}