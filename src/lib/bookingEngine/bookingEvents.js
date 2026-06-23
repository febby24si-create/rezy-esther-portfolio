// ============================================================
// lib/bookingEngine/bookingEvents.js
//
// Event system khusus BOOKING MODULE.
//
// SENGAJA DIPISAHKAN dari lib/orderEvents.js karena:
//   1. Booking dan Order adalah dua entitas berbeda dengan
//      lifecycle yang independen.
//   2. Subscriber Booking TIDAK BOLEH menyentuh Order —
//      satu-satunya titik koneksi adalah CHECK_IN_COMPLETED
//      yang ada di bookingService.js yang kemudian memanggil
//      emit dari orderEvents.js (ORDER_CREATED).
//   3. Memudahkan isolasi ketika backend tersedia: Booking
//      events bisa di-route ke message queue terpisah dari
//      Order events.
//
// BOOKING EVENTS yang didukung:
//   BOOKING_CREATED       - customer submit booking baru
//   BOOKING_CONFIRMED     - admin konfirmasi booking
//   BOOKING_REJECTED      - admin tolak booking
//   BOOKING_RESCHEDULED   - admin jadwalkan ulang
//   BOOKING_CANCELLED     - customer batalkan booking
//   BOOKING_NO_SHOW       - customer tidak datang hari H
//   BOOKING_EXPIRED       - booking hangus otomatis (24 jam)
//   BOOKING_CHECK_IN      - customer datang & check-in selesai
//                           → setelah ini, Order dibuat via orderEvents
//
// SIDE EFFECT yang diizinkan per event:
//   BOOKING_CREATED     → adminNotifications (notif ada booking baru)
//   BOOKING_CONFIRMED   → calendarModule (masuk kalender bengkel)
//                         customerNotifications (notif ke customer)
//   BOOKING_REJECTED    → customerNotifications
//   BOOKING_RESCHEDULED → customerNotifications, calendarModule (update)
//   BOOKING_CANCELLED   → calendarModule (hapus slot)
//   BOOKING_NO_SHOW     → adminNotifications (alert no show)
//   BOOKING_CHECK_IN    → calendarModule (update status),
//                         lalu bookingService memanggil ORDER_CREATED
//
// PRINSIP (identik dengan orderEvents.js):
//   - Synchronous pub-sub in-memory
//   - Satu subscriber gagal tidak menggagalkan yang lain
//   - API emit/subscribe identik → mudah diganti message queue
// ============================================================

export const BOOKING_EVENTS = {
  BOOKING_CREATED:     'BOOKING_CREATED',
  BOOKING_CONFIRMED:   'BOOKING_CONFIRMED',
  BOOKING_REJECTED:    'BOOKING_REJECTED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
  BOOKING_CANCELLED:   'BOOKING_CANCELLED',
  BOOKING_NO_SHOW:     'BOOKING_NO_SHOW',
  BOOKING_EXPIRED:     'BOOKING_EXPIRED',
  BOOKING_CHECK_IN:    'BOOKING_CHECK_IN',
}

// Registry: Map<eventName, Set<handler>>
const subscribers = new Map()

/**
 * Daftarkan handler untuk sebuah booking event.
 * Mengembalikan fungsi unsubscribe — identik dengan orderEvents.
 *
 * @param {string} eventName - salah satu dari BOOKING_EVENTS
 * @param {(payload: object) => void} handler
 * @returns {() => void} unsubscribe function
 */
export function subscribeBooking(eventName, handler) {
  if (!subscribers.has(eventName)) subscribers.set(eventName, new Set())
  subscribers.get(eventName).add(handler)
  return () => {
    subscribers.get(eventName)?.delete(handler)
  }
}

/**
 * Dispatch booking event ke semua subscriber yang terdaftar.
 * Error di satu subscriber tidak menghentikan subscriber lain.
 *
 * @param {string} eventName - salah satu dari BOOKING_EVENTS
 * @param {object} payload   - minimal berisi { booking }
 */
export function emitBooking(eventName, payload) {
  const handlers = subscribers.get(eventName)
  if (!handlers || handlers.size === 0) return
  for (const handler of handlers) {
    try {
      handler(payload)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[bookingEvents] subscriber error on ${eventName}:`, err)
    }
  }
}

/**
 * Reset semua subscriber — untuk testing saja, tidak dipakai runtime.
 */
export function _clearAllBookingSubscribers() {
  subscribers.clear()
}
