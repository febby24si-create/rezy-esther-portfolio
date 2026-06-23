// ============================================================
// lib/calendarModule/calendarStorage.js
//
// STORAGE LAYER — Calendar Module
//
// garage_calendar menyimpan semua slot jadwal operasional bengkel.
// Entry dibuat otomatis saat booking dikonfirmasi (via subscriber).
// Entry diupdate saat: reschedule, check-in, no-show, cancel.
//
// CALENDAR ENTRY SCHEMA:
// {
//   id:           string  — 'CAL-XXXXXXXX'
//   bookingId:    string  — FK ke garage_bookings
//   customerId:   string
//   customerName: string
//   vehicleDisplay: string
//   serviceName:  string
//   date:         string  — 'YYYY-MM-DD'
//   time:         string  — 'HH:MM'
//   endTime:      string  — estimasi jam selesai ('HH:MM')
//   mechanicId:   string|null
//   mechanicName: string|null
//   serviceBay:   string|null
//   status:       CALENDAR_STATUS
//   createdAt:    string
//   updatedAt:    string
// }
//
// CALENDAR STATUS (lifecycle terpisah dari BOOKING_STATUS):
//   scheduled   → booking dikonfirmasi, masuk kalender
//   checked_in  → customer datang, check-in selesai
//   no_show     → customer tidak datang
//   cancelled   → booking dibatalkan
//   rescheduled → jadwal dipindah (entry lama diupdate, entry baru dibuat)
//
// BACKEND INTEGRATION:
//   Ganti readAll/writeAll dengan API calls.
//   Interface semua fungsi tidak berubah.
// ============================================================

export const CALENDAR_STATUS = {
  SCHEDULED:   'scheduled',
  CHECKED_IN:  'checked_in',
  NO_SHOW:     'no_show',
  CANCELLED:   'cancelled',
  RESCHEDULED: 'rescheduled',
}

const STORAGE_KEY = 'garage_calendar'

// ─── INTERNAL HELPERS ────────────────────────────────────────
function genCalendarId() {
  return 'CAL-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

function readAll() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function writeAll(entries) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    return true
  } catch { return false }
}

function now() { return new Date().toISOString() }

/** Hitung estimasi jam selesai berdasarkan jam mulai + durasi string */
function calcEndTime(time, durationStr) {
  try {
    const [h, m] = time.split(':').map(Number)
    // Parse durasi: '2–3 Jam', '30 Menit', '1 Jam', dst.
    const match = durationStr?.match(/(\d+)/)
    const hours = match ? parseInt(match[1], 10) : 2
    const totalMin = h * 60 + m + hours * 60
    const endH = Math.floor(totalMin / 60) % 24
    const endM = totalMin % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  } catch {
    return time
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────

export function getAllCalendarEntries() {
  return readAll()
}

export function getCalendarEntryById(id) {
  return readAll().find(e => e.id === id) ?? null
}

export function getCalendarByBookingId(bookingId) {
  return readAll().find(e => e.bookingId === bookingId) ?? null
}

export function getCalendarByDate(date) {
  return readAll().filter(e => e.date === date)
}

export function getCalendarByDateRange(from, to) {
  return readAll().filter(e => e.date >= from && e.date <= to)
}

/**
 * Buat calendar entry saat booking dikonfirmasi.
 * Dipanggil oleh bookingSubscribers BOOKING_CONFIRMED handler.
 *
 * @param {object} booking - booking object dari bookingStorage
 * @returns {{ success: boolean, entry: object|null, error: string|null }}
 */
export function createCalendarEntry(booking) {
  try {
    const entry = {
      id:             genCalendarId(),
      bookingId:      booking.id,
      customerId:     booking.customerId,
      customerName:   booking.customerName,
      vehicleDisplay: booking.vehicleDisplay,
      serviceName:    booking.serviceName,
      estimatedPrice: booking.estimatedPrice,
      date:           booking.date,
      time:           booking.time,
      endTime:        calcEndTime(booking.time, booking.estimatedDuration),
      mechanicId:     booking.mechanicId ?? null,
      mechanicName:   booking.mechanicName ?? null,
      serviceBay:     booking.serviceBay ?? null,
      status:         CALENDAR_STATUS.SCHEDULED,
      createdAt:      now(),
      updatedAt:      now(),
    }

    const all = readAll()
    writeAll([entry, ...all])

    return { success: true, entry, error: null }
  } catch (err) {
    return { success: false, entry: null, error: err.message }
  }
}

/**
 * Update calendar entry (status, reschedule, check-in, dll).
 *
 * @param {string} id      - calendar entry ID
 * @param {object} changes
 * @returns {{ success: boolean, entry: object|null, error: string|null }}
 */
export function updateCalendarEntry(id, changes) {
  try {
    const all = readAll()
    const idx = all.findIndex(e => e.id === id)
    if (idx === -1) return { success: false, entry: null, error: `Calendar entry ${id} tidak ditemukan.` }

    all[idx] = { ...all[idx], ...changes, id, updatedAt: now() }
    writeAll(all)
    return { success: true, entry: all[idx], error: null }
  } catch (err) {
    return { success: false, entry: null, error: err.message }
  }
}

/**
 * Update calendar entry berdasarkan bookingId (lebih praktis).
 * Dipanggil saat reschedule / cancel / no-show / check-in.
 *
 * @param {string} bookingId
 * @param {object} changes
 * @returns {{ success: boolean, entry: object|null, error: string|null }}
 */
export function updateCalendarByBookingId(bookingId, changes) {
  const entry = getCalendarByBookingId(bookingId)
  if (!entry) return { success: false, entry: null, error: `Tidak ada calendar entry untuk booking ${bookingId}.` }
  return updateCalendarEntry(entry.id, changes)
}

/**
 * Ambil statistik kalender untuk dashboard.
 * @returns {object}
 */
export function getCalendarStats() {
  const all    = readAll()
  const today  = new Date().toISOString().slice(0, 10)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)

  const active = all.filter(e => e.status === CALENDAR_STATUS.SCHEDULED)

  return {
    totalScheduled:  active.length,
    today:           active.filter(e => e.date === today).length,
    tomorrow:        active.filter(e => e.date === tomorrowStr).length,
    thisWeek:        active.filter(e => e.date >= today && e.date <= weekEndStr).length,
    checkedIn:       all.filter(e => e.status === CALENDAR_STATUS.CHECKED_IN).length,
    noShow:          all.filter(e => e.status === CALENDAR_STATUS.NO_SHOW).length,
    cancelled:       all.filter(e => e.status === CALENDAR_STATUS.CANCELLED).length,
  }
}
