// ============================================================
// lib/bookingSubscribers.js
//
// SIDE EFFECTS — Booking Module
//
// Mengikuti pola PERSIS SAMA dengan orderSubscribers.js:
//   - Didaftarkan SEKALI di bootstrap (main.jsx)
//   - Idempotent — aman dipanggil lebih dari sekali
//   - UI component TIDAK memanggil side effect langsung
//   - Setiap event memiliki komentar yang jelas tentang apa yang
//     dilakukan sekarang dan apa yang akan ditambahkan di Sprint
//     berikutnya.
//
// ── BOOKING_CREATED ───────────────────────────────────────────
//   Sekarang  : tulis notif admin ke garage_admin_notifications
//   Sprint 2  : push ke garage_calendar (jika langsung dikonfirmasi)
//   Sprint 5  : WhatsApp template "Booking Diterima, menunggu konfirmasi"
//
// ── BOOKING_CONFIRMED ─────────────────────────────────────────
//   Sekarang  : tulis notif customer ke garage_customer_notifications
//               tulis notif admin (untuk referensi)
//   Sprint 2  : push ke garage_calendar sebagai slot terkonfirmasi
//   Sprint 5  : WhatsApp template "Booking Dikonfirmasi"
//
// ── BOOKING_REJECTED ──────────────────────────────────────────
//   Sekarang  : tulis notif customer
//   Sprint 5  : WhatsApp template "Booking Ditolak"
//
// ── BOOKING_RESCHEDULED ───────────────────────────────────────
//   Sekarang  : tulis notif customer
//   Sprint 2  : update slot di garage_calendar
//   Sprint 5  : WhatsApp template "Booking Dijadwalkan Ulang"
//
// ── BOOKING_CANCELLED ─────────────────────────────────────────
//   Sekarang  : tulis notif admin (info slot tersedia lagi)
//   Sprint 2  : hapus slot dari garage_calendar
//
// ── BOOKING_NO_SHOW ───────────────────────────────────────────
//   Sekarang  : tulis notif admin (alert customer no show)
//   Sprint 4  : flag customer ke segmen "No Show" di CRM
//
// ── BOOKING_CHECK_IN ──────────────────────────────────────────
//   Sekarang  : no-op — Order dibuat di Sprint 3 oleh CheckIn component
//               menggunakan orderEvents.ORDER_CREATED.
//               Tidak ada yang boleh membuat Order di sini.
//   Sprint 3  : subscriber akan menambah logika di sini untuk
//               auto-create Order via orderEvents.
//
// ── BOOKING_EXPIRED ───────────────────────────────────────────
//   Sekarang  : tulis notif admin
//   Sprint 5  : WhatsApp template "Booking Expired"
// ============================================================

import { subscribeBooking, BOOKING_EVENTS } from './bookingEngine/bookingEvents'
import {
  createCalendarEntry,
  updateCalendarByBookingId,
  CALENDAR_STATUS,
} from './calendarModule/calendarStorage'
import { createOrderFromCheckIn } from './orderStorage'
import { emit, ORDER_EVENTS } from './orderEvents'

// ─── NOTIFICATION STORAGE KEYS ───────────────────────────────
// Digunakan juga oleh Sprint 2 notification modules.
// Definisikan di sini agar konsisten.
const ADMIN_NOTIF_KEY    = 'garage_admin_notifications'
const CUSTOMER_NOTIF_KEY = 'garage_customer_notifications'

// ─── NOTIFICATION HELPERS ────────────────────────────────────
function readNotifs(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '[]')
  } catch { return [] }
}

function pushNotif(key, notif) {
  try {
    const all = readNotifs(key)
    sessionStorage.setItem(key, JSON.stringify([
      {
        id:        'NOTIF-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        read:      false,
        createdAt: new Date().toISOString(),
        ...notif,
      },
      ...all,
    ]))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[bookingSubscribers] pushNotif error:', err)
  }
}

// ─── SUBSCRIBER REGISTRATION ─────────────────────────────────
let registered = false

/**
 * Daftarkan semua booking event subscribers.
 * Idempotent — aman dipanggil lebih dari sekali.
 * Dipanggil dari main.jsx bersamaan dengan registerOrderSubscribers().
 */
export function registerBookingSubscribers() {
  if (registered) return
  registered = true

  // ── BOOKING_CREATED ────────────────────────────────────────
  // Admin perlu tahu ada booking baru yang menunggu konfirmasi.
  subscribeBooking(BOOKING_EVENTS.BOOKING_CREATED, ({ booking }) => {
    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_created',
      bookingId: booking.id,
      title:     'Booking Baru',
      message:   `${booking.customerName} melakukan booking ${booking.serviceName} pada ${booking.date} pukul ${booking.time}.`,
      action:    { label: 'Lihat Booking', path: `/bookings/${booking.id}` },
    })
  })

  // ── BOOKING_CONFIRMED ──────────────────────────────────────
  // Customer mendapat notifikasi booking dikonfirmasi.
  // Admin mendapat konfirmasi aksi mereka berhasil.
  // Calendar entry dibuat otomatis di sini.
  subscribeBooking(BOOKING_EVENTS.BOOKING_CONFIRMED, ({ booking }) => {
    // 1. Buat calendar entry → booking masuk ke jadwal operasional bengkel
    createCalendarEntry(booking)

    // 2. Notif untuk customer
    pushNotif(CUSTOMER_NOTIF_KEY, {
      type:       'booking_confirmed',
      bookingId:  booking.id,
      customerId: booking.customerId,
      title:      'Booking Dikonfirmasi! ✅',
      message:    `Booking Anda untuk ${booking.serviceName} pada ${booking.date} pukul ${booking.time} telah dikonfirmasi. Sampai jumpa!`,
      action:     { label: 'Lihat Status', path: `/tracking` },
    })

    // 3. Notif untuk admin (log aksi)
    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_confirmed',
      bookingId: booking.id,
      title:     'Booking Dikonfirmasi',
      message:   `Booking ${booking.id} (${booking.customerName}) telah dikonfirmasi oleh ${booking.confirmedBy}.`,
      action:    { label: 'Lihat Booking', path: `/bookings/${booking.id}` },
    })
  })

  // ── BOOKING_REJECTED ───────────────────────────────────────
  subscribeBooking(BOOKING_EVENTS.BOOKING_REJECTED, ({ booking }) => {
    pushNotif(CUSTOMER_NOTIF_KEY, {
      type:       'booking_rejected',
      bookingId:  booking.id,
      customerId: booking.customerId,
      title:      'Booking Tidak Dapat Diproses',
      message:    `Mohon maaf, booking Anda pada ${booking.date} tidak dapat diproses. Alasan: ${booking.rejectedReason}. Silakan buat booking baru.`,
      action:     { label: 'Buat Booking Baru', path: `/booking` },
    })
  })

  // ── BOOKING_RESCHEDULED ────────────────────────────────────
  subscribeBooking(BOOKING_EVENTS.BOOKING_RESCHEDULED, ({ booking, oldDate, oldTime, newDate, newTime }) => {
    // Update calendar entry dengan jadwal baru
    updateCalendarByBookingId(booking.id, {
      date:      newDate,
      time:      newTime,
      status:    CALENDAR_STATUS.SCHEDULED,
    })

    pushNotif(CUSTOMER_NOTIF_KEY, {
      type:       'booking_rescheduled',
      bookingId:  booking.id,
      customerId: booking.customerId,
      title:      'Jadwal Booking Diubah',
      message:    `Booking Anda telah dijadwalkan ulang dari ${oldDate} ${oldTime} menjadi ${newDate} ${newTime}.`,
      action:     { label: 'Lihat Detail', path: `/tracking` },
    })
  })

  // ── BOOKING_CANCELLED ──────────────────────────────────────
  subscribeBooking(BOOKING_EVENTS.BOOKING_CANCELLED, ({ booking }) => {
    // Tandai slot sebagai cancelled agar tidak dihitung sebagai aktif
    updateCalendarByBookingId(booking.id, { status: CALENDAR_STATUS.CANCELLED })

    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_cancelled',
      bookingId: booking.id,
      title:     'Booking Dibatalkan',
      message:   `${booking.customerName} membatalkan booking ${booking.serviceName} pada ${booking.date} pukul ${booking.time}.`,
      action:    { label: 'Lihat Booking', path: `/bookings` },
    })
  })

  // ── BOOKING_NO_SHOW ────────────────────────────────────────
  subscribeBooking(BOOKING_EVENTS.BOOKING_NO_SHOW, ({ booking }) => {
    // Update status calendar → No Show
    updateCalendarByBookingId(booking.id, { status: CALENDAR_STATUS.NO_SHOW })

    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_no_show',
      bookingId: booking.id,
      title:     '⚠️ No Show',
      message:   `${booking.customerName} tidak hadir untuk booking ${booking.serviceName} pada ${booking.date}.`,
      action:    { label: 'Follow Up CRM', path: `/crm` },
      urgent:    true,
    })
  })

  // ── BOOKING_CHECK_IN ───────────────────────────────────────
  // INI ADALAH TITIK KONEKSI SATU-SATUNYA antara Booking dan Order.
  //
  // Flow:
  //   1. Update calendar entry → status checked_in
  //   2. Buat Order baru di garage_orders (status: 'Menunggu')
  //   3. Update booking.orderId dengan ID order yang baru dibuat
  //   4. Emit ORDER_CREATED → orderSubscribers menangani side effect
  //   5. Kirim notif admin: "Buat Work Order sekarang"
  //
  // TIDAK ADA poin loyalty di sini.
  // Poin diberikan HANYA saat ORDER_COMPLETED (via orderSubscribers).
  subscribeBooking(BOOKING_EVENTS.BOOKING_CHECK_IN, ({ booking }) => {
    // 1. Update calendar
    updateCalendarByBookingId(booking.id, {
      status: CALENDAR_STATUS.CHECKED_IN,
    })

    // 2. Buat Order dari data booking
    const orderResult = createOrderFromCheckIn({
      bookingId:     booking.id,
      customer:      booking.customerName,
      customerId:    booking.customerId,
      customerPhone: booking.customerPhone,
      vehicle:       booking.vehicleDisplay,
      vehiclePlate:  booking.vehiclePlate,
      service:       booking.serviceName,
      serviceId:     booking.serviceId,
      total:         booking.estimatedPrice,
      mechanic:      booking.mechanicName || '—',
      mechanicId:    booking.mechanicId || null,
      keluhan:       booking.notes,
      source:        'check-in',
    })

    if (!orderResult.success) {
      // eslint-disable-next-line no-console
      console.error('[bookingSubscribers] Gagal membuat order dari check-in:', orderResult.error)
      return
    }

    // 3. Update booking.orderId
    // Dilakukan langsung via bookingStorage agar tidak circular import
    try {
      const bookings = JSON.parse(sessionStorage.getItem('garage_bookings') || '[]')
      const idx = bookings.findIndex(b => b.id === booking.id)
      if (idx !== -1) {
        bookings[idx].orderId    = orderResult.order.id
        bookings[idx].updatedAt  = new Date().toISOString()
        sessionStorage.setItem('garage_bookings', JSON.stringify(bookings))
      }
    } catch {}

    // 4. Emit ORDER_CREATED — orderSubscribers menangani side effect
    // (saat ini no-op per Rule 1, tapi placeholder untuk audit log)
    emit(ORDER_EVENTS.ORDER_CREATED, { order: orderResult.order })

    // 5. Notif admin
    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_checkin',
      bookingId: booking.id,
      orderId:   orderResult.order.id,
      title:     'Customer Check In ✅',
      message:   `${booking.customerName} sudah check in. Order ${orderResult.order.id} otomatis dibuat. Assign mekanik sekarang.`,
      action:    { label: 'Buka Order', path: `/orders` },
      urgent:    true,
    })

    // Notif customer
    pushNotif(CUSTOMER_NOTIF_KEY, {
      type:       'order_created',
      bookingId:  booking.id,
      orderId:    orderResult.order.id,
      customerId: booking.customerId,
      title:      'Kendaraan Anda Diterima',
      message:    `Kendaraan Anda sudah check in dan sedang diproses. No. Order: ${orderResult.order.id}`,
      action:     { label: 'Track Status', path: `/tracking` },
    })
  })

  // ── BOOKING_EXPIRED ────────────────────────────────────────
  subscribeBooking(BOOKING_EVENTS.BOOKING_EXPIRED, ({ booking }) => {
    pushNotif(ADMIN_NOTIF_KEY, {
      type:      'booking_expired',
      bookingId: booking.id,
      title:     'Booking Expired',
      message:   `Booking ${booking.id} (${booking.customerName}) otomatis hangus karena tidak dikonfirmasi dalam 24 jam.`,
      action:    null,
    })
  })
}
