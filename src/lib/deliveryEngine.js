// ============================================================
// deliveryEngine.js
// Kalkulasi jarak, biaya pengiriman, estimasi waktu
// untuk sistem Home Service & Delivery Esther Garage
// ============================================================

// ── Koordinat Bengkel (Esther Garage — Bukittinggi) ──────────
export const BENGKEL_COORDS = {
  lat: -0.3061,
  lng: 100.3691,
  name: 'Esther Garage',
  address: 'Jl. Ahmad Yani, Bukittinggi, Sumatera Barat',
}

// ── Konfigurasi Metode Layanan ────────────────────────────────
export const DELIVERY_METHODS = {
  home_service: {
    id: 'home_service',
    label: 'Home Service',
    desc: 'Mekanik datang ke lokasi Anda',
    icon: '🔧',
    emoji: '🏠',
    baseFee: 25000,
    perKmFee: 5000,
    maxKm: 30,
    estMinutes: 60, // estimasi kedatangan
    color: '#22C55E',
    gradient: 'linear-gradient(135deg,#22C55E22,#16A34A11)',
    border: 'rgba(34,197,94,0.3)',
    available: true,
  },
  pickup_kendaraan: {
    id: 'pickup_kendaraan',
    label: 'Pickup Kendaraan',
    desc: 'Driver jemput kendaraan Anda ke bengkel',
    icon: '🚗',
    emoji: '🚚',
    baseFee: 20000,
    perKmFee: 4000,
    maxKm: 25,
    estMinutes: 45,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg,#3B82F622,#2563EB11)',
    border: 'rgba(59,130,246,0.3)',
    available: true,
  },
  pengiriman_sparepart: {
    id: 'pengiriman_sparepart',
    label: 'Kirim Sparepart',
    desc: 'Sparepart diantar langsung ke Anda',
    icon: '📦',
    emoji: '📦',
    baseFee: 10000,
    perKmFee: 2500,
    maxKm: 40,
    estMinutes: 90,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg,#F59E0B22,#D9770611)',
    border: 'rgba(245,158,11,0.3)',
    available: true,
  },
  ambil_sendiri: {
    id: 'ambil_sendiri',
    label: 'Ambil Sendiri',
    desc: 'Datang langsung ke bengkel kami',
    icon: '🏪',
    emoji: '🏪',
    baseFee: 0,
    perKmFee: 0,
    maxKm: 999,
    estMinutes: 0,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg,#8B5CF622,#7C3AED11)',
    border: 'rgba(139,92,246,0.3)',
    available: true,
  },
}

// ── Haversine Formula (Jarak antara dua titik GPS) ────────────
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // radius bumi km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return parseFloat((R * c).toFixed(2))
}

// ── Hitung Biaya Pengiriman ────────────────────────────────────
export function calcDeliveryFee(distanceKm, methodId) {
  const method = DELIVERY_METHODS[methodId]
  if (!method) return 0
  if (methodId === 'ambil_sendiri') return 0
  const fee = method.baseFee + Math.ceil(distanceKm) * method.perKmFee
  return fee
}

// ── Estimasi Waktu Kedatangan ──────────────────────────────────
// Rata-rata kecepatan kota 30 km/jam
export function calcETA(distanceKm, methodId) {
  const method = DELIVERY_METHODS[methodId]
  if (!method || methodId === 'ambil_sendiri') return null
  const travelMinutes = Math.ceil((distanceKm / 30) * 60)
  const totalMinutes = method.estMinutes + travelMinutes
  if (totalMinutes < 60) return `${totalMinutes} menit`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`
}

// ── Format rupiah singkat ──────────────────────────────────────
export function fmtRp(n) {
  if (!n) return 'Gratis'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

// ── Reverse geocoding via Nominatim ──────────────────────────
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'id' } }
    )
    const data = await res.json()
    const addr = data.address || {}
    return {
      fullAddress: data.display_name || '',
      road: addr.road || addr.pedestrian || '',
      village: addr.village || addr.suburb || addr.neighbourhood || '',
      district: addr.city_district || addr.county || '',
      city: addr.city || addr.town || addr.regency || '',
      province: addr.state || '',
      postalCode: addr.postcode || '',
      country: addr.country || 'Indonesia',
    }
  } catch {
    return null
  }
}

// ── Forward geocoding (search) via Nominatim ─────────────────
export async function searchAddress(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'id' } }
    )
    const data = await res.json()
    return data.map(item => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  } catch {
    return []
  }
}

// ── Address type icons ────────────────────────────────────────
export const ADDRESS_TYPES = {
  rumah:   { label: 'Rumah',   icon: '🏠', color: '#22C55E' },
  kantor:  { label: 'Kantor',  icon: '🏢', color: '#3B82F6' },
  favorit: { label: 'Favorit', icon: '❤️', color: '#EF4444' },
  lainnya: { label: 'Lainnya', icon: '📍', color: '#8B5CF6' },
}
