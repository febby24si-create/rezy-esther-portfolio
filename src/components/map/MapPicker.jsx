// ============================================================
// MapPicker.jsx
// Interactive Leaflet map untuk memilih alamat:
// - Draggable marker
// - GPS detect current location
// - Search autocomplete via Nominatim
// - Reverse geocoding otomatis
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdMyLocation, MdSearch, MdClose, MdLocationOn } from 'react-icons/md'
import { reverseGeocode, searchAddress, BENGKEL_COORDS } from '../../lib/deliveryEngine'

// Leaflet CSS harus dimuat secara global (lihat index.css atau index.html)
let L = null

// ── Internal hook: load leaflet lazily ───────────────────────
function useLeaflet() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    import('leaflet').then(mod => {
      L = mod.default
      // Fix default marker icon path (masalah umum Leaflet + Vite)
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setReady(true)
    })
  }, [])
  return ready
}

// Custom pin icon
function makePinIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;
      background:linear-gradient(135deg,#22C55E,#16A34A);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 4px 16px rgba(34,197,94,0.5);
      display:flex;align-items:center;justify-content:center;
    "><div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg)"></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function makeBengkelIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#EF4444;border-radius:50% 50% 50% 0;
      width:32px;height:32px;transform:rotate(-45deg);
      border:3px solid white;box-shadow:0 4px 12px rgba(239,68,68,0.5);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:14px;">🔧</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

// ── Search Suggestions Component ──────────────────────────────
function SearchSuggestions({ query, onSelect, onClear }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const found = await searchAddress(query)
      setResults(found)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [query])

  if (!query || query.length < 3) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="absolute top-full left-0 right-0 mt-1 z-[2000] rounded-xl overflow-hidden"
        style={{ background: 'rgba(8,20,14,0.97)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(16px)' }}
      >
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-sm">Mencari...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">Tidak ditemukan</div>
        ) : (
          results.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-2"
            >
              <MdLocationOn className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-gray-200 leading-snug">{r.displayName}</span>
            </button>
          ))
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main MapPicker Component ──────────────────────────────────
export default function MapPicker({ value, onChange, height = 340 }) {
  const leafletReady = useLeaflet()
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const defaultCenter = value?.lat
    ? [value.lat, value.lng]
    : [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng]

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    if (mapInstanceRef.current) return // sudah diinit

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Marker bengkel
    L.marker([BENGKEL_COORDS.lat, BENGKEL_COORDS.lng], { icon: makeBengkelIcon(), title: 'Esther Garage' })
      .addTo(map)
      .bindPopup('<b>🔧 Esther Garage</b>')

    // Draggable marker customer
    const marker = L.marker(defaultCenter, {
      icon: makePinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map)

    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      await doReverseGeocode(pos.lat, pos.lng)
    })

    map.on('click', async (e) => {
      marker.setLatLng(e.latlng)
      await doReverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    markerRef.current = marker
    mapInstanceRef.current = map

    // Jika value sudah ada, langsung reverse geocode
    if (value?.lat && !value?.fullAddress) {
      doReverseGeocode(value.lat, value.lng)
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  // ── Reverse geocode & emit onChange ──────────────────────────
  const doReverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true)
    const geo = await reverseGeocode(lat, lng)
    setGeocoding(false)
    onChange?.({
      lat,
      lng,
      fullAddress: geo?.fullAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      road: geo?.road || '',
      village: geo?.village || '',
      district: geo?.district || '',
      city: geo?.city || '',
      province: geo?.province || '',
      postalCode: geo?.postalCode || '',
    })
  }, [onChange])

  // ── Move map & marker to coords ──────────────────────────────
  const flyTo = useCallback((lat, lng) => {
    if (!mapInstanceRef.current || !markerRef.current) return
    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1 })
    markerRef.current.setLatLng([lat, lng])
  }, [])

  // ── GPS ────────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        flyTo(latitude, longitude)
        await doReverseGeocode(latitude, longitude)
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [flyTo, doReverseGeocode])

  // ── Search select ──────────────────────────────────────────
  const handleSearchSelect = useCallback(async (result) => {
    setSearchQuery(result.displayName.split(',')[0])
    setShowSuggestions(false)
    flyTo(result.lat, result.lng)
    await doReverseGeocode(result.lat, result.lng)
  }, [flyTo, doReverseGeocode])

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
      {/* Search bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cari alamat, jalan, atau tempat..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
                style={{ background: 'rgba(4,12,8,0.92)', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(12px)' }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSuggestions(false) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <MdClose size={16} />
                </button>
              )}
            </div>
            {/* GPS Button */}
            <motion.button
              onClick={handleGPS}
              whileTap={{ scale: 0.93 }}
              disabled={gpsLoading}
              className="px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-green-400 flex-shrink-0"
              style={{ background: 'rgba(4,12,8,0.92)', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(12px)' }}
            >
              <motion.div animate={gpsLoading ? { rotate: 360 } : {}} transition={gpsLoading ? { repeat: Infinity, duration: 1 } : {}}>
                <MdMyLocation size={16} />
              </motion.div>
              <span className="hidden sm:inline">{gpsLoading ? 'Mencari...' : 'Lokasi Saya'}</span>
            </motion.button>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <SearchSuggestions
              query={searchQuery}
              onSelect={handleSearchSelect}
              onClear={() => setShowSuggestions(false)}
            />
          )}
        </div>
      </div>

      {/* Click overlay untuk close suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[999]" onClick={() => setShowSuggestions(false)} />
      )}

      {/* Map container */}
      {!leafletReady && (
        <div className="flex items-center justify-center" style={{ height, background: 'rgba(4,12,8,0.8)' }}>
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent mx-auto mb-2"
            />
            <p className="text-gray-400 text-sm">Memuat peta...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ height, opacity: leafletReady ? 1 : 0 }} />

      {/* Geocoding indicator */}
      <AnimatePresence>
        {geocoding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs text-white z-[1000]"
            style={{ background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(8px)' }}
          >
            📍 Mendapatkan alamat...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <div className="px-2.5 py-1 rounded-lg text-[10px] text-gray-400"
          style={{ background: 'rgba(4,12,8,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          Klik atau seret pin untuk ubah lokasi
        </div>
      </div>
    </div>
  )
}
