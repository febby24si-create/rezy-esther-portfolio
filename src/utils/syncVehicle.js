// ============================================================
// syncVehicle.js
// Sinkronisasi kendaraan dari booking customer ke tabel `vehicles`
// di Supabase, agar admin dapat melihatnya di halaman Vehicles.
//
// MIGRASI: sebelumnya menulis ke sessionStorage('garage_vehicles').
// Sejak Vehicles.jsx (admin) pindah ke Supabase lewat vehicleAPI,
// fungsi ini HARUS ikut pindah — kalau tidak, kendaraan yang
// didaftarkan customer lewat form booking akan "menghilang" (tidak
// pernah muncul di halaman admin), padahal sebelumnya (waktu
// Vehicles.jsx masih sessionStorage) fungsi ini benar-benar berefek.
// ============================================================

import { vehicleAPI } from '../services/vehicleAPI'

function normalizePlate(plate) {
  return (plate || '').toUpperCase().replace(/\s+/g, ' ').trim()
}

/**
 * Tambahkan atau update kendaraan customer ke tabel `vehicles` Supabase.
 * Dicocokkan berdasarkan plat nomor (dinormalisasi).
 *
 * @param {object} vehicle  — data kendaraan dari form booking (brand, model,
 *                            year, plate, type, km, photo, dst)
 * @param {object} customer — data customer (id, name)
 * @returns {Promise<string|number|null>} id kendaraan yang tersimpan di Supabase
 */
export async function syncCustomerVehicle(vehicle, customer) {
  const normalizedPlate = normalizePlate(vehicle.plate)
  if (!normalizedPlate) return null

  try {
    const existingList = await vehicleAPI.fetchAll()
    const existing = (existingList || []).find(
      v => normalizePlate(v.plate) === normalizedPlate
    )

    const payload = {
      plate:        normalizedPlate,
      brand:        vehicle.brand || undefined,
      model:        vehicle.model || undefined,
      year:         vehicle.year ? Number(vehicle.year) : undefined,
      color:        vehicle.color || undefined,
      type:         (vehicle.type || '').toLowerCase() === 'motor' ? 'Motor' : 'Mobil',
      km:           vehicle.km ? Number(vehicle.km) : undefined,
      photo_url:    vehicle.photo || undefined,
      customer_id:  customer?.id || undefined,
    }
    // Buang key undefined biar tidak menimpa data existing dengan kosong
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    if (existing) {
      const updated = await vehicleAPI.update(existing.id, payload)
      return updated?.id ?? existing.id
    }

    const created = await vehicleAPI.create({
      ...payload,
      last_service: new Date().toISOString().slice(0, 10),
    })
    return created?.id ?? null
  } catch (err) {
    console.error('[syncVehicle] Gagal sinkronisasi kendaraan ke Supabase:', err)
    return null
  }
}