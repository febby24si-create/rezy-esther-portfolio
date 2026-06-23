// ============================================================
// lib/bookingEngine/bookingService.js
//
// BUSINESS LOGIC LAYER — Booking Module
//
// Semua operasi bisnis Booking ada di sini. UI component
// memanggil fungsi dari file ini; TIDAK boleh menulis langsung
// ke storage atau emit event secara langsung dari UI.
//
// PRINSIP PEMISAHAN:
//   bookingStorage.js  → tahu cara simpan/baca data
//   bookingValidation.js → tahu rule validasi
//   bookingEvents.js   → tahu cara broadcast event
//   bookingService.js  → mengorkestrasikan ketiganya
//
// ATURAN KRITIS:
//   1. confirmBooking() TIDAK membuat Order.
//      Order dibuat di checkIn() → yang memanggil orderEvents.ORDER_CREATED.
//      Ini sesuai arahan: "Order dibuat hanya saat Check In".
//
//   2. Booking events TIDAK menyentuh Order module sama sekali.
//      Satu-satunya titik koneksi adalah checkIn() yang memanggil
//      emit(ORDER_EVENTS.ORDER_CREATED, ...) — dan itu di Sprint 3.
//
//   3. Poin Loyalty TIDAK diberikan di sini.
//      Loyalty mengikuti ORDER_COMPLETED (via orderSubscribers.js).
//
//   4. Setiap operasi memanggil: validate → storage → event → return.
//      Urutan ini konsisten di semua fungsi.
//
// RETURN TYPE (konsisten):
//   { success: boolean, booking: object|null, error: string|null }
//
// BACKEND INTEGRATION:
//   Ganti implementasi setiap fungsi dengan API call.
//   Signature dan return type tidak perlu berubah.
// ============================================================

import { BOOKING_STATUS, isValidBookingTransition } from '../../constants/statusConstants'
import {
  createBooking as storageCreate,
  updateBooking,
  getBookingById,
  getAllBookings,
} from './bookingStorage'
import { emitBooking, BOOKING_EVENTS } from './bookingEvents'
import {
  validateNewBooking,
  validateReschedule,
} from './bookingValidation'

// ─── HELPERS ─────────────────────────────────────────────────
function now() { return new Date().toISOString() }

function guardTransition(booking, targetStatus) {
  if (!booking) return 'Booking tidak ditemukan.'
  if (!isValidBookingTransition(booking.status, targetStatus)) {
    return `Tidak bisa mengubah status dari "${booking.status}" ke "${targetStatus}".`
  }
  return null
}

// ─── CREATE ──────────────────────────────────────────────────

/**
 * Buat booking baru dari form customer.
 * Status awal selalu WAITING_CONFIRMATION.
 * TIDAK memberikan poin, TIDAK membuat order.
 *
 * Dipanggil oleh: BookingService.jsx (customer portal)
 *
 * @param {object} formData - data dari BookingService form wizard
 * @returns {{ success, booking, error }}
 */
export function submitBooking(formData) {
  // 1. Validasi business rules
  const validation = validateNewBooking({
    date:         formData.date,
    time:         formData.time,
    customerId:   formData.customerId,
    vehiclePlate: formData.vehiclePlate,
  })
  if (!validation.valid) {
    return { success: false, booking: null, error: validation.error }
  }

  // 2. Simpan ke storage
  const result = storageCreate({
    ...formData,
    source: 'online',
  })
  if (!result.success) return result

  // 3. Emit event → subscribers (adminNotifications akan ditambah Sprint 2)
  emitBooking(BOOKING_EVENTS.BOOKING_CREATED, { booking: result.booking })

  return result
}

// ─── ADMIN ACTIONS ───────────────────────────────────────────

/**
 * Admin konfirmasi booking.
 *
 * EFEK:
 *   - Status: WAITING_CONFIRMATION → CONFIRMED
 *   - Set confirmedAt, confirmedBy
 *   - Emit BOOKING_CONFIRMED
 *     → Sprint 2: subscriber akan push ke garage_calendar
 *     → Sprint 2: subscriber akan kirim customerNotification
 *
 * TIDAK ADA:
 *   - Pembuatan Order (Order dibuat saat Check In, bukan di sini)
 *   - Pemberian Poin Loyalty
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} options.confirmedBy  - nama/id admin
 * @param {string} [options.mechanicId] - opsional, assign mekanik sekarang
 * @param {string} [options.mechanicName]
 * @returns {{ success, booking, error }}
 */
export function confirmBooking(bookingId, { confirmedBy, mechanicId = null, mechanicName = null } = {}) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.CONFIRMED)
  if (transErr) return { success: false, booking: null, error: transErr }

  const result = updateBooking(bookingId, {
    status:        BOOKING_STATUS.CONFIRMED,
    confirmedAt:   now(),
    confirmedBy:   confirmedBy ?? 'Admin',
    mechanicId:    mechanicId ?? booking.mechanicId,
    mechanicName:  mechanicName ?? booking.mechanicName,
  })
  if (!result.success) return result

  emitBooking(BOOKING_EVENTS.BOOKING_CONFIRMED, { booking: result.booking })
  return result
}

/**
 * Admin tolak booking.
 *
 * EFEK:
 *   - Status: WAITING_CONFIRMATION → REJECTED
 *   - Set rejectedAt, rejectedReason
 *   - Emit BOOKING_REJECTED
 *     → Sprint 2: customerNotification
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} options.rejectedReason - wajib diisi (akan ditampilkan ke customer)
 * @param {string} [options.rejectedBy]
 * @returns {{ success, booking, error }}
 */
export function rejectBooking(bookingId, { rejectedReason, rejectedBy = 'Admin' } = {}) {
  if (!rejectedReason?.trim()) {
    return { success: false, booking: null, error: 'Alasan penolakan wajib diisi.' }
  }

  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.REJECTED)
  if (transErr) return { success: false, booking: null, error: transErr }

  const result = updateBooking(bookingId, {
    status:         BOOKING_STATUS.REJECTED,
    rejectedAt:     now(),
    rejectedReason: rejectedReason.trim(),
    rejectedBy,
  })
  if (!result.success) return result

  emitBooking(BOOKING_EVENTS.BOOKING_REJECTED, { booking: result.booking })
  return result
}

/**
 * Admin jadwalkan ulang booking.
 *
 * EFEK:
 *   - Simpan tanggal/jam lama ke rescheduledFrom / rescheduledTime
 *   - Update date dan time ke jadwal baru
 *   - Status: CONFIRMED | WAITING_CONFIRMATION → RESCHEDULED
 *   - Emit BOOKING_RESCHEDULED
 *     → Sprint 2: customerNotification, calendarModule update
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} options.newDate     - 'YYYY-MM-DD'
 * @param {string} options.newTime     - 'HH:MM'
 * @param {string} [options.reason]    - alasan reschedule (untuk customer)
 * @param {string} [options.rescheduledBy]
 * @returns {{ success, booking, error }}
 */
export function rescheduleBooking(bookingId, { newDate, newTime, reason = '', rescheduledBy = 'Admin' } = {}) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.RESCHEDULED)
  if (transErr) return { success: false, booking: null, error: transErr }

  // Validasi jadwal baru
  const validation = validateReschedule({ date: newDate, time: newTime, bookingId })
  if (!validation.valid) {
    return { success: false, booking: null, error: validation.error }
  }

  const result = updateBooking(bookingId, {
    status:           BOOKING_STATUS.RESCHEDULED,
    rescheduledAt:    now(),
    rescheduledFrom:  booking.date,
    rescheduledTime:  booking.time,
    rescheduledBy,
    rescheduleReason: reason,
    date:             newDate,
    time:             newTime,
  })
  if (!result.success) return result

  emitBooking(BOOKING_EVENTS.BOOKING_RESCHEDULED, {
    booking:  result.booking,
    oldDate:  booking.date,
    oldTime:  booking.time,
    newDate,
    newTime,
  })
  return result
}

/**
 * Customer batalkan booking sendiri.
 *
 * EFEK:
 *   - Status: CONFIRMED | WAITING_CONFIRMATION | RESCHEDULED
 *             | WAITING_CHECK_IN → CANCELLED_BY_CUSTOMER
 *   - Emit BOOKING_CANCELLED
 *     → Sprint 2: calendarModule hapus slot
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} [options.reason]
 * @returns {{ success, booking, error }}
 */
export function cancelBookingByCustomer(bookingId, { reason = '' } = {}) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.CANCELLED_BY_CUSTOMER)
  if (transErr) return { success: false, booking: null, error: transErr }

  const result = updateBooking(bookingId, {
    status:         BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
    cancelledAt:    now(),
    cancelReason:   reason,
  })
  if (!result.success) return result

  emitBooking(BOOKING_EVENTS.BOOKING_CANCELLED, { booking: result.booking })
  return result
}

/**
 * Admin tandai booking sebagai No Show.
 * Dipanggil ketika customer tidak datang setelah batas waktu hari H.
 *
 * EFEK:
 *   - Status: CONFIRMED | WAITING_CHECK_IN → NO_SHOW
 *   - Emit BOOKING_NO_SHOW
 *     → Sprint 2: adminNotification (alert untuk follow-up CRM)
 *     → Sprint 4: CRM auto-trigger "customer no show" segment
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} [options.markedBy]
 * @returns {{ success, booking, error }}
 */
export function markNoShow(bookingId, { markedBy = 'Admin' } = {}) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.NO_SHOW)
  if (transErr) return { success: false, booking: null, error: transErr }

  const result = updateBooking(bookingId, {
    status:     BOOKING_STATUS.NO_SHOW,
    noShowAt:   now(),
    noShowBy:   markedBy,
  })
  if (!result.success) return result

  emitBooking(BOOKING_EVENTS.BOOKING_NO_SHOW, { booking: result.booking })
  return result
}

/**
 * Admin update status booking ke WAITING_CHECK_IN.
 * Dipanggil sehari sebelum atau pada hari H sebagai reminder.
 *
 * @param {string} bookingId
 * @returns {{ success, booking, error }}
 */
export function setWaitingCheckIn(bookingId) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.WAITING_CHECK_IN)
  if (transErr) return { success: false, booking: null, error: transErr }

  return updateBooking(bookingId, {
    status: BOOKING_STATUS.WAITING_CHECK_IN,
  })
}

/**
 * CHECK-IN — Customer datang, admin proses Check In.
 * INI ADALAH TITIK KONEKSI SATU-SATUNYA antara Booking dan Order.
 *
 * EFEK:
 *   - Status Booking: CONFIRMED | WAITING_CHECK_IN → CHECKED_IN
 *   - Set checkInAt, checkInBy
 *   - Emit BOOKING_CHECK_IN
 *   - SETELAH INI: caller (CheckIn component, Sprint 3) yang
 *     bertanggung jawab memanggil Order creation via orderEvents.
 *     bookingService.js TIDAK langsung membuat Order.
 *
 * Return:
 *   - Jika success, `booking` berisi bookingId yang dibutuhkan
 *     oleh caller untuk membuat Order dengan field bookingId: booking.id
 *
 * @param {string} bookingId
 * @param {object} options
 * @param {string} [options.checkedInBy]
 * @returns {{ success, booking, error }}
 */
export function checkIn(bookingId, { checkedInBy = 'Admin' } = {}) {
  const booking = getBookingById(bookingId)
  const transErr = guardTransition(booking, BOOKING_STATUS.CHECKED_IN)
  if (transErr) return { success: false, booking: null, error: transErr }

  const result = updateBooking(bookingId, {
    status:      BOOKING_STATUS.CHECKED_IN,
    checkInAt:   now(),
    checkInBy:   checkedInBy,
  })
  if (!result.success) return result

  // Emit BOOKING_CHECK_IN — Sprint 3 akan menambahkan subscriber
  // yang membuat Order. Booking module TIDAK perlu tahu caranya.
  emitBooking(BOOKING_EVENTS.BOOKING_CHECK_IN, { booking: result.booking })

  return result
}

/**
 * Sistem otomatis expire booking yang tidak dikonfirmasi > 24 jam.
 * Dipanggil dari scheduler (Sprint 2) atau saat halaman Bookings dibuka.
 *
 * @returns {{ expired: number, errors: string[] }}
 */
export function expireStaleBookings() {
  const all = getAllBookings()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  let expired = 0
  const errors = []

  for (const booking of all) {
    if (
      booking.status === BOOKING_STATUS.WAITING_CONFIRMATION &&
      booking.createdAt < cutoff
    ) {
      const result = updateBooking(booking.id, {
        status:    BOOKING_STATUS.EXPIRED,
        expiredAt: now(),
      })
      if (result.success) {
        emitBooking(BOOKING_EVENTS.BOOKING_EXPIRED, { booking: result.booking })
        expired++
      } else {
        errors.push(result.error)
      }
    }
  }

  return { expired, errors }
}
