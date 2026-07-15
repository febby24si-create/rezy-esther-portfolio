import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdArrowBack, MdDirectionsCar, MdTwoWheeler, MdMenuBook, MdPrint,
  MdBuild, MdSpeed, MdPerson, MdCheckCircle, MdCalendarToday,
} from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { vehicleAPI } from '../../services/vehicleAPI'
import { orderAPI } from '../../services/orderAPI'
import PageSkeleton from '../../components/ui/PageSkeleton'

function formatRupiah(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

/**
 * BukuServis — "Digital Service Book". Riwayat servis kronologis milik
 * SATU kendaraan (bukan per-customer seperti RiwayatService.jsx yang
 * sudah ada) — meniru konsep buku servis fisik yang biasa menyertai
 * mobil di bengkel resmi (Auto2000 dsb).
 *
 * Dipasang di 2 route (lihat App.jsx):
 *   /member/buku-servis/:id  -> customer, dengan cek kepemilikan
 *   /buku-servis/:id         -> admin, tanpa cek kepemilikan
 *
 * CATATAN DATA: order.vehicle_id baru mulai konsisten terisi sejak
 * fitur booking->order diperbarui. Untuk order LAMA yang cuma punya
 * vehicle_display (teks), dicocokkan sebagai fallback lewat nomor
 * plat supaya buku servis tetap lengkap untuk histori lama.
 */
export default function BukuServis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()

  const [vehicle, setVehicle] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setForbidden(false)

    async function load() {
      try {
        const v = await vehicleAPI.fetchById(id)
        if (!v) { if (!cancelled) setLoading(false); return }

        // Kalau diakses sebagai member (ada `customer` login) dan
        // kendaraan ini bukan miliknya -> blokir. Kalau diakses dari
        // sisi admin (tidak ada customer context), lewati cek ini.
        if (customer && v.customer_id !== customer.id) {
          if (!cancelled) { setForbidden(true); setLoading(false) }
          return
        }

        const allOrders = customer
          ? await orderAPI.fetchByCustomer(customer.id)
          : await orderAPI.fetchAll()

        const normalizedPlate = (v.plate || '').toUpperCase().replace(/\s+/g, '')
        const matched = allOrders.filter(o =>
          o.vehicle_id === v.id ||
          (o.vehicle_display || '').toUpperCase().replace(/\s+/g, '').includes(normalizedPlate)
        ).sort((a, b) => new Date(b.order_date) - new Date(a.order_date))

        if (!cancelled) {
          setVehicle(v)
          setHistory(matched)
        }
      } catch (err) {
        console.error('Gagal memuat buku servis:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, customer])

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8"><PageSkeleton variant="card" count={1} /></div>
  }

  if (forbidden || !vehicle) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-4 text-center py-20">
        <MdMenuBook size={48} className="text-gray-700" />
        <h2 className="text-white font-bold">{forbidden ? 'Kendaraan ini bukan milik Anda' : 'Kendaraan tidak ditemukan'}</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}
        >
          Kembali
        </button>
      </div>
    )
  }

  const totalSpent = history.reduce((s, o) => s + Number(o.total || 0), 0)
  const completedCount = history.filter(o => o.status === 'Selesai').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <MdArrowBack size={16} /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <MdPrint size={15} /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Header buku servis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6 flex items-start gap-5 flex-wrap"
        style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
      >
        <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(4,26,20,0.8)' }}>
          {vehicle.photo_url ? (
            <img src={vehicle.photo_url} alt={vehicle.plate} className="w-full h-full object-cover" />
          ) : vehicle.type === 'Motor' ? (
            <MdTwoWheeler size={28} className="text-green-500/40" />
          ) : (
            <MdDirectionsCar size={28} className="text-green-500/40" />
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-1.5">
            <MdMenuBook size={13} /> Buku Servis Digital
          </p>
          <h1 className="text-white font-extrabold text-2xl tracking-wide mt-0.5">{vehicle.plate}</h1>
          <p className="text-gray-400 text-sm">{vehicle.brand} {vehicle.model} · {vehicle.year} · {vehicle.color}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white font-bold text-lg">{history.length}</p>
            <p className="text-gray-500 text-[11px]">Total Servis</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{(vehicle.km || 0).toLocaleString('id-ID')}</p>
            <p className="text-gray-500 text-[11px]">KM Terakhir</p>
          </div>
          <div>
            <p className="text-green-400 font-bold text-lg">{formatRupiah(totalSpent)}</p>
            <p className="text-gray-500 text-[11px]">Total Pengeluaran</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline riwayat servis */}
      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MdBuild size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada riwayat servis tercatat untuk kendaraan ini.</p>
        </div>
      ) : (
        <div className="relative pl-6 print:pl-0">
          <div className="absolute left-[7px] top-2 bottom-2 w-px print:hidden" style={{ background: 'rgba(34,197,94,0.2)' }} />
          <div className="space-y-4">
            {history.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative print:border-b print:border-gray-300 print:pb-3"
              >
                <span
                  className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 print:hidden"
                  style={{
                    background: order.status === 'Selesai' ? '#22C55E' : '#0B1A14',
                    borderColor: order.status === 'Selesai' ? '#22C55E' : 'rgba(34,197,94,0.4)',
                  }}
                />
                <div className="rounded-xl p-4" style={{ background: 'rgba(11,59,46,0.25)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MdCalendarToday size={14} className="text-green-500" />
                      <span className="text-white font-semibold">
                        {new Date(order.order_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {order.status === 'Selesai' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                        <MdCheckCircle size={11} /> Selesai
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium text-sm">{order.service}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    {order.mechanic_name && (
                      <span className="flex items-center gap-1"><MdPerson size={12} /> {order.mechanic_name}</span>
                    )}
                    <span className="flex items-center gap-1"><MdSpeed size={12} /> {order.id}</span>
                  </div>
                  {order.notes && <p className="text-gray-400 text-xs mt-2 italic">"{order.notes}"</p>}
                  <p className="text-green-400 font-bold text-sm mt-2">{formatRupiah(order.total)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}