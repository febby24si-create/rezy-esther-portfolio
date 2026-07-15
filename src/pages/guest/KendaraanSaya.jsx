import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdDirectionsCar, MdTwoWheeler, MdMenuBook, MdSpeed, MdCalendarToday } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { vehicleAPI } from '../../services/vehicleAPI'
import PageSkeleton from '../../components/ui/PageSkeleton'
import EmptyState from '../../components/EmptyState'

export default function KendaraanSaya() {
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer?.id) { setLoading(false); return }
    let cancelled = false
    vehicleAPI.fetchByCustomer(customer.id)
      .then((data) => { if (!cancelled) setVehicles(data || []) })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [customer?.id])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <MdDirectionsCar className="text-green-400" /> Kendaraan Saya
        </h1>
        <p className="text-gray-400 text-sm mt-1">Pilih kendaraan untuk melihat Buku Servis Digital.</p>
      </div>

      {loading ? (
        <PageSkeleton variant="card" count={3} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={MdDirectionsCar}
          title="Belum ada kendaraan terdaftar"
          description="Kendaraan akan otomatis tercatat saat Anda booking servis pertama kali."
          actionLabel="Booking Servis"
          onAction={() => navigate('/member/booking')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/member/buku-servis/${v.id}`)}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-green-500/40"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <div className="h-32 flex items-center justify-center" style={{ background: 'rgba(4,26,20,0.8)' }}>
                {v.photo_url ? (
                  <img src={v.photo_url} alt={v.plate} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                ) : v.type === 'Motor' ? (
                  <MdTwoWheeler size={44} className="text-green-500/30" />
                ) : (
                  <MdDirectionsCar size={44} className="text-green-500/30" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg tracking-wide">{v.plate}</h3>
                <p className="text-gray-400 text-sm">{v.brand} {v.model} · {v.year}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MdSpeed size={13} /> {(v.km || 0).toLocaleString('id-ID')} km</span>
                  <span className="flex items-center gap-1"><MdCalendarToday size={13} /> {v.last_service || 'Belum servis'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-green-400 text-xs font-semibold">
                  <MdMenuBook size={14} /> Lihat Buku Servis Digital
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}