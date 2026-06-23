// ============================================================
// lib/orderStorage.js
//
// STORAGE LAYER — Order Module
//
// Menyediakan akses tulis ke 'garage_orders' dari LUAR React
// component. Dibutuhkan terutama oleh CheckIn flow (Sprint 3)
// yang harus membuat Order baru saat booking di-check-in,
// tanpa bisa mengakses React state dari Orders.jsx.
//
// PRINSIP:
//   Orders.jsx tetap menggunakan internal useState + useEffect
//   untuk membaca dan merender orders. File ini tidak menggantikan
//   logika itu — hanya menambahkan akses write dari luar React.
//
//   Orders.jsx sudah sync ke sessionStorage via useEffect setiap
//   kali state berubah. File ini menulis langsung ke sessionStorage
//   sehingga saat Orders.jsx di-mount berikutnya (atau refresh),
//   data sudah ada.
//
// ORDER SCHEMA (field yang dibutuhkan Orders.jsx):
// {
//   id:           string  — '#ORD-XXXXXXXX' (generateId pattern)
//   customer:     string  — nama customer (denormalized)
//   customerId:   string  — FK ke customer store
//   customerPhone:string
//   vehicle:      string  — 'Brand Model - Plat'
//   vehiclePlate: string
//   service:      string  — nama layanan
//   status:       string  — ORDER_STATUS value (dari statusConstants)
//   total:        number  — estimated total (dari booking estimatedPrice)
//   date:         string  — 'YYYY-MM-DD' tanggal check-in
//   time:         string  — 'HH:MM' waktu check-in
//   mechanic:     string  — '—' default, diisi saat assign
//   keluhan:      string  — catatan / keluhan dari booking
//   bookingId:    string  — FK ke garage_bookings (nullable untuk walk-in)
//   source:       'check-in' | 'walk-in' | 'admin'
//   pointsAwarded: boolean — false, diupdate saat ORDER_COMPLETED
//   createdAt:    string  — ISO timestamp
//   updatedAt:    string  — ISO timestamp
// }
//
// BACKEND INTEGRATION:
//   Ganti readAll/writeAll dengan POST /api/orders.
//   Interface createOrderFromCheckIn tidak berubah.
// ============================================================

import { ORDER_STATUS } from '../constants/statusConstants'

const STORAGE_KEY = 'garage_orders'

// ─── INTERNAL ────────────────────────────────────────────────
function genOrderId() {
  return '#ORD-' + crypto.randomUUID().slice(0, 8).toUpperCase()
}

function readAll() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function writeAll(orders) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    return true
  } catch { return false }
}

function now() { return new Date().toISOString() }

// ─── PUBLIC API ───────────────────────────────────────────────

/**
 * Baca semua orders dari sessionStorage.
 * Digunakan oleh halaman yang tidak bisa pakai React state
 * (mis. CheckIn yang perlu cross-check existing orders).
 */
export function getAllOrders() {
  return readAll()
}

/**
 * Buat Order baru dari proses Check In.
 *
 * ATURAN KRITIS:
 *   - Fungsi ini HANYA boleh dipanggil setelah bookingService.checkIn()
 *     berhasil (BOOKING_CHECK_IN event sudah di-emit).
 *   - Order dibuat dengan status INSPECTION (langkah pertama order workflow).
 *   - bookingId diisi sebagai foreign key ke booking asal.
 *   - Untuk walk-in (tanpa booking), bookingId = null.
 *
 * @param {object} data
 * @param {string}  data.bookingId       - FK ke booking (null jika walk-in)
 * @param {string}  data.customer        - nama customer
 * @param {string}  data.customerId      - ID customer
 * @param {string}  data.customerPhone
 * @param {string}  data.vehicle         - display string 'Brand Model - Plat'
 * @param {string}  data.vehiclePlate
 * @param {string}  data.service         - nama layanan
 * @param {string}  data.serviceId
 * @param {number}  data.total           - estimated price dari booking
 * @param {string}  data.mechanic        - nama mekanik (default '—')
 * @param {string}  data.keluhan         - notes dari booking
 * @param {string}  [data.date]          - default today
 * @param {string}  [data.time]          - default now
 * @param {string}  [data.source]        - default 'check-in'
 *
 * @returns {{ success: boolean, order: object|null, error: string|null }}
 */
export function createOrderFromCheckIn(data) {
  try {
    const id        = genOrderId()
    const timestamp = now()
    const today     = new Date().toISOString().slice(0, 10)
    const timeNow   = new Date().toTimeString().slice(0, 5)

    const order = {
      // Identity
      id,
      customer:      data.customer ?? '',
      customerId:    data.customerId ?? null,
      customerPhone: data.customerPhone ?? '',

      // Vehicle & service (denormalized untuk display di Orders.jsx)
      vehicle:       data.vehicle ?? '',
      vehiclePlate:  data.vehiclePlate ?? '',
      service:       data.service ?? '',
      serviceId:     data.serviceId ?? null,

      // Financial
      total:         data.total ?? 0,

      // Assignment
      mechanic:      data.mechanic ?? '—',
      mechanicId:    data.mechanicId ?? null,

      // Status — selalu mulai dari INSPECTION saat check-in
      // Catatan: ORDER_STATUS.INSPECTION = 'Inspection' dari statusConstants.
      // Orders.jsx menggunakan STATUS config lama ('Menunggu', 'Sedang Dikerjakan', dll).
      // Migration STATUS ke statusConstants dilakukan di Sprint 4.
      // Untuk Sprint 3, gunakan 'Menunggu' agar kompatibel dengan Orders.jsx saat ini.
      status:        'Menunggu',

      // Schedule
      date:          data.date ?? today,
      time:          data.time ?? timeNow,

      // Content
      keluhan:       data.keluhan ?? '',

      // Booking reference — KUNCI PEMISAHAN Booking ≠ Order
      bookingId:     data.bookingId ?? null,

      // Metadata
      source:        data.source ?? 'check-in',
      pointsAwarded: false,
      needsMechanicAssignment: !data.mechanic || data.mechanic === '—',
      createdAt:     timestamp,
      updatedAt:     timestamp,
    }

    // Prepend ke depan agar muncul pertama di Orders.jsx
    const all = readAll()
    writeAll([order, ...all])

    return { success: true, order, error: null }
  } catch (err) {
    return { success: false, order: null, error: err.message }
  }
}

/**
 * Update field order tertentu dari luar React.
 * Digunakan oleh subscribers jika perlu patch order.
 *
 * @param {string} id      - order ID ('#ORD-XXXX')
 * @param {object} changes - field yang diubah
 * @returns {{ success: boolean, order: object|null, error: string|null }}
 */
export function updateOrder(id, changes) {
  try {
    const all = readAll()
    const idx = all.findIndex(o => o.id === id)
    if (idx === -1) return { success: false, order: null, error: `Order ${id} tidak ditemukan.` }

    all[idx] = { ...all[idx], ...changes, id, updatedAt: now() }
    writeAll(all)
    return { success: true, order: all[idx], error: null }
  } catch (err) {
    return { success: false, order: null, error: err.message }
  }
}
