// ============================================================
// LiveMap.jsx
// Fullscreen Leaflet map untuk live driver tracking
// Marker: Bengkel, Driver (bergerak), Customer
// Polyline rute
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react'
import { BENGKEL_COORDS } from '../../lib/deliveryEngine'

let L = null

function useLeaflet() {
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
  return ready
}

const makeIcon = (html, size = [40, 40]) => () =>
  L.divIcon({ className: '', html, iconSize: size, iconAnchor: [size[0]/2, size[1]] })

const bengkelIconFn = () => L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#EF4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;font-size:18px">🔧</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const driverIconFn = () => L.divIcon({
  className: '',
  html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#F59E0B,#D97706);border-radius:50%;border:3px solid white;box-shadow:0 2px 16px rgba(245,158,11,0.6);display:flex;align-items:center;justify-content:center;font-size:20px">🚗</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const customerIconFn = () => L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 12px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg)"></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

// Smooth marker animation
function animateMarker(marker, toLatLng, durationMs = 1000) {
  if (!marker) return
  const from = marker.getLatLng()
  const startTime = Date.now()
  function step() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / durationMs, 1)
    const ease = 1 - Math.pow(1 - progress, 3) // ease out cubic
    const lat = from.lat + (toLatLng[0] - from.lat) * ease
    const lng = from.lng + (toLatLng[1] - from.lng) * ease
    marker.setLatLng([lat, lng])
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function LiveMap({
  customerLat,
  customerLng,
  driverLat,
  driverLng,
  height = '100%',
  className = '',
}) {
  const leafletReady = useLeaflet()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const customerMarkerRef = useRef(null)
  const bengkelMarkerRef = useRef(null)
  const routeLineRef = useRef(null)

  const hasDriver = driverLat !== null && driverLat !== undefined && driverLng !== null && driverLng !== undefined
  const hasCustomer = customerLat && customerLng

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    if (mapInstanceRef.current) return

    const center = hasDriver
      ? [driverLat, driverLng]
      : hasCustomer
      ? [customerLat, customerLng]
      : [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng]

    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
    })

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    // Bengkel marker
    const bengkelMarker = L.marker(
      [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng],
      { icon: bengkelIconFn() }
    ).addTo(map).bindPopup('<b>🔧 Esther Garage</b><br>Bengkel kami')
    bengkelMarkerRef.current = bengkelMarker

    // Customer marker
    if (hasCustomer) {
      const customerMarker = L.marker(
        [customerLat, customerLng],
        { icon: customerIconFn() }
      ).addTo(map).bindPopup('<b>📍 Lokasi Anda</b>')
      customerMarkerRef.current = customerMarker
    }

    // Driver marker
    if (hasDriver) {
      const driverMarker = L.marker(
        [driverLat, driverLng],
        { icon: driverIconFn() }
      ).addTo(map).bindPopup('<b>🚗 Driver Anda</b>')
      driverMarkerRef.current = driverMarker
    }

    // Route polyline
    const points = [
      [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng],
      ...(hasDriver ? [[driverLat, driverLng]] : []),
      ...(hasCustomer ? [[customerLat, customerLng]] : []),
    ]
    const routeLine = L.polyline(points, {
      color: '#22C55E',
      weight: 3,
      opacity: 0.8,
      dashArray: '8 6',
    }).addTo(map)
    routeLineRef.current = routeLine

    // Fit all markers
    const allPoints = [
      [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng],
      ...(hasDriver ? [[driverLat, driverLng]] : []),
      ...(hasCustomer ? [[customerLat, customerLng]] : []),
    ]
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] })
    }

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  // ── Animate driver marker when position changes ───────────────
  useEffect(() => {
    if (!hasDriver || !mapInstanceRef.current) return
    if (driverMarkerRef.current) {
      // Smooth animation to new position
      animateMarker(driverMarkerRef.current, [driverLat, driverLng], 800)
      // Update polyline
      if (routeLineRef.current && customerMarkerRef.current) {
        const custPos = customerMarkerRef.current.getLatLng()
        routeLineRef.current.setLatLngs([
          [BENGKEL_COORDS.lat, BENGKEL_COORDS.lng],
          [driverLat, driverLng],
          [custPos.lat, custPos.lng],
        ])
      }
    }
  }, [driverLat, driverLng, hasDriver])

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ height, border: '1px solid rgba(34,197,94,0.15)' }}>
      {/* Dark overlay on load */}
      {!leafletReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: '#040E09' }}>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Memuat peta live...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      {leafletReady && (
        <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5">
          {[
            { icon: '🔧', label: 'Bengkel', color: '#EF4444' },
            ...(hasDriver ? [{ icon: '🚗', label: 'Driver', color: '#F59E0B' }] : []),
            ...(hasCustomer ? [{ icon: '📍', label: 'Anda', color: '#22C55E' }] : []),
          ].map(item => (
            <div key={item.label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(4,12,8,0.88)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              <span>{item.icon}</span>
              <span className="font-medium" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
