import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdShoppingBag, MdChevronRight, MdReceiptLong } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { shopAPI } from '../../services/shopAPI'
import { formatRupiah } from '../../lib/formatRupiah'
import PageSkeleton from '../../components/ui/PageSkeleton'
import EmptyState from '../../components/EmptyState'

export const PRODUCT_ORDER_STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Diproses':            { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  'Siap Diambil':        { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  'Selesai':             { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'Dibatalkan':          { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

function StatusBadge({ status }) {
  const cfg = PRODUCT_ORDER_STATUS_CONFIG[status] || PRODUCT_ORDER_STATUS_CONFIG['Menunggu Konfirmasi']
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  )
}

export default function RiwayatPembelian() {
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer?.id) {
      setLoading(false) // eslint-disable-line react-hooks/set-state-in-effect
      return
    }
    let cancelled = false
    shopAPI.fetchOrdersByCustomer(customer.id)
      .then((data) => { if (!cancelled) setOrders(data || []) })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [customer?.id])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <MdShoppingBag className="text-green-400" /> Riwayat Pembelian
        </h1>
        <p className="text-gray-400 text-sm mt-1">Semua pesanan produk/sparepart yang pernah Anda buat.</p>
      </div>

      {loading ? (
        <PageSkeleton variant="list" count={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={MdShoppingBag}
          title="Belum ada pembelian"
          description="Yuk jelajahi katalog sparepart kami."
          actionLabel="Lihat Katalog Produk"
          onAction={() => navigate('/guest/produk')}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/member/pembelian/${order.id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:border-green-500/30"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.12)' }}>
                <MdReceiptLong className="text-green-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{order.order_number}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-bold text-sm">{formatRupiah(order.total)}</p>
                <div className="mt-1"><StatusBadge status={order.status} /></div>
              </div>
              <MdChevronRight className="text-gray-600 flex-shrink-0" size={20} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}