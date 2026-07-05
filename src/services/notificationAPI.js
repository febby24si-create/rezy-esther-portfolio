// ============================================================
// notificationAPI.js
// Notifikasi real-time via Supabase polling
// Tabel: notifications
// ============================================================
import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const NOTIF_TYPE = {
  BOOKING_SUCCESS:   'booking_success',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_CONFIRMED: 'booking_confirmed',
  SERVICE_DONE:      'service_done',
  INVOICE_READY:     'invoice_ready',
  SERVICE_REMINDER:  'service_reminder',
  POINTS_EARNED:     'points_earned',
  VOUCHER_NEW:       'voucher_new',
  NEW_ORDER:         'new_order',
  LOW_STOCK:         'low_stock',
  NEW_BOOKING:       'new_booking',
}

export const NOTIF_ICON = {
  booking_success:   '📅',
  booking_cancelled: '❌',
  booking_confirmed: '✅',
  service_done:      '🔧',
  invoice_ready:     '🧾',
  service_reminder:  '⏰',
  points_earned:     '⭐',
  voucher_new:       '🎁',
  new_order:         '📋',
  low_stock:         '⚠️',
  new_booking:       '🔔',
}

export const notificationAPI = {
  // Ambil notifikasi untuk target tertentu
  async fetchForAdmin(limit = 30) {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers,
      params: {
        target: 'eq.admin',
        order:  'created_at.desc',
        limit,
      }
    })
    return response.data
  },

  async fetchForCustomer(customerId, limit = 20) {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers,
      params: {
        or:    `(target.eq.all,and(target.eq.customer,customer_id.eq.${customerId}))`,
        order: 'created_at.desc',
        limit,
      }
    })
    return response.data
  },

  // Buat notifikasi baru
  async create(data) {
    const response = await axios.post(`${API_URL}/notifications`, {
      type:        data.type,
      title:       data.title,
      message:     data.message,
      target:      data.target || 'admin', // admin | customer | all
      customer_id: data.customerId || null,
      link:        data.link || null,
      is_read:     false,
    }, { headers })
    return response.data[0] || null
  },

  // Tandai satu notifikasi sudah dibaca
  async markRead(id) {
    await axios.patch(`${API_URL}/notifications?id=eq.${id}`,
      { is_read: true }, { headers })
  },

  // Tandai semua notifikasi sudah dibaca (per target)
  async markAllRead(target, customerId) {
    const params = customerId
      ? `customer_id=eq.${customerId}`
      : `target=eq.${target}`
    await axios.patch(`${API_URL}/notifications?${params}`,
      { is_read: true }, { headers })
  },

  // Hapus notifikasi
  async delete(id) {
    await axios.delete(`${API_URL}/notifications?id=eq.${id}`, { headers })
  },

  // Helper: buat notifikasi booking berhasil
  async notifyBookingSuccess(customerName, serviceName, date, customerId) {
    await this.create({
      type:       NOTIF_TYPE.BOOKING_SUCCESS,
      title:      'Booking Berhasil',
      message:    `${customerName} booking ${serviceName} untuk ${date}`,
      target:     'admin',
      link:       '/bookings',
    })
    if (customerId) {
      await this.create({
        type:       NOTIF_TYPE.BOOKING_SUCCESS,
        title:      'Booking Berhasil! 📅',
        message:    `Booking ${serviceName} untuk ${date} telah diterima. Menunggu konfirmasi.`,
        target:     'customer',
        customerId,
        link:       '/member/tracking',
      })
    }
  },

  // Helper: notifikasi servis selesai
  async notifyServiceDone(customerName, serviceName, orderId, customerId) {
    await this.create({
      type:    NOTIF_TYPE.SERVICE_DONE,
      title:   'Servis Selesai',
      message: `Order ${orderId} — ${customerName} (${serviceName}) telah selesai`,
      target:  'admin',
      link:    '/orders',
    })
    if (customerId) {
      await this.create({
        type:       NOTIF_TYPE.SERVICE_DONE,
        title:      'Kendaraan Siap Diambil! 🔧',
        message:    `${serviceName} selesai dikerjakan. Kendaraan siap diambil sekarang.`,
        target:     'customer',
        customerId,
        link:       '/member/riwayat',
      })
    }
  },

  // Helper: notifikasi poin masuk
  async notifyPointsEarned(customerId, points, orderRef) {
    if (!customerId) return
    await this.create({
      type:       NOTIF_TYPE.POINTS_EARNED,
      title:      `+${points} Poin Masuk! ⭐`,
      message:    `Kamu mendapat ${points} poin dari ${orderRef}. Tukar dengan reward menarik!`,
      target:     'customer',
      customerId,
      link:       '/member/poin',
    })
  },

  // Helper: notifikasi booking baru (untuk admin)
  async notifyNewBooking(customerName, serviceName, date) {
    await this.create({
      type:    NOTIF_TYPE.NEW_BOOKING,
      title:   'Booking Baru Masuk 🔔',
      message: `${customerName} booking ${serviceName} untuk ${date}`,
      target:  'admin',
      link:    '/bookings',
    })
  },

  // Helper: notifikasi voucher baru untuk customer
  async notifyNewVoucher(customerId, voucherTitle) {
    if (!customerId) return
    await this.create({
      type:       NOTIF_TYPE.VOUCHER_NEW,
      title:      'Voucher Baru! 🎁',
      message:    `${voucherTitle} sudah aktif di akun kamu.`,
      target:     'customer',
      customerId,
      link:       '/member/voucher',
    })
  },
}