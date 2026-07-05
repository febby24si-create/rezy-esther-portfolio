// ============================================================
// bookingAPI.js — Fase 4
// Semua operasi booking via Supabase REST API
// Menggantikan bookingEngine/bookingStorage.js (sessionStorage)
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

// ── Generator ID ──────────────────────────────────────────────
function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = 'BK-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export const bookingAPI = {
  // Ambil semua booking (admin)
  async fetchAll() {
    const response = await axios.get(`${API_URL}/bookings`, {
      headers,
      params: { order: 'created_at.desc' }
    })
    return response.data
  },

  // Ambil booking by customer
  async fetchByCustomer(customerId) {
    const response = await axios.get(`${API_URL}/bookings`, {
      headers,
      params: { customer_id: `eq.${customerId}`, order: 'created_at.desc' }
    })
    return response.data
  },

  // Ambil booking by ID
  async fetchById(id) {
    const response = await axios.get(`${API_URL}/bookings`, {
      headers,
      params: { id: `eq.${id}`, limit: 1 }
    })
    return response.data[0] || null
  },

  // Buat booking baru (dari member)
  async create(data) {
    const payload = {
      customer_id:      data.customerId   || null,
      customer_name:    data.customerName || '',
      vehicle_display:  data.vehicleDisplay || '',
      service:          data.serviceName  || data.service || '',
      booking_date:     data.date,
      booking_time:     data.time         || null,
      status:           'Menunggu Konfirmasi',
      notes:            data.notes        || null,
      mechanic_id:      null,
      order_id:         null,
    }
    const response = await axios.post(`${API_URL}/bookings`, payload, { headers })
    return response.data[0] || null
  },

  // Update status booking (admin actions)
  async update(id, data) {
    const response = await axios.patch(`${API_URL}/bookings?id=eq.${id}`, data, { headers })
    return response.data[0] || null
  },

  // Konfirmasi booking
  async confirm(id) {
    return this.update(id, {
      status:     'Dikonfirmasi',
      updated_at: new Date().toISOString(),
    })
  },

  // Tolak booking
  async reject(id, reason) {
    return this.update(id, {
      status:     'Ditolak',
      notes:      reason || 'Ditolak oleh admin',
      updated_at: new Date().toISOString(),
    })
  },

  // Jadwalkan ulang
  async reschedule(id, newDate, newTime) {
    return this.update(id, {
      status:       'Dijadwalkan Ulang',
      booking_date: newDate,
      booking_time: newTime,
      updated_at:   new Date().toISOString(),
    })
  },

  // Tandai No Show
  async markNoShow(id) {
    return this.update(id, {
      status:     'No Show',
      updated_at: new Date().toISOString(),
    })
  },

  // Check In — update booking + buat order baru
  async checkIn(id, { checkedInBy = 'Admin' } = {}) {
    const booking = await this.fetchById(id)
    if (!booking) return { success: false, error: 'Booking tidak ditemukan.' }

    // 1. Update status booking → Checked In
    await this.update(id, {
      status:     'Checked In',
      updated_at: new Date().toISOString(),
    })

    // 2. Buat order baru dari booking ini
    const { orderAPI } = await import('./orderAPI')
    const orderNumber = '#ORD-' + Math.random().toString(36).slice(2, 10).toUpperCase()
    const newOrder = await orderAPI.create({
      order_number:    orderNumber,
      customer_id:     booking.customer_id   || null,
      customer_name:   booking.customer_name,
      vehicle_display: booking.vehicle_display || '',
      service:         booking.service,
      status:          'Inspection',
      total:           0,
      booking_id:      booking.id,
      notes:           booking.notes || null,
      order_date:      new Date().toISOString().slice(0, 10),
    })

    // 3. Update booking.order_id dengan order yang baru dibuat
    if (newOrder) {
      await this.update(id, { order_id: newOrder.id })
    }

    return { success: true, orderId: newOrder?.order_number || orderNumber }
  },

  // Hitung stats booking
  calcStats(bookings) {
    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

    return {
      total:               bookings.length,
      pendingConfirmation: bookings.filter(b => b.status === 'Menunggu Konfirmasi').length,
      today:               bookings.filter(b => b.booking_date === today).length,
      tomorrow:            bookings.filter(b => b.booking_date === tomorrow).length,
      thisWeek:            bookings.filter(b => b.booking_date >= today && b.booking_date <= weekEnd).length,
      waitingCheckIn:      bookings.filter(b => b.status === 'Menunggu Check In' || b.status === 'Dikonfirmasi').length,
      checkedIn:           bookings.filter(b => b.status === 'Checked In').length,
    }
  }
}