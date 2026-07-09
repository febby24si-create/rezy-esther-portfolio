// ============================================================
// constants/statusConstants.js
//
// SINGLE SOURCE OF TRUTH — Status Booking dan Order
//
// Semua halaman (Bookings, Orders, Dashboard, TrackingStatus,
// komponen Badge) wajib mengimpor dari sini. Tidak boleh ada
// hardcode string status di halaman atau komponen manapun.
//
// PRINSIP ARSITEKTUR:
//   - BOOKING_STATUS  → lifecycle reservasi jadwal (pra-servis)
//   - ORDER_STATUS    → lifecycle transaksi servis aktual (post-check-in)
//   - Keduanya SEPENUHNYA TERPISAH. Booking bukan Order.
//
// INTEGRASI BACKEND:
//   Saat backend tersedia, enum ini cukup di-sync dengan
//   enum database (mis. Prisma enum, PostgreSQL CHECK constraint).
//   Tidak perlu perubahan di layer UI.
// ============================================================

// ─── BOOKING STATUS ─────────────────────────────────────────────────
// Lifecycle: reservasi jadwal yang dibuat customer sebelum datang.
// Order TIDAK dibuat di sini. Order dibuat saat CHECK_IN selesai.
//
// Urutan normal:
//   DRAFT → WAITING_CONFIRMATION → CONFIRMED → WAITING_CHECK_IN
//   → CHECKED_IN → (lanjut ke Order Module)
//
// Cabang abnormal:
//   WAITING_CONFIRMATION → REJECTED
//   CONFIRMED            → RESCHEDULED → CONFIRMED (ulang)
//   CONFIRMED            → CANCELLED_BY_CUSTOMER
//   WAITING_CHECK_IN     → NO_SHOW
//   WAITING_CONFIRMATION → EXPIRED (otomatis 24 jam tanpa aksi)
// ────────────────────────────────────────────────────────────────────
export const BOOKING_STATUS = {
  /** Customer mengisi form tapi belum submit (future: save draft) */
  DRAFT: 'Draft',

  /** Booking baru dibuat customer, menunggu aksi admin */
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi',

  /** Admin sudah ACC — masuk kalender bengkel */
  CONFIRMED: 'Dikonfirmasi',

  /** Admin jadwalkan ulang — customer perlu konfirmasi tanggal baru */
  RESCHEDULED: 'Dijadwalkan Ulang',

  /** Booking dikonfirmasi, menunggu customer datang pada hari H */
  WAITING_CHECK_IN: 'Menunggu Check In',

  /** Customer datang, check-in selesai, Order telah dibuat */
  CHECKED_IN: 'Check In',

  /** Customer tidak datang pada hari H */
  NO_SHOW: 'No Show',

  /** Customer batalkan sendiri sebelum hari H */
  CANCELLED_BY_CUSTOMER: 'Dibatalkan Customer',

  /** Admin tolak booking (kapasitas penuh, dll) */
  REJECTED: 'Ditolak',

  /** Booking tidak dikonfirmasi lebih dari 24 jam, otomatis hangus */
  EXPIRED: 'Expired',
}

// ─── ORDER STATUS ────────────────────────────────────────────────────
// Lifecycle: transaksi servis aktual, dibuat HANYA saat Check In.
// Booking hanya menjadi referensi (via bookingId field di order).
//
// Urutan normal:
//   INSPECTION → ESTIMATION → WAITING_APPROVAL → WORK_ORDER
//   → IN_PROGRESS → QC → READY_PICKUP → COMPLETED
//
// Cabang abnormal:
//   Semua stage → CANCELLED
// ────────────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  /** Mekanik sedang inspeksi kendaraan, mengisi job card */
  INSPECTION: 'Inspection',

  /** Service advisor membuat estimasi biaya berdasarkan hasil inspeksi */
  ESTIMATION: 'Estimasi',

  /** Estimasi sudah dikirim ke customer, menunggu persetujuan */
  WAITING_APPROVAL: 'Waiting Approval',

  /** Customer ACC estimasi, Work Order aktif dibuat */
  WORK_ORDER: 'Work Order',

  /** Mekanik sedang mengerjakan kendaraan */
  IN_PROGRESS: 'Sedang Dikerjakan',

  /** Pengerjaan selesai, menunggu quality control */
  QC: 'Quality Control',

  /** QC lulus, kendaraan siap diambil customer */
  READY_PICKUP: 'Siap Diambil',

  /** Pembayaran selesai, kendaraan diserahkan */
  COMPLETED: 'Selesai',

  /** Order dibatalkan di stage manapun */
  CANCELLED: 'Dibatalkan',
}

// ─── VISUAL CONFIG: BOOKING STATUS ──────────────────────────────────
// Digunakan oleh BookingStatusBadge, Dashboard, Bookings.jsx
// Mengikuti design token project (warna glassmorphism dark theme)
// ────────────────────────────────────────────────────────────────────
export const BOOKING_STATUS_CONFIG = {
  [BOOKING_STATUS.DRAFT]: {
    color: '#64748B',
    bg: 'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.25)',
    dot: '#64748B',
    label: 'Draft',
    variant: 'default',   // untuk Badge.jsx
    pulse: false,
  },
  [BOOKING_STATUS.WAITING_CONFIRMATION]: {
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.25)',
    dot: '#60A5FA',
    label: 'Menunggu Konfirmasi',
    variant: 'info',
    pulse: true,
  },
  [BOOKING_STATUS.CONFIRMED]: {
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.25)',
    dot: '#A78BFA',
    label: 'Dikonfirmasi',
    variant: 'purple',
    pulse: true,
  },
  [BOOKING_STATUS.RESCHEDULED]: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    dot: '#F59E0B',
    label: 'Dijadwalkan Ulang',
    variant: 'warning',
    pulse: true,
  },
  [BOOKING_STATUS.WAITING_CHECK_IN]: {
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.25)',
    dot: '#34D399',
    label: 'Menunggu Check In',
    variant: 'success',
    pulse: true,
  },
  [BOOKING_STATUS.CHECKED_IN]: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    dot: '#22C55E',
    label: 'Check In',
    variant: 'success',
    pulse: false,
  },
  [BOOKING_STATUS.NO_SHOW]: {
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.12)',
    border: 'rgba(251,146,60,0.25)',
    dot: '#FB923C',
    label: 'No Show',
    variant: 'orange',
    pulse: false,
  },
  [BOOKING_STATUS.CANCELLED_BY_CUSTOMER]: {
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)',
    dot: '#94A3B8',
    label: 'Dibatalkan Customer',
    variant: 'default',
    pulse: false,
  },
  [BOOKING_STATUS.REJECTED]: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    dot: '#EF4444',
    label: 'Ditolak',
    variant: 'danger',
    pulse: false,
  },
  [BOOKING_STATUS.EXPIRED]: {
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.2)',
    dot: '#6B7280',
    label: 'Expired',
    variant: 'default',
    pulse: false,
  },
}

// ─── VISUAL CONFIG: ORDER STATUS ─────────────────────────────────────
// Meng-extend STATUS yang ada di Orders.jsx — saat migration
// dilakukan, Orders.jsx cukup mengimpor dari sini.
// ────────────────────────────────────────────────────────────────────
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.INSPECTION]: {
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.25)',
    dot: '#60A5FA',
    label: 'Inspeksi',
    variant: 'info',
    pulse: true,
  },
  [ORDER_STATUS.ESTIMATION]: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    dot: '#F59E0B',
    label: 'Estimasi',
    variant: 'warning',
    pulse: true,
  },
  [ORDER_STATUS.WAITING_APPROVAL]: {
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.12)',
    border: 'rgba(251,146,60,0.25)',
    dot: '#FB923C',
    label: 'Waiting Approval',
    variant: 'orange',
    pulse: true,
  },
  [ORDER_STATUS.WORK_ORDER]: {
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.25)',
    dot: '#A78BFA',
    label: 'Work Order',
    variant: 'purple',
    pulse: true,
  },
  [ORDER_STATUS.IN_PROGRESS]: {
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.3)',
    dot: '#FBBF24',
    label: 'Sedang Dikerjakan',
    variant: 'warning',
    pulse: true,
  },
  [ORDER_STATUS.QC]: {
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.25)',
    dot: '#34D399',
    label: 'Quality Control',
    variant: 'success',
    pulse: true,
  },
  [ORDER_STATUS.READY_PICKUP]: {
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.25)',
    dot: '#4ADE80',
    label: 'Siap Diambil',
    variant: 'success',
    pulse: true,
  },
  [ORDER_STATUS.COMPLETED]: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    dot: '#22C55E',
    label: 'Selesai',
    variant: 'success',
    pulse: false,
  },
  [ORDER_STATUS.CANCELLED]: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    dot: '#EF4444',
    label: 'Dibatalkan',
    variant: 'danger',
    pulse: false,
  },
}

// ─── STATUS GROUPING HELPERS ─────────────────────────────────────────
// Digunakan untuk filter, dashboard KPI, dan business rule.
// ────────────────────────────────────────────────────────────────────

/** Status booking yang masih aktif (belum selesai/batal/hangus) */
export const BOOKING_ACTIVE_STATUSES = [
  BOOKING_STATUS.WAITING_CONFIRMATION,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.RESCHEDULED,
  BOOKING_STATUS.WAITING_CHECK_IN,
]

/** Status booking yang sudah terminal (tidak berubah lagi) */
export const BOOKING_TERMINAL_STATUSES = [
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.NO_SHOW,
  BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
  BOOKING_STATUS.REJECTED,
  BOOKING_STATUS.EXPIRED,
]

/** Status booking yang perlu aksi admin segera */
export const BOOKING_NEEDS_ACTION_STATUSES = [
  BOOKING_STATUS.WAITING_CONFIRMATION,
  BOOKING_STATUS.RESCHEDULED,
]

/** Status order yang masih aktif */
export const ORDER_ACTIVE_STATUSES = [
  ORDER_STATUS.INSPECTION,
  ORDER_STATUS.ESTIMATION,
  ORDER_STATUS.WAITING_APPROVAL,
  ORDER_STATUS.WORK_ORDER,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.QC,
  ORDER_STATUS.READY_PICKUP,
]

/** Status order terminal */
export const ORDER_TERMINAL_STATUSES = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
]

// ─── STATUS TRANSITION RULES ─────────────────────────────────────────
// Validasi transisi status yang legal. Digunakan oleh
// bookingService.js dan orderService.js (Sprint 4).
// Format: { [currentStatus]: allowedNextStatuses[] }
// ────────────────────────────────────────────────────────────────────
export const BOOKING_TRANSITIONS = {
  [BOOKING_STATUS.DRAFT]: [
    BOOKING_STATUS.WAITING_CONFIRMATION,
  ],
  [BOOKING_STATUS.WAITING_CONFIRMATION]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.REJECTED,
    BOOKING_STATUS.EXPIRED,
  ],
  [BOOKING_STATUS.CONFIRMED]: [
    BOOKING_STATUS.WAITING_CHECK_IN,
    BOOKING_STATUS.RESCHEDULED,
    BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
  ],
  [BOOKING_STATUS.RESCHEDULED]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
  ],
  [BOOKING_STATUS.WAITING_CHECK_IN]: [
    BOOKING_STATUS.CHECKED_IN,
    BOOKING_STATUS.NO_SHOW,
    BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
  ],
  // Terminal — tidak ada transisi lagi
  [BOOKING_STATUS.CHECKED_IN]: [],
  [BOOKING_STATUS.NO_SHOW]: [],
  [BOOKING_STATUS.CANCELLED_BY_CUSTOMER]: [],
  [BOOKING_STATUS.REJECTED]: [],
  [BOOKING_STATUS.EXPIRED]: [],
}

export const ORDER_TRANSITIONS = {
  [ORDER_STATUS.INSPECTION]: [
    ORDER_STATUS.ESTIMATION,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.ESTIMATION]: [
    ORDER_STATUS.WAITING_APPROVAL,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.WAITING_APPROVAL]: [
    ORDER_STATUS.WORK_ORDER,
    ORDER_STATUS.ESTIMATION, // revisi estimasi
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.WORK_ORDER]: [
    ORDER_STATUS.IN_PROGRESS,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.IN_PROGRESS]: [
    ORDER_STATUS.QC,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.QC]: [
    ORDER_STATUS.READY_PICKUP,
    ORDER_STATUS.IN_PROGRESS, // QC gagal, kembali dikerjakan
  ],
  [ORDER_STATUS.READY_PICKUP]: [
    ORDER_STATUS.COMPLETED,
  ],
  // Terminal
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
}

// ─── LABEL HELPERS ───────────────────────────────────────────────────
/** Ambil label display untuk booking status */
export function getBookingStatusLabel(status) {
  return BOOKING_STATUS_CONFIG[status]?.label ?? status
}

/** Ambil label display untuk order status */
export function getOrderStatusLabel(status) {
  return ORDER_STATUS_CONFIG[status]?.label ?? status
}

/** Validasi apakah transisi booking status legal */
export function isValidBookingTransition(from, to) {
  return BOOKING_TRANSITIONS[from]?.includes(to) ?? false
}

/** Validasi apakah transisi order status legal */
export function isValidOrderTransition(from, to) {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false
}

// ─── PAYMENT STATUS ──────────────────────────────────────────────────
// Lifecycle pembayaran, TERPISAH dari ORDER_STATUS (lifecycle servis).
// Satu order bisa "Sedang Dikerjakan" tapi sudah "Lunas" (bayar di muka),
// atau "Selesai" tapi masih "DP" (ambil kendaraan, lunasi belakangan).
//
// Field terkait di tabel `orders` (Supabase):
//   payment_status  text   default 'Belum Bayar'
//   paid_amount     numeric default 0
// ────────────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  UNPAID:   'Belum Bayar',
  PARTIAL:  'DP',
  PAID:     'Lunas',
}

export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS)

export const PAYMENT_STATUS_CONFIG = {
  [PAYMENT_STATUS.UNPAID]: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    dot: '#EF4444',
    label: 'Belum Bayar',
    variant: 'danger',
  },
  [PAYMENT_STATUS.PARTIAL]: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    dot: '#F59E0B',
    label: 'DP',
    variant: 'warning',
  },
  [PAYMENT_STATUS.PAID]: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    dot: '#22C55E',
    label: 'Lunas',
    variant: 'success',
  },
}

/** Ambil label display untuk payment status (fallback ke 'Belum Bayar') */
export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_CONFIG[status]?.label ?? PAYMENT_STATUS.UNPAID
}

/** Hitung sisa tagihan berdasarkan total order & jumlah yang sudah dibayar */
export function calcSisaTagihan(total, paidAmount) {
  const sisa = Number(total || 0) - Number(paidAmount || 0)
  return sisa > 0 ? sisa : 0
}

/**
 * Resolusi payment status dari total & paidAmount — dipakai untuk
 * menjaga konsistensi (mis. saat paidAmount di-update manual, status
 * ikut disesuaikan otomatis alih-alih dua field yang bisa saling kontradiksi).
 */
export function resolvePaymentStatus(total, paidAmount) {
  const t = Number(total || 0)
  const p = Number(paidAmount || 0)
  if (p <= 0) return PAYMENT_STATUS.UNPAID
  if (p >= t && t > 0) return PAYMENT_STATUS.PAID
  return PAYMENT_STATUS.PARTIAL
}