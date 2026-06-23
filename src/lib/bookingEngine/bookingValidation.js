// ============================================================
// lib/bookingEngine/bookingValidation.js
//
// VALIDATION LAYER — Booking Module
//
// Semua business rule validasi booking diletakkan di sini.
// TIDAK ada logic UI (tidak ada import React, tidak ada state).
//
// Setiap fungsi mengembalikan:
//   { valid: boolean, error: string | null }
//
// BACKEND INTEGRATION:
//   Fungsi-fungsi ini bisa dijalankan identik di Node.js backend.
//   Tidak ada browser-specific API kecuali yang dipanggil via
//   bookingStorage.js (yang nantinya diganti dengan API calls).
//
// KAPASITAS DEFAULT:
//   MAX_BOOKINGS_PER_SLOT = 3
//     → Bengkel dengan 3 bay/mekanik aktif bisa tangani 3 booking
//       di slot waktu yang sama.
//   BOOKING_ADVANCE_DAYS  = 1
//     → Booking minimal 1 hari ke depan (tidak bisa hari ini).
//   BOOKING_MAX_DAYS      = 30
//     → Booking maksimal 30 hari ke depan.
//
// Semua konstanta dapat di-override oleh settings bengkel di Sprint 2.
// ============================================================

import { BOOKING_STATUS } from '../../constants/statusConstants'
import {
  getConflictingBookings,
  findActiveBookingForVehicle,
} from './bookingStorage'

// ─── BUSINESS RULE CONSTANTS ─────────────────────────────────
// Sprint 2: nilai ini akan dibaca dari garage_settings (Settings page)
export const BOOKING_RULES = {
  MAX_BOOKINGS_PER_SLOT: 3,   // kapasitas maksimal per slot waktu
  ADVANCE_DAYS_MIN:      1,   // minimal berapa hari ke depan
  ADVANCE_DAYS_MAX:      30,  // maksimal berapa hari ke depan
  OPEN_DAYS: [1, 2, 3, 4, 5, 6], // Senin–Sabtu (0=Minggu, 6=Sabtu)
  OPEN_HOUR_START: 8,         // jam buka (08:00)
  OPEN_HOUR_END:   17,        // jam tutup (17:00)
}

// Hari libur nasional 2025–2026 (format 'YYYY-MM-DD')
// Sprint 2: bisa dikelola admin via Settings page → garage_holidays
const DEFAULT_HOLIDAYS = new Set([
  '2025-01-01', // Tahun Baru
  '2025-01-27', // Isra Miraj
  '2025-01-29', // Tahun Baru Imlek
  '2025-03-29', // Hari Raya Nyepi
  '2025-03-30', // Wafat Isa Almasih
  '2025-04-18', // Idul Fitri
  '2025-04-19', // Idul Fitri
  '2025-05-01', // Hari Buruh
  '2025-05-12', // Waisak
  '2025-05-29', // Kenaikan Isa Almasih
  '2025-06-01', // Hari Pancasila
  '2025-06-06', // Idul Adha
  '2025-06-27', // Tahun Baru Islam
  '2025-08-17', // HUT RI
  '2025-09-05', // Maulid Nabi
  '2025-12-25', // Natal
  '2025-12-26', // Cuti Bersama Natal
  '2026-01-01', // Tahun Baru
])

// ─── INTERNAL HELPERS ────────────────────────────────────────
function ok()        { return { valid: true,  error: null } }
function fail(msg)   { return { valid: false, error: msg  } }

/** Parse 'YYYY-MM-DD' menjadi Date object (UTC) */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

// ─── PUBLIC VALIDATION FUNCTIONS ─────────────────────────────

/**
 * Cek apakah tanggal booking valid:
 *   - Format YYYY-MM-DD
 *   - Minimal ADVANCE_DAYS_MIN hari ke depan
 *   - Maksimal ADVANCE_DAYS_MAX hari ke depan
 *   - Bukan hari Minggu (sesuai OPEN_DAYS)
 *
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkDateValid(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return fail('Format tanggal tidak valid.')
  }

  const bookingDate = parseDate(dateStr)
  const today       = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Minimal N hari ke depan
  const minDate = new Date(today)
  minDate.setUTCDate(minDate.getUTCDate() + BOOKING_RULES.ADVANCE_DAYS_MIN)

  // Maksimal N hari ke depan
  const maxDate = new Date(today)
  maxDate.setUTCDate(maxDate.getUTCDate() + BOOKING_RULES.ADVANCE_DAYS_MAX)

  if (bookingDate < minDate) {
    return fail(`Booking harus dibuat minimal ${BOOKING_RULES.ADVANCE_DAYS_MIN} hari ke depan.`)
  }
  if (bookingDate > maxDate) {
    return fail(`Booking hanya tersedia hingga ${BOOKING_RULES.ADVANCE_DAYS_MAX} hari ke depan.`)
  }

  // Cek hari operasional (0=Minggu)
  const dayOfWeek = bookingDate.getUTCDay()
  if (!BOOKING_RULES.OPEN_DAYS.includes(dayOfWeek)) {
    return fail('Bengkel tutup pada hari Minggu.')
  }

  return ok()
}

/**
 * Cek apakah tanggal adalah hari libur.
 *
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Set<string>} [customHolidays] - override untuk testing/settings
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkHoliday(dateStr, customHolidays = DEFAULT_HOLIDAYS) {
  if (customHolidays.has(dateStr)) {
    return fail('Tanggal tersebut adalah hari libur nasional. Silakan pilih tanggal lain.')
  }
  return ok()
}

/**
 * Cek ketersediaan slot berdasarkan kapasitas maksimal bengkel.
 * Membaca data dari bookingStorage untuk menghitung konflik aktif.
 *
 * @param {string} date      - 'YYYY-MM-DD'
 * @param {string} time      - 'HH:MM'
 * @param {string} [excludeId] - booking ID yang dikecualikan (reschedule)
 * @returns {{ valid: boolean, error: string|null, remaining: number }}
 */
export function checkSlotAvailable(date, time, excludeId = null) {
  const conflicts = getConflictingBookings(date, time, excludeId)
  const booked    = conflicts.length
  const max       = BOOKING_RULES.MAX_BOOKINGS_PER_SLOT
  const remaining = max - booked

  if (remaining <= 0) {
    return {
      valid:     false,
      error:     `Slot ${time} pada tanggal tersebut sudah penuh (kapasitas: ${max} booking).`,
      remaining: 0,
    }
  }

  return { valid: true, error: null, remaining }
}

/**
 * Cek apakah customer sudah punya booking aktif untuk kendaraan yang sama.
 * Mencegah double booking (satu kendaraan dua booking aktif sekaligus).
 *
 * @param {string} customerId
 * @param {string} vehiclePlate
 * @param {string} [excludeId]
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkDuplicateBooking(customerId, vehiclePlate, excludeId = null) {
  if (!customerId || !vehiclePlate) return ok()

  const existing = findActiveBookingForVehicle(customerId, vehiclePlate, excludeId)
  if (existing) {
    return fail(
      `Kendaraan dengan plat ${vehiclePlate} sudah memiliki booking aktif ` +
      `(${existing.id} — ${existing.date} ${existing.time}). ` +
      `Batalkan booking sebelumnya terlebih dahulu.`
    )
  }
  return ok()
}

/**
 * Cek kapasitas mekanik pada tanggal tertentu.
 * Satu mekanik diasumsikan mampu menangani maksimal N booking per hari.
 *
 * Saat ini menggunakan kapasitas bengkel secara total (bukan per mekanik)
 * karena mekanik belum tentu di-assign saat booking dibuat.
 * Sprint 2: bisa diperhalus dengan data mekanik jadwal.
 *
 * @param {string} date     - 'YYYY-MM-DD'
 * @param {string} [mechanicId] - jika sudah di-assign
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkMechanicCapacity(date, mechanicId = null) {
  // Kapasitas per hari: MAX_BOOKINGS_PER_SLOT × jumlah slot × MAX_CONCURRENT
  // Implementasi sederhana untuk Sprint 1: selalu valid
  // Sprint 2: query garage_mechanics untuk jadwal aktual
  void date
  void mechanicId
  return ok()
}

/**
 * Cek apakah kendaraan sudah ada di booking lain pada hari yang sama.
 * Menggunakan parameter injection (bukan require()) agar kompatibel ES Module.
 *
 * @param {string}   vehiclePlate
 * @param {string}   date          - 'YYYY-MM-DD'
 * @param {string}   [excludeId]   - booking yang sedang di-reschedule
 * @param {object[]} [dayBookings] - injected dari bookingStorage.getBookingsByDate()
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkVehicleConflict(vehiclePlate, date, excludeId = null, dayBookings = []) {
  if (!vehiclePlate || !date) return ok()

  const ACTIVE = [
    BOOKING_STATUS.WAITING_CONFIRMATION,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN,
  ]

  const conflict = dayBookings.find(b =>
    b.vehiclePlate === vehiclePlate &&
    b.id !== excludeId &&
    ACTIVE.includes(b.status)
  )

  if (conflict) {
    return fail(
      `Kendaraan ${vehiclePlate} sudah ada booking pada tanggal ${date} ` +
      `pukul ${conflict.time}. Pilih tanggal atau jam berbeda.`
    )
  }
  return ok()
}

/**
 * Validasi menyeluruh sebelum booking baru dibuat (customer submit).
 * Memanggil semua check di atas secara berurutan.
 * Berhenti pada error pertama yang ditemukan.
 *
 * @param {object} params
 * @param {string}  params.date        - 'YYYY-MM-DD'
 * @param {string}  params.time        - 'HH:MM'
 * @param {string}  params.customerId
 * @param {string}  params.vehiclePlate
 * @returns {{ valid: boolean, error: string|null, remaining?: number }}
 */
export function validateNewBooking({ date, time, customerId, vehiclePlate }) {
  const dateCheck = checkDateValid(date)
  if (!dateCheck.valid) return dateCheck

  const holidayCheck = checkHoliday(date)
  if (!holidayCheck.valid) return holidayCheck

  const slotCheck = checkSlotAvailable(date, time)
  if (!slotCheck.valid) return slotCheck

  const dupCheck = checkDuplicateBooking(customerId, vehiclePlate)
  if (!dupCheck.valid) return dupCheck

  return { valid: true, error: null, remaining: slotCheck.remaining }
}

/**
 * Validasi saat admin melakukan reschedule booking.
 * Lebih longgar: tidak cek duplicate (booking yang sama di-reschedule).
 *
 * @param {object} params
 * @param {string}  params.date
 * @param {string}  params.time
 * @param {string}  params.bookingId  - ID booking yang di-reschedule (dikecualikan dari cek konflik)
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateReschedule({ date, time, bookingId }) {
  const dateCheck = checkDateValid(date)
  if (!dateCheck.valid) return dateCheck

  const holidayCheck = checkHoliday(date)
  if (!holidayCheck.valid) return holidayCheck

  const slotCheck = checkSlotAvailable(date, time, bookingId)
  if (!slotCheck.valid) return slotCheck

  return ok()
}
