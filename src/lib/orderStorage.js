// ============================================================
// lib/orderStorage.js
//
// STORAGE LAYER — Order Module (Supabase-backed)
//
// MIGRASI: file ini sebelumnya menulis ke sessionStorage
// ('garage_orders'). Karena Orders.jsx, Bookings.jsx, dan
// CheckIn.jsx sudah pindah ke Supabase (lihat services/orderAPI.js),
// sessionStorage tadi selalu kosong — akibatnya OrderDetail.jsx
// (yang memakai file ini via workflowEngine.js) tidak pernah bisa
// menemukan order apa pun.
//
// File ini sekarang jadi ADAPTER tipis di atas orderAPI (Supabase):
//   - normalizeOrder()   : snake_case (kolom DB) -> camelCase (dipakai UI/workflowEngine)
//   - denormalizeChanges(): camelCase (ditulis workflowEngine) -> snake_case (kolom DB)
//
// Field workflow (workflowStage, inspection, estimasi, qc, payment,
// stageHistory, approvalStatus, dst) disimpan sebagai kolom JSONB/text
// tambahan di tabel `orders` Supabase — lihat SUPABASE_MIGRATION_order_workflow.sql
//
// INTERFACE PUBLIK SENGAJA DIPERTAHANKAN SAMA (getAllOrders, updateOrder)
// supaya workflowEngine.js tidak perlu banyak berubah selain async/await.
// ============================================================

import { orderAPI } from '../services/orderAPI'

// ─── NORMALISASI: DB (snake_case) → APP (camelCase) ───────────
function normalizeOrder(o) {
  if (!o) return null
  return {
    ...o,
    customer:      o.customer_name,
    customerId:    o.customer_id,
    vehicle:       o.vehicle_display,
    date:          o.order_date,
    mechanic:      o.mechanic_name,
    bookingId:     o.booking_id,

    paymentStatus: o.payment_status,
    paidAmount:    Number(o.paid_amount) || 0,

    pointsAwarded:           o.points_awarded ?? false,
    needsMechanicAssignment: o.needs_mechanic_assignment ?? (!o.mechanic_name || o.mechanic_name === '—'),

    // ── Field workflow (Inspeksi → Estimasi → QC → Pembayaran) ──
    workflowStage:   o.workflow_stage || null,
    inspection:      o.inspection || null,
    estimasi:        o.estimasi || null,
    qc:              o.qc || null,
    payment:         o.payment || null,
    stageHistory:    o.stage_history || [],
    approvalStatus:  o.approval_status || null,
    approvedAt:      o.approved_at || null,
    approvedBy:      o.approved_by || null,
    approvalNotes:   o.approval_notes || null,
    revisionReason:  o.revision_reason || null,
    revisionAt:      o.revision_at || null,
    finalTotal:      o.final_total ?? null,
    workStartedAt:   o.work_started_at || null,
    workStartedBy:   o.work_started_by || null,
  }
}

// ─── DENORMALISASI: APP (camelCase, ditulis workflowEngine) → DB (snake_case) ──
function denormalizeChanges(changes) {
  const map = {
    workflowStage:  'workflow_stage',
    inspection:     'inspection',
    estimasi:       'estimasi',
    qc:             'qc',
    payment:        'payment',
    stageHistory:   'stage_history',
    approvalStatus: 'approval_status',
    approvedAt:     'approved_at',
    approvedBy:     'approved_by',
    approvalNotes:  'approval_notes',
    revisionReason: 'revision_reason',
    revisionAt:     'revision_at',
    finalTotal:     'final_total',
    workStartedAt:  'work_started_at',
    workStartedBy:  'work_started_by',
    pointsAwarded:  'points_awarded',
    status:         'status',
    total:          'total',
  }

  const payload = {}
  for (const [key, value] of Object.entries(changes)) {
    const dbKey = map[key] ?? key // fallback: kirim apa adanya jika tidak ada di map
    payload[dbKey] = value
  }
  return payload
}

// ─── PUBLIC API ───────────────────────────────────────────────

/**
 * Baca semua orders dari Supabase, dinormalisasi ke bentuk
 * camelCase yang dipakai workflowEngine.js & OrderDetail.jsx.
 */
export async function getAllOrders() {
  const raw = await orderAPI.fetchAll()
  return (raw || []).map(normalizeOrder)
}

/**
 * Baca satu order by ID langsung dari Supabase (lebih efisien
 * daripada getAllOrders().find(...) — dipakai OrderDetail.jsx).
 */
export async function getOrderById(id) {
  const raw = await orderAPI.fetchById(id)
  return normalizeOrder(raw)
}

/**
 * Update field order tertentu di Supabase.
 * Menerima & mengembalikan bentuk camelCase (workflowEngine.js
 * tidak perlu tahu soal snake_case kolom database).
 *
 * @param {string} id      - order ID
 * @param {object} changes - field yang diubah (camelCase)
 * @returns {Promise<{ success: boolean, order: object|null, error: string|null }>}
 */
export async function updateOrder(id, changes) {
  try {
    const payload = denormalizeChanges(changes)
    const updated = await orderAPI.update(id, payload)
    if (!updated) return { success: false, order: null, error: `Order ${id} tidak ditemukan atau gagal diupdate.` }
    return { success: true, order: normalizeOrder(updated), error: null }
  } catch (err) {
    return { success: false, order: null, error: err.message }
  }
}

/**
 * @deprecated Sisa arsitektur lama (Sprint 3) yang membuat Order dari
 * proses Check In via sessionStorage. Sejak CheckIn.jsx pindah ke
 * `bookingAPI.checkIn()` (yang langsung membuat order lewat
 * `orderAPI.create()` di Supabase), fungsi ini sudah tidak dipanggil
 * dari jalur manapun — termasuk `lib/bookingSubscribers.js` yang
 * dulu jadi satu-satunya pemanggil, sudah dihapus dari project
 * karena event BOOKING_CHECK_IN yang memicunya juga tidak pernah
 * di-emit di aplikasi yang berjalan. Fungsi ini sengaja tidak
 * dihapus total (hanya dikosongkan) untuk jaga-jaga kalau ada kode
 * lama di luar file ini yang belum ketemu masih mengimpornya.
 */
export function createOrderFromCheckIn() {
  console.warn('[orderStorage] createOrderFromCheckIn() sudah dihapus — gunakan orderAPI.create() / bookingAPI.checkIn().')
  return { success: false, order: null, error: 'createOrderFromCheckIn sudah dihapus — gunakan bookingAPI.checkIn().' }
}