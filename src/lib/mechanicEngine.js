// ============================================================
// lib/mechanicEngine.js
//
// PHASE 2 — Mechanic status sebagai derived state (Rule 5)
//
// Sebelumnya, mechanic.status ('Tersedia'/'Sibuk') di-set MANUAL
// oleh admin lewat dropdown di Mechanics.jsx, sama sekali tidak
// terhubung dengan order yang sedang ditangani mekanik tersebut.
//
// Fix: mechanic.status sekarang DI-DERIVE dari activeOrderIds:
//   - activeOrderIds.length > 0  -> status = 'busy'
//   - activeOrderIds.length === 0 -> status = 'available'
//
// activeOrderIds diupdate oleh subscriber ORDER_CONFIRMED (tambah),
// ORDER_COMPLETED (kurang), ORDER_CANCELLED (kurang).
//
// Catatan: status lama ('Tersedia'/'Sibuk', Bahasa Indonesia) masih
// dipertahankan sebagai field terpisah untuk kompatibilitas tampilan
// existing (Mechanics.jsx, Vehicles.jsx, Reports.jsx, Dashboard.jsx
// semua menampilkan label ini) -- additive migration. Field baru
// `status` (english: 'available'/'busy'/'off') ditambahkan
// berdampingan, dan `statusLabel` di-derive untuk tampilan lama.
//
// File ini bergantung pada garage_mechanics yang PERSISTEN sejak
// Phase 1 fix #1 (Mechanics.jsx sekarang menulis ke key ini).
// ============================================================

const LS_KEY_MECHANICS = 'garage_mechanics'

function loadMechanics() {
  try {
    const raw = localStorage.getItem(LS_KEY_MECHANICS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveMechanics(list) {
  try {
    localStorage.setItem(LS_KEY_MECHANICS, JSON.stringify(list))
  } catch { /* ignore */ }
}

/**
 * Derive label status lama (Bahasa Indonesia, dipakai existing UI)
 * dari jumlah activeOrderIds.
 */
function deriveStatusLabel(activeOrderIds) {
  return (activeOrderIds && activeOrderIds.length > 0) ? 'Sibuk' : 'Tersedia'
}

/**
 * Derive status baru (english enum, dipakai domain model baru)
 * dari jumlah activeOrderIds.
 */
function deriveStatus(activeOrderIds) {
  return (activeOrderIds && activeOrderIds.length > 0) ? 'busy' : 'available'
}

/**
 * Tambah/hapus orderId dari activeOrderIds mekanik, lalu re-derive
 * status & statusLabel.
 *
 * @param {string} mechanicId
 * @param {string} orderId
 * @param {'add'|'remove'} action
 * @returns {{ success: boolean, message?: string }}
 */
export function updateMechanicActiveOrders(mechanicId, orderId, action) {
  if (!mechanicId || !orderId) {
    return { success: false, message: 'mechanicId/orderId kosong.' }
  }

  const mechanics = loadMechanics()
  const idx = mechanics.findIndex(m => m.id === mechanicId)
  if (idx === -1) {
    return { success: false, message: `Mechanic ${mechanicId} tidak ditemukan di garage_mechanics.` }
  }

  const current = mechanics[idx]
  let activeOrderIds = Array.isArray(current.activeOrderIds) ? [...current.activeOrderIds] : []

  if (action === 'add') {
    if (!activeOrderIds.includes(orderId)) activeOrderIds.push(orderId)
  } else if (action === 'remove') {
    activeOrderIds = activeOrderIds.filter(id => id !== orderId)
  } else {
    return { success: false, message: `Action tidak dikenal: ${action}` }
  }

  mechanics[idx] = {
    ...current,
    activeOrderIds,
    status: deriveStatus(activeOrderIds),
    // statusLabel: kompatibilitas dengan UI lama (Mechanics.jsx,
    // Vehicles.jsx, dll yang menampilkan 'Tersedia'/'Sibuk').
    // Field `status` lama (Bahasa Indonesia) dipertahankan agar
    // tidak merusak rendering existing -- additive migration.
    statusLabel: deriveStatusLabel(activeOrderIds),
  }

  saveMechanics(mechanics)
  return { success: true }
}

/**
 * Baca daftar mekanik beserta status derived terkini.
 * Read-only helper untuk Reports/Dashboard/Orders autocomplete.
 *
 * @returns {Array}
 */
export function getAllMechanics() {
  return loadMechanics()
}