// ============================================================
// MiniMapPreview.jsx
// Read-only mini map preview setelah alamat terpilih
// Menampilkan: Pin customer, Pin bengkel, radius lingkaran
// ============================================================
import { useEffect, useRef, useState } from 'react'
import { BENGKEL_COORDS, calcDistance } from '../../lib/deliveryEngine'

let L = null

export default function MiniMapPreview({ lat, lng, height = 160 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    import('leaflet').then(mod => {
      L = mod.default
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || !lat || !lng) return

    // Destroy map jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19,
    }).addTo(map)

    // Customer marker
    const customerIcon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 10px rgba(34,197,94,0.5)"><div style="width:6px;height:6px;background:white;border-radius:50%;margin:8px auto 0;transform:rotate(45deg)"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })

    // Bengkel marker
    const bengkelIcon = L.divIcon({
      className: '',
      html: `<div style="width:24px;height:24px;background:#EF4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:11px">🔧</span></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    L.marker([lat, lng], { icon: customerIcon }).addTo(map).bindTooltip('Lokasi Anda', { permanent: false })
    L.marker([BENGKEL_COORDS.lat, BENGKEL_COORDS.lng], { icon: bengkelIcon }).addTo(map).bindTooltip('Esther Garage', { permanent: false })

    // Garis rute
    L.polyline([[lat, lng], [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng]], {
      color: '#22C55E',
      weight: 2,
      dashArray: '6 4',
      opacity: 0.7,
    }).addTo(map)

    // Fit bounds ke kedua marker
    const bounds = L.latLngBounds([[lat, lng], [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng]])
    map.fitBounds(bounds, { padding: [20, 20] })

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [ready, lat, lng])

  const dist = lat && lng ? calcDistance(lat, lng, BENGKEL_COORDS.lat, BENGKEL_COORDS.lng) : null

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.15)' }}>
      {!ready || !lat ? (
        <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height, background: 'rgba(4,12,8,0.6)' }}>
          Pilih alamat untuk melihat peta
        </div>
      ) : (
        <>
          <div ref={mapRef} style={{ height }} />
          {dist !== null && (
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-xs font-semibold text-green-400 z-[1000]"
              style={{ background: 'rgba(4,12,8,0.85)', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(8px)' }}>
              📏 {dist} km dari bengkel
            </div>
          )}
        </>
      )}
    </div>
  )
}
