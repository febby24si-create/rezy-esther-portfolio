// ============================================================
// syncVehicle.js
// Sinkronisasi kendaraan dari booking customer ke garage_vehicles
// agar admin dapat melihatnya di halaman Vehicles.
// ============================================================

const LS_KEY = 'garage_vehicles'

function loadAdminVehicles() {
  try {
    const raw = sessionStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAdminVehicles(list) {
  try { sessionStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {}
}

/**
 * Tambahkan atau update kendaraan customer ke garage_vehicles.
 * @param {object} vehicle  — data kendaraan dari customer
 * @param {object} customer — data customer (name, id)
 * @returns {string} vehicleId yang tersimpan
 */
export function syncCustomerVehicle(vehicle, customer) {
  const vehicles = loadAdminVehicles()

  // Cek apakah sudah ada berdasarkan plate (nomor polisi)
  const normalizedPlate = (vehicle.plate || '').toUpperCase().replace(/\s+/g, ' ').trim()
  const existing = vehicles.find(v =>
    (v.plate || '').toUpperCase().replace(/\s+/g, ' ').trim() === normalizedPlate
  )

  if (existing) {
    // Update data yang mungkin baru (foto, km, dll) tapi jangan timpa status mekanik
    const updated = vehicles.map(v =>
      v.id === existing.id
        ? {
            ...v,
            brand:      vehicle.brand      || v.brand,
            model:      vehicle.model      || v.model,
            year:       vehicle.year       || v.year,
            type:       vehicle.type       || v.type,
            photo:      vehicle.photo      || v.photo,
            owner:      customer.name      || v.owner,
            customerId: customer.id        || v.customerId,
            mileage:    vehicle.km         || v.mileage,
            // Tandai source
            source: v.source || 'customer_upload',
          }
        : v
    )
    saveAdminVehicles(updated)
    return existing.id
  }

  // Buat entry baru
  const newId = 'VC-' + Date.now()
  const newEntry = {
    id:          newId,
    plate:       normalizedPlate || '-',
    brand:       vehicle.brand  || '',
    model:       vehicle.model  || '',
    year:        vehicle.year   || '',
    type:        vehicle.type   === 'motor' ? 'Motor' : 'Mobil',
    owner:       customer.name  || '',
    customerId:  customer.id    || '',
    photo:       vehicle.photo  || '',
    mileage:     vehicle.km     || '',
    lastService: new Date().toISOString().slice(0, 10),
    status:      'Menunggu',
    mechanicId:  '',
    // Tandai sumber kendaraan
    source:      vehicle.fromCatalog ? 'catalog' : 'customer_upload',
    addedAt:     new Date().toISOString().slice(0, 10),
  }

  saveAdminVehicles([newEntry, ...vehicles])
  return newId
}
