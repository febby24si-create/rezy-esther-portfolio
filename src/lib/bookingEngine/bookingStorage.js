// ============================================================
// lib/bookingEngine/bookingStorage.js
//
// STORAGE LAYER — Booking Module
//
// Semua operasi baca/tulis ke sessionStorage key 'garage_bookings'
// HARUS melalui modul ini. Tidak ada komponen atau halaman yang
// boleh mengakses 'garage_bookings' secara langsung.
//
// STORAGE KEY: 'garage_bookings'
//
// BOOKING SCHEMA (setiap entry):
// {
//   id:               string  — 'BK-XXXXXXXX' (prefix berbeda dari order '#ORD-')
//   customerId:       string  — FK ke eg_customers / garage_customers
//   customerName:     string  — denormalized untuk display cepat
//   customerPhone:    string  — untuk notifikasi WhatsApp (future)
//
//   vehicleDisplay:   string  — '{brand} {model} - {plate}' (display)
//   vehiclePlate:     string  — extracted, untuk pencarian cepat
//   vehicleId:        string|null — FK ke garage_vehicles (jika ada)
//
//   serviceId:        string  — FK ke layanan (mis. 'L01')
//   serviceName:      string  — denormalized untuk display
//   estimatedPrice:   number  — estimasi biaya awal (bukan final)
//   estimatedDuration:string  — mis. '2–3 Jam'
//
//   date:             string  — 'YYYY-MM-DD' tanggal booking
//   time:             string  — 'HH:MM' slot waktu
//   notes:            string  — keluhan / catatan customer
//
//   status:           BOOKING_STATUS — status saat ini
//
//   voucherCode:      string|null  — kode voucher yang dipakai
//   discountApplied:  number       — nilai diskon dalam Rupiah
//
//   // Admin actions
//   confirmedAt:      string|null  — ISO timestamp saat dikonfirmasi
//   confirmedBy:      string|null  — nama/id admin yang konfirmasi
//   rejectedAt:       string|null  — ISO timestamp saat ditolak
//   rejectedReason:   string|null  — alasan penolakan
//   rescheduledAt:    string|null  — ISO timestamp saat dijadwalkan ulang
//   rescheduledFrom:  string|null  — tanggal asal sebelum reschedule
//   rescheduledTime:  string|null  — jam asal sebelum reschedule
//   noShowAt:         string|null  — ISO timestamp saat ditandai no show
//
//   // Check-in (Sprint 3)
//   checkInAt:        string|null  — ISO timestamp saat check-in
//   checkInBy:        string|null  — admin yang melakukan check-in
//   orderId:          string|null  — '#ORD-XXXXXXXX', diisi saat check-in
//
//   // Calendar (Sprint 2)
//   calendarEntryId:  string|null  — FK ke garage_calendar
//   mechanicId:       string|null  — mekanik yang akan ditugaskan (dari admin saat konfirmasi)
//   mechanicName:     string|null  — denormalized
//   serviceBay:       string|null  — bay pengerjaan (future)
//
//   // Metadata
//   source:           'online' | 'walk-in'  — asal booking
//   createdAt:        string  — ISO timestamp
//   updatedAt:        string  — ISO timestamp (diupdate setiap perubahan)
// }
//
// BACKEND INTEGRATION:
//   Ganti implementasi internal fungsi ini dengan API calls.
//   Interface (nama fungsi, parameter, return value) tidak perlu berubah.
// ============================================================

import { BOOKING_STATUS } from '../../constants/statusConstants'

const STORAGE_KEY = 'garage_bookings'

// ─── ID GENERATOR ────────────────────────────────────────────────────
// Prefix 'BK-' untuk membedakan dari order '#ORD-'
// Mengikuti pola genOrderId() di BookingService.jsx
function genBookingId() {
  return 'BK-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

// ─── INTERNAL HELPERS ────────────────────────────────────────────────
function readAll() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(bookings) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    return true
  } catch {
    return false
  }
}

function now() {
  return new Date().toISOString()
}

// ─── PUBLIC API ───────────────────────────────────────────────────────

/**
 * Baca semua booking.
 * @returns {object[]}
 */
export function getAllBookings() {
  return readAll()
}

/**
 * Baca satu booking berdasarkan ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getBookingById(id) {
  return readAll().find(b => b.id === id) ?? null
}

/**
 * Baca semua booking milik satu customer.
 * @param {string} customerId
 * @returns {object[]}
 */
export function getBookingsByCustomer(customerId) {
  return readAll().filter(b => b.customerId === customerId)
}

/**
 * Baca booking berdasarkan tanggal (YYYY-MM-DD).
 * Berguna untuk dashboard "Booking Hari Ini" dan Calendar.
 * @param {string} date - format 'YYYY-MM-DD'
 * @returns {object[]}
 */
export function getBookingsByDate(date) {
  return readAll().filter(b => b.date === date)
}

/**
 * Baca booking berdasarkan rentang tanggal.
 * @param {string} from - 'YYYY-MM-DD'
 * @param {string} to   - 'YYYY-MM-DD'
 * @returns {object[]}
 */
export function getBookingsByDateRange(from, to) {
  return readAll().filter(b => b.date >= from && b.date <= to)
}

/**
 * Baca booking berdasarkan status.
 * @param {string|string[]} status - satu atau array BOOKING_STATUS
 * @returns {object[]}
 */
export function getBookingsByStatus(status) {
  const statuses = Array.isArray(status) ? status : [status]
  return readAll().filter(b => statuses.includes(b.status))
}

/**
 * Buat booking baru.
 * Menerima data dari BookingService.jsx (customer form).
 *
 * @param {object} data - field booking (tanpa id, status, timestamps)
 * @returns {{ success: boolean, booking: object|null, error: string|null }}
 */
export function createBooking(data) {
  try {
    const id = genBookingId()
    const timestamp = now()

    const booking = {
      // Identity
      id,
      customerId:        data.customerId ?? null,
      customerName:      data.customerName ?? '',
      customerPhone:     data.customerPhone ?? '',

      // Vehicle
      vehicleDisplay:    data.vehicleDisplay ?? '',
      vehiclePlate:      data.vehiclePlate ?? '',
      vehicleId:         data.vehicleId ?? null,

      // Service
      serviceId:         data.serviceId ?? null,
      serviceName:       data.serviceName ?? '',
      estimatedPrice:    data.estimatedPrice ?? 0,
      estimatedDuration: data.estimatedDuration ?? '',

      // Schedule
      date:              data.date ?? '',
      time:              data.time ?? '',
      notes:             data.notes ?? '',

      // Status — selalu mulai dari WAITING_CONFIRMATION saat submit
      status:            BOOKING_STATUS.WAITING_CONFIRMATION,

      // Voucher
      voucherCode:       data.voucherCode ?? null,
      discountApplied:   data.discountApplied ?? 0,

      // Admin actions — kosong saat pertama dibuat
      confirmedAt:       null,
      confirmedBy:       null,
      rejectedAt:        null,
      rejectedReason:    null,
      rescheduledAt:     null,
      rescheduledFrom:   null,
      rescheduledTime:   null,
      noShowAt:          null,

      // Check-in (diisi Sprint 3)
      checkInAt:         null,
      checkInBy:         null,
      orderId:           null,

      // Calendar (diisi Sprint 2)
      calendarEntryId:   null,
      mechanicId:        data.mechanicId ?? null,
      mechanicName:      data.mechanicName ?? null,
      serviceBay:        null,

      // Metadata
      source:            data.source ?? 'online',
      createdAt:         timestamp,
      updatedAt:         timestamp,
    }

    const all = readAll()
    writeAll([booking, ...all])

    return { success: true, booking, error: null }
  } catch (err) {
    return { success: false, booking: null, error: err.message }
  }
}

/**
 * Update field tertentu pada satu booking.
 * Selalu memperbarui `updatedAt`.
 *
 * @param {string} id      - booking ID
 * @param {object} changes - field yang diubah
 * @returns {{ success: boolean, booking: object|null, error: string|null }}
 */
export function updateBooking(id, changes) {
  try {
    const all = readAll()
    const idx = all.findIndex(b => b.id === id)
    if (idx === -1) {
      return { success: false, booking: null, error: `Booking ${id} tidak ditemukan.` }
    }

    const updated = {
      ...all[idx],
      ...changes,
      id,              // id tidak boleh berubah
      updatedAt: now(),
    }

    all[idx] = updated
    writeAll(all)

    return { success: true, booking: updated, error: null }
  } catch (err) {
    return { success: false, booking: null, error: err.message }
  }
}

/**
 * Hapus booking berdasarkan ID.
 * Digunakan hanya untuk kasus extreme (data corrupt, testing).
 * Dalam operasional normal, gunakan updateBooking dengan status terminal.
 *
 * @param {string} id
 * @returns {{ success: boolean, error: string|null }}
 */
export function deleteBooking(id) {
  try {
    const all = readAll()
    const filtered = all.filter(b => b.id !== id)
    if (filtered.length === all.length) {
      return { success: false, error: `Booking ${id} tidak ditemukan.` }
    }
    writeAll(filtered)
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Hitung statistik booking untuk dashboard.
 * Dipakai oleh Dashboard.jsx dan Bookings.jsx.
 *
 * @returns {object} statistik booking
 */
export function getBookingStats() {
  const all = readAll()
  const today = new Date().toISOString().slice(0, 10)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)

  return {
    // Volume
    total:              all.length,
    today:              all.filter(b => b.date === today).length,
    tomorrow:           all.filter(b => b.date === tomorrowStr).length,
    thisWeek:           all.filter(b => b.date >= today && b.date <= weekEndStr).length,

    // Per status — menggunakan BOOKING_STATUS untuk konsistensi
    pendingConfirmation: all.filter(b => b.status === BOOKING_STATUS.WAITING_CONFIRMATION).length,
    confirmed:           all.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length,
    waitingCheckIn:      all.filter(b => b.status === BOOKING_STATUS.WAITING_CHECK_IN).length,
    rescheduled:         all.filter(b => b.status === BOOKING_STATUS.RESCHEDULED).length,
    checkedIn:           all.filter(b => b.status === BOOKING_STATUS.CHECKED_IN).length,
    noShow:              all.filter(b => b.status === BOOKING_STATUS.NO_SHOW).length,
    rejected:            all.filter(b => b.status === BOOKING_STATUS.REJECTED).length,
    cancelled:           all.filter(b => b.status === BOOKING_STATUS.CANCELLED_BY_CUSTOMER).length,

    // Alert counts untuk dashboard
    needsAction:         all.filter(b =>
      b.status === BOOKING_STATUS.WAITING_CONFIRMATION ||
      b.status === BOOKING_STATUS.RESCHEDULED
    ).length,

    // Today breakdown
    todayConfirmed:      all.filter(b =>
      b.date === today && b.status === BOOKING_STATUS.CONFIRMED
    ).length,
    todayWaitingCheckIn: all.filter(b =>
      b.date === today && b.status === BOOKING_STATUS.WAITING_CHECK_IN
    ).length,
    todayNoShow:         all.filter(b =>
      b.date === today && b.status === BOOKING_STATUS.NO_SHOW
    ).length,
  }
}

/**
 * Cek apakah slot waktu tertentu sudah terisi.
 * Digunakan oleh bookingValidation.js.
 *
 * @param {string} date  - 'YYYY-MM-DD'
 * @param {string} time  - 'HH:MM'
 * @param {string} [excludeId] - booking ID yang dikecualikan (untuk reschedule)
 * @returns {object[]} booking yang konflik
 */
export function getConflictingBookings(date, time, excludeId = null) {
  return readAll().filter(b =>
    b.date === date &&
    b.time === time &&
    b.id !== excludeId &&
    // Hanya status aktif yang dihitung sebagai konflik
    [
      BOOKING_STATUS.WAITING_CONFIRMATION,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.WAITING_CHECK_IN,
    ].includes(b.status)
  )
}

/**
 * Cek apakah customer sudah punya booking aktif untuk kendaraan yang sama.
 * Mencegah double-booking oleh customer yang sama.
 *
 * @param {string} customerId
 * @param {string} vehiclePlate
 * @param {string} [excludeId]
 * @returns {object|null} booking yang konflik, atau null
 */
export function findActiveBookingForVehicle(customerId, vehiclePlate, excludeId = null) {
  const active = [
    BOOKING_STATUS.WAITING_CONFIRMATION,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN,
    BOOKING_STATUS.RESCHEDULED,
  ]
  return readAll().find(b =>
    b.customerId === customerId &&
    b.vehiclePlate === vehiclePlate &&
    b.id !== excludeId &&
    active.includes(b.status)
  ) ?? null
}
