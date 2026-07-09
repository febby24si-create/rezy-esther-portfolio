// ============================================================
// lib/workflowEngine.js
//
// WORKFLOW ENGINE — Order Lifecycle Stages
//
// Menangani transisi status order melalui tahapan:
//   Menunggu → Inspection → Estimasi → Waiting Approval
//   → Work Order → Sedang Dikerjakan → QC → Siap Diambil
//   → Selesai
//
// PRINSIP:
//   - Semua write ke garage_orders melalui updateOrder() dari orderStorage.js
//   - Estimasi disimpan sebagai sub-dokumen dalam order (estimasi field)
//   - Approval status disimpan dalam order (approvalStatus field)
//   - Inspection checklist disimpan dalam order (inspection field)
//   - Semua operasi mengembalikan { success, order, error }
//
// STATUS MAPPING (Orders.jsx STATUS ↔ workflow stages):
//   'Menunggu'          → order baru setelah check-in, siap inspeksi
//   'Sedang Dikerjakan' → work order aktif, mekanik bekerja
//   'Selesai'           → completed, poin loyalty diberikan
//   'Dibatalkan'        → cancelled
//
//   Tahapan workflow baru (disimpan di order.workflowStage):
//   'inspection'        → mekanik isi checklist
//   'estimation'        → service advisor buat estimasi
//   'waiting_approval'  → menunggu approval customer
//   'work_order'        → WO aktif, estimasi di-ACC
//   'qc'               → quality control
//   'ready_pickup'      → siap diambil
//
// CATATAN KOMPATIBILITAS:
//   Orders.jsx menggunakan field 'status' untuk display dan filter.
//   workflowStage adalah metadata tambahan yang tidak breaking change.
//   Status 'Sedang Dikerjakan' di-set saat masuk work_order stage.
//   Status 'Selesai' di-set saat QC pass + payment done.
// ============================================================

import { updateOrder, getOrderById } from './orderStorage'
import { emit, ORDER_EVENTS } from './orderEvents'

// ─── WORKFLOW STAGES ─────────────────────────────────────────
export const WORKFLOW_STAGE = {
  PENDING:          'pending',          // Menunggu mekanik assign
  INSPECTION:       'inspection',       // Inspeksi kendaraan
  ESTIMATION:       'estimation',       // Buat estimasi biaya
  WAITING_APPROVAL: 'waiting_approval', // Menunggu approval customer
  WORK_ORDER:       'work_order',       // WO aktif, pengerjaan
  QC:               'qc',              // Quality control
  READY_PICKUP:     'ready_pickup',     // Siap diambil
  COMPLETED:        'completed',        // Selesai, poin diberikan
  CANCELLED:        'cancelled',        // Dibatalkan
}

export const APPROVAL_STATUS = {
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  REVISION:  'revision_requested',
}

// ─── INSPECTION CHECKLIST TEMPLATE ──────────────────────────
export const INSPECTION_CHECKLIST = [
  // Eksterior
  { id: 'body_condition',   category: 'Eksterior',  label: 'Kondisi Bodi (penyok/lecet)' },
  { id: 'glass_condition',  category: 'Eksterior',  label: 'Kondisi Kaca' },
  { id: 'tire_condition',   category: 'Eksterior',  label: 'Kondisi Ban (keausan, tekanan)' },
  { id: 'lights_exterior',  category: 'Eksterior',  label: 'Lampu Eksterior' },
  // Mesin
  { id: 'engine_oil',       category: 'Mesin',      label: 'Level & Kondisi Oli Mesin' },
  { id: 'coolant',          category: 'Mesin',      label: 'Air Radiator / Coolant' },
  { id: 'brake_fluid',      category: 'Mesin',      label: 'Minyak Rem' },
  { id: 'battery',          category: 'Mesin',      label: 'Kondisi Aki' },
  { id: 'belt_condition',   category: 'Mesin',      label: 'V-Belt / Timing Belt' },
  { id: 'air_filter',       category: 'Mesin',      label: 'Filter Udara' },
  // Kaki-kaki
  { id: 'brake_pad',        category: 'Kaki-kaki',  label: 'Ketebalan Kampas Rem' },
  { id: 'suspension',       category: 'Kaki-kaki',  label: 'Suspensi & Shock Absorber' },
  { id: 'steering',         category: 'Kaki-kaki',  label: 'Kemudi & Power Steering' },
  // Interior
  { id: 'ac_system',        category: 'Interior',   label: 'Sistem AC' },
  { id: 'dashboard_lights', category: 'Interior',   label: 'Lampu Indikator Dashboard' },
  { id: 'wipers',           category: 'Interior',   label: 'Wiper' },
  { id: 'horn',             category: 'Interior',   label: 'Klakson' },
]

export const INSPECTION_STATUS = {
  OK:        'ok',
  ATTENTION: 'attention',
  REPLACE:   'replace',
  SKIPPED:   '-',
}

// ─── QC CHECKLIST TEMPLATE ───────────────────────────────────
export const QC_CHECKLIST = [
  { id: 'service_complete',  label: 'Semua pekerjaan dalam WO selesai' },
  { id: 'parts_installed',   label: 'Semua parts baru terpasang dengan benar' },
  { id: 'tools_cleared',     label: 'Tidak ada tools tertinggal di kendaraan' },
  { id: 'fluid_levels',      label: 'Level cairan (oli, radiator, rem) sudah benar' },
  { id: 'test_drive',        label: 'Test drive / uji fungsi sudah dilakukan' },
  { id: 'no_warning_lights', label: 'Tidak ada lampu peringatan menyala' },
  { id: 'cleanliness',       label: 'Kendaraan bersih (interior & eksterior)' },
  { id: 'customer_items',    label: 'Barang customer tidak ada yang hilang' },
]

// ─── HELPERS ─────────────────────────────────────────────────
function ok(order)  { return { success: true,  order, error: null } }
function fail(msg)  { return { success: false, order: null, error: msg } }
function now()      { return new Date().toISOString() }

async function getOrder(orderId) {
  return await getOrderById(orderId)
}

// ─── STAGE TRANSITIONS ───────────────────────────────────────

/**
 * Mulai inspeksi — admin/mekanik memulai pengisian checklist.
 * Status order tetap 'Menunggu', workflowStage berubah ke 'inspection'.
 */
export async function startInspection(orderId, { startedBy = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  // Inisialisasi checklist kosong jika belum ada
  const inspectionData = order.inspection || {
    items:       INSPECTION_CHECKLIST.map(item => ({ ...item, result: INSPECTION_STATUS.SKIPPED, notes: '' })),
    startedBy,
    startedAt:   now(),
    completedAt: null,
    notes:       '',
  }

  return await updateOrder(orderId, {
    workflowStage: WORKFLOW_STAGE.INSPECTION,
    inspection:    inspectionData,
    stageHistory:  [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.INSPECTION, at: now(), by: startedBy }],
  })
}

/**
 * Simpan hasil inspeksi dan lanjut ke stage Estimasi.
 *
 * @param {string} orderId
 * @param {object[]} items - array checklist items dengan result & notes
 * @param {string} notes   - catatan umum inspeksi
 * @param {string} by      - nama mekanik/admin
 */
export async function completeInspection(orderId, { items, notes = '', by = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  const inspection = {
    ...(order.inspection || {}),
    items:       items || order.inspection?.items || [],
    notes,
    completedAt: now(),
    completedBy: by,
  }

  return await updateOrder(orderId, {
    workflowStage: WORKFLOW_STAGE.ESTIMATION,
    inspection,
    stageHistory: [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.ESTIMATION, at: now(), by }],
  })
}

/**
 * Buat / update estimasi biaya.
 * Estimasi disimpan sebagai sub-dokumen dalam order.
 * Status order tetap 'Menunggu' sampai ACC customer.
 *
 * @param {string} orderId
 * @param {object} estimasiData
 * @param {object[]} estimasiData.items     - [{ description, qty, unit, unitPrice, total }]
 * @param {number}   estimasiData.laborCost - biaya jasa
 * @param {number}   estimasiData.discount  - diskon (Rp)
 * @param {string}   estimasiData.notes     - catatan untuk customer
 * @param {string}   by
 */
export async function saveEstimation(orderId, { items = [], laborCost = 0, discount = 0, notes = '', by = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  const partsCost    = items.reduce((sum, i) => sum + (i.total || 0), 0)
  const subtotal     = partsCost + laborCost
  const grandTotal   = Math.max(0, subtotal - discount)

  const estimasi = {
    items,
    laborCost,
    partsCost,
    discount,
    subtotal,
    grandTotal,
    notes,
    createdBy:   by,
    createdAt:   order.estimasi?.createdAt || now(),
    updatedAt:   now(),
    version:     (order.estimasi?.version || 0) + 1,
  }

  return await updateOrder(orderId, {
    workflowStage:  WORKFLOW_STAGE.WAITING_APPROVAL,
    estimasi,
    total:          grandTotal, // update total di order untuk display
    approvalStatus: APPROVAL_STATUS.PENDING,
    stageHistory:   [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.WAITING_APPROVAL, at: now(), by }],
  })
}

/**
 * Customer approve estimasi.
 * Status order berubah ke 'Sedang Dikerjakan', stage ke 'work_order'.
 */
export async function approveEstimation(orderId, { approvedBy = 'Customer', notes = '' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)
  if (!order.estimasi) return fail('Estimasi belum dibuat.')

  return await updateOrder(orderId, {
    workflowStage:  WORKFLOW_STAGE.WORK_ORDER,
    status:         'Sedang Dikerjakan',
    approvalStatus: APPROVAL_STATUS.APPROVED,
    approvedAt:     now(),
    approvedBy,
    approvalNotes:  notes,
    stageHistory:   [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.WORK_ORDER, at: now(), by: approvedBy }],
  })
}

/**
 * Customer minta revisi estimasi.
 * Stage kembali ke 'estimation', approvalStatus = 'revision_requested'.
 */
export async function requestEstimationRevision(orderId, { reason = '', by = 'Customer' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  return await updateOrder(orderId, {
    workflowStage:   WORKFLOW_STAGE.ESTIMATION,
    approvalStatus:  APPROVAL_STATUS.REVISION,
    revisionReason:  reason,
    revisionAt:      now(),
    stageHistory:    [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.ESTIMATION, at: now(), by, note: `Revisi: ${reason}` }],
  })
}

/**
 * Mulai QC setelah pengerjaan selesai.
 */
export async function startQC(orderId, { by = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  const qcData = order.qc || {
    items:       QC_CHECKLIST.map(item => ({ ...item, passed: false, notes: '' })),
    startedBy:   by,
    startedAt:   now(),
    completedAt: null,
    passed:      null,
    notes:       '',
  }

  return await updateOrder(orderId, {
    workflowStage: WORKFLOW_STAGE.QC,
    qc:            qcData,
    stageHistory:  [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.QC, at: now(), by }],
  })
}

/**
 * Selesaikan QC. Jika pass → status 'Siap Diambil'.
 * Jika fail → kembali ke 'Sedang Dikerjakan' untuk perbaikan.
 */
export async function completeQC(orderId, { items, passed, notes = '', by = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  const qc = {
    ...(order.qc || {}),
    items:       items || order.qc?.items || [],
    passed,
    notes,
    completedAt: now(),
    completedBy: by,
  }

  if (passed) {
    return await updateOrder(orderId, {
      workflowStage: WORKFLOW_STAGE.READY_PICKUP,
      status:        'Siap Diambil',
      qc,
      stageHistory:  [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.READY_PICKUP, at: now(), by }],
    })
  } else {
    // QC gagal — kembali ke pengerjaan
    return await updateOrder(orderId, {
      workflowStage: WORKFLOW_STAGE.WORK_ORDER,
      status:        'Sedang Dikerjakan',
      qc,
      stageHistory:  [...(order.stageHistory || []), { stage: WORKFLOW_STAGE.WORK_ORDER, at: now(), by, note: 'QC gagal, kembali dikerjakan' }],
    })
  }
}

/**
 * Selesaikan order setelah pembayaran diterima.
 * Ini adalah TITIK AKHIR workflow order.
 *
 * EFEK:
 *   - workflowStage: COMPLETED, status: 'Selesai'
 *   - finalTotal disimpan (dari kasir, bukan estimasi)
 *   - payment info disimpan
 *   - Emit ORDER_COMPLETED → orderSubscribers:
 *       → applyOrderCompletedLoyalty() (poin, tier, voucher)
 *       → deductStockForOrder()
 *       → updateMechanicActiveOrders()
 *
 * @param {string} orderId
 * @param {object} opts
 * @param {number}  opts.finalTotal   - total yang benar-benar dibayar
 * @param {string}  opts.paymentMethod - 'cash' | 'transfer' | 'qris' | 'debit' | 'kredit'
 * @param {number}  [opts.amountPaid]  - uang yang diserahkan customer (untuk hitung kembalian)
 * @param {number}  [opts.discount]    - diskon tambahan dari kasir
 * @param {string}  [opts.by]          - nama kasir
 * @returns {{ success: boolean, order: object|null, error: string|null }}
 */
export async function completeOrder(orderId, {
  finalTotal,
  paymentMethod = 'cash',
  amountPaid    = null,
  discount      = 0,
  by            = 'Admin',
} = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  if (order.workflowStage !== WORKFLOW_STAGE.READY_PICKUP) {
    return fail(`Order belum siap diambil. Status saat ini: ${order.workflowStage}`)
  }

  const change = amountPaid != null ? Math.max(0, amountPaid - finalTotal) : 0

  const payment = {
    finalTotal,
    paymentMethod,
    amountPaid:  amountPaid ?? finalTotal,
    change,
    discount,
    paidAt:      now(),
    paidBy:      by,
  }

  const result = await updateOrder(orderId, {
    workflowStage: WORKFLOW_STAGE.COMPLETED,
    status:        'Selesai',
    finalTotal,
    payment,
    paymentStatus: 'Lunas',
    paidAmount:    finalTotal,
    stageHistory:  [
      ...(order.stageHistory || []),
      { stage: WORKFLOW_STAGE.COMPLETED, at: now(), by, note: `Bayar ${paymentMethod} ${finalTotal}` },
    ],
  })

  if (!result.success) return result

  // ── Poin loyalty & notifikasi ────────────────────────────────
  // CATATAN MIGRASI (update): saat kode ini pertama ditulis,
  // orderSubscribers.js (lib/loyaltyEngine.js) masih sessionStorage,
  // jadi poin diberikan LANGSUNG di sini sebagai workaround. Sekarang
  // lib/loyaltyEngine.js SUDAH dimigrasikan ke Supabase juga — kalau
  // pemberian poin tetap dilakukan di sini DAN lewat emit() di bawah,
  // customer akan dapat poin DUA KALI untuk satu order yang sama.
  //
  // Jadi sekarang pemberian poin (+ tier-up voucher & voucher
  // after-service, yang tidak ada di versi inline sebelumnya) HANYA
  // lewat satu jalur: subscriber ORDER_COMPLETED di orderSubscribers.js,
  // dipicu oleh emit() di bawah. Fungsi ini hanya bertanggung jawab
  // menyelesaikan order-nya sendiri.

  // Event lama tetap di-emit — sekarang ini BUKAN lagi kompatibilitas
  // kosong, melainkan jalur aktif untuk loyalty (poin, tier-up voucher,
  // voucher after-service), pelepasan mekanik, dan deduksi stok — lihat
  // lib/orderSubscribers.js.
  emit(ORDER_EVENTS.ORDER_COMPLETED, { order: result.order })

  return result
}

/**
 * Tandai mekanik mulai mengerjakan (transisi WORK_ORDER → IN_PROGRESS).
 * Opsional — mekanik bisa langsung ke QC tanpa tahap ini.
 *
 * @param {string} orderId
 * @param {object} opts
 * @param {string} opts.by
 */
export async function startWork(orderId, { by = 'Admin' } = {}) {
  const order = await getOrder(orderId)
  if (!order) return fail(`Order ${orderId} tidak ditemukan.`)

  return await updateOrder(orderId, {
    workflowStage: WORKFLOW_STAGE.WORK_ORDER,
    status:        'Sedang Dikerjakan',
    workStartedAt: now(),
    workStartedBy: by,
    stageHistory:  [
      ...(order.stageHistory || []),
      { stage: 'in_progress', at: now(), by },
    ],
  })
}