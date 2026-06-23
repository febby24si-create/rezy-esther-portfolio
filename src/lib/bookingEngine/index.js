// ============================================================
// lib/bookingEngine/index.js
//
// PUBLIC API — Booking Engine
//
// Semua import dari luar module ini harus melalui file ini.
// Jangan pernah import langsung dari sub-file:
//
//   ✅ import { submitBooking } from '../lib/bookingEngine'
//   ❌ import { submitBooking } from '../lib/bookingEngine/bookingService'
//
// Ini memudahkan refactor internal tanpa mengubah import
// di seluruh codebase.
// ============================================================

// ─── CONSTANTS ───────────────────────────────────────────────
// Re-export dari statusConstants agar consumer tidak perlu
// tahu di mana konstanta Booking didefinisikan.
export {
  BOOKING_STATUS,
  BOOKING_STATUS_CONFIG,
  BOOKING_ACTIVE_STATUSES,
  BOOKING_TERMINAL_STATUSES,
  BOOKING_NEEDS_ACTION_STATUSES,
  BOOKING_TRANSITIONS,
  getBookingStatusLabel,
  isValidBookingTransition,
} from '../../constants/statusConstants'

// ─── EVENTS ──────────────────────────────────────────────────
export {
  BOOKING_EVENTS,
  emitBooking,
  subscribeBooking,
} from './bookingEvents'

// ─── STORAGE (READ-ONLY untuk consumer luar) ─────────────────
// Write operations dikapsulasi di bookingService.js — consumer
// tidak boleh menulis langsung ke storage.
export {
  getAllBookings,
  getBookingById,
  getBookingsByCustomer,
  getBookingsByDate,
  getBookingsByDateRange,
  getBookingsByStatus,
  getBookingStats,
} from './bookingStorage'

// ─── SERVICE (BUSINESS OPERATIONS) ───────────────────────────
export {
  submitBooking,
  confirmBooking,
  rejectBooking,
  rescheduleBooking,
  cancelBookingByCustomer,
  markNoShow,
  setWaitingCheckIn,
  checkIn,
  expireStaleBookings,
} from './bookingService'

// ─── VALIDATION (untuk form UI) ──────────────────────────────
export {
  BOOKING_RULES,
  checkDateValid,
  checkHoliday,
  checkSlotAvailable,
  checkDuplicateBooking,
  checkMechanicCapacity,
  checkVehicleConflict,
  validateNewBooking,
  validateReschedule,
} from './bookingValidation'
