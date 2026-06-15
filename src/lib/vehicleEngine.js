// ============================================================
// lib/vehicleEngine.js
//
// PHASE 3 — Resolusi order.vehicle (string) -> vehicleId
//
// Sebelumnya, order.vehicle disimpan sebagai string gabungan
// "{brand} {model} - {plate}" (lihat BookingService.jsx,
// Orders.jsx FormModal). Setiap fitur yang ingin tahu "kendaraan
// apa ini" harus split(' - ') dan mengasumsikan format ini stabil
// -- rapuh terhadap perubahan format/brand yang mengandung ' - '.
//
// Fix (additive): tambahkan field order.vehicleId yang merujuk ke
// entitas Vehicle di garage_vehicles (yang sejak Phase 1 fix sudah
// berisi MERGE dari vehiclesData.json seed + sync booking, dedup
// by plate -- lihat pages/Vehicles.jsx loadVehicles()).
//
// Resolusi dilakukan dengan extract plate dari string
// "{brand} {model} - {plate}" (asumsi plate selalu di posisi
// terakhir setelah ' - ', sesuai format yang ditulis BookingService
// & Orders.jsx FormModal saat ini), lalu match by normalized plate.
//
// order.vehicle (string) TETAP DIPERTAHANKAN sebagai
// `vehicleDisplay` fallback -- additive migration, tidak menghapus
// field lama (sesuai instruksi RELATION MIGRATION).
// ============================================================

import vehiclesDataSeed from '../data/vehiclesData.json'

const LS_KEY_VEHICLES = 'garage_vehicles'

function normalizePlate(plate) {
  return (plate || '').toUpperCase().replace(/\s+/g, ' ').trim()
}

/**
 * Baca daftar vehicle gabungan (seed + garage_vehicles), mengikuti
 * pola merge-by-plate yang sama dengan pages/Vehicles.jsx
 * loadVehicles() (Phase 1 fix).
 */
function loadAllVehicles() {
  try {
    const raw = localStorage.getItem(LS_KEY_VEHICLES)
    if (raw) {
      const stored = JSON.parse(raw)
      const storedPlates = new Set(stored.map(v => normalizePlate(v.plate)))
      const seedRemaining = vehiclesDataSeed.filter(
        v => !storedPlates.has(normalizePlate(v.plate))
      )
      return [...seedRemaining, ...stored]
    }
  } catch { /* ignore */ }
  return vehiclesDataSeed
}

/**
 * Extract plate dari string order.vehicle, format
 * "{brand} {model} - {plate}".
 *
 * Mengambil bagian SETELAH ' - ' TERAKHIR -- lebih aman daripada
 * split(' - ')[1] jika brand/model mengandung ' - ' (meski tidak
 * terjadi di data saat ini, ini lebih robust).
 *
 * @param {string} vehicleDisplay
 * @returns {string|null}
 */
export function extractPlateFromDisplay(vehicleDisplay) {
  if (!vehicleDisplay) return null
  const idx = vehicleDisplay.lastIndexOf(' - ')
  if (idx === -1) return null
  return vehicleDisplay.slice(idx + 3).trim()
}

/**
 * Resolve order.vehicle (string display) -> vehicleId.
 *
 * @param {object} orderData - order yang punya field `vehicle` (string)
 *                              dan/atau `vehicleId` (jika sudah ada)
 * @returns {string|null} vehicleId, atau null jika tidak match
 */
export function resolveVehicleId(orderData) {
  if (orderData.vehicleId) return orderData.vehicleId

  const plate = extractPlateFromDisplay(orderData.vehicle)
  if (!plate) return null

  const vehicles = loadAllVehicles()
  const match = vehicles.find(v => normalizePlate(v.plate) === normalizePlate(plate))
  return match ? match.id : null
}

/**
 * Baca semua vehicle (read-only helper untuk modul lain yang butuh
 * lookup vehicleId -> detail kendaraan, mis. Reports/CustomerDetail
 * di Phase 4).
 */
export function getAllVehicles() {
  return loadAllVehicles()
}