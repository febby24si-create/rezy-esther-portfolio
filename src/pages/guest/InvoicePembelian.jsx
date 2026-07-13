import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowBack, MdReceiptLong, MdStore, MdAccountBalance } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { shopAPI } from '../../services/shopAPI'
import { formatRupiah } from '../../lib/formatRupiah'
import { PRODUCT_ORDER_STATUS_CONFIG } from './RiwayatPembelian'
import PageSkeleton from '../../components/ui/PageSkeleton'

export default function InvoicePembelian() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    Promise.all([shopAPI.fetchOrderById(id), shopAPI.fetchItemsByOrder(id)])
      .then(([o, its]) => {
        if (cancelled) return
        // Keamanan dasar: pastikan invoice ini benar-benar milik customer
        // yang sedang login, bukan sekadar tebak-tebak ID di URL.
        if (!o || (customer && o.customer_id !== customer.id)) {
          setNotFound(true)
          return
        }
        setOrder(o)
        setItems(its || [])
      })
      .catch(() => setNotFound(true))
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [id, customer])

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8"><PageSkeleton variant="card" count={1} /></div>
  }

  if (notFound || !order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-4 text-center py-20">
        <MdReceiptLong size={48} className="text-gray-700" />
        <h2 className="text-white font-bold">Invoice tidak ditemukan</h2>
        <button
          onClick={() => navigate('/member/pembelian')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}
        >
          Kembali ke Riwayat Pembelian
        </button>
      </div>
    )
  }

  const statusCfg = PRODUCT_ORDER_STATUS_CONFIG[order.status] || PRODUCT_ORDER_STATUS_CONFIG['Menunggu Konfirmasi']
  const PaymentIcon = order.payment_method === 'Transfer Manual' ? MdAccountBalance : MdStore

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate('/member/pembelian')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <MdArrowBack size={16} /> Kembali ke Riwayat Pembelian
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
      >
        {/* Header invoice */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Invoice</p>
            <h1 className="text-white font-extrabold text-xl">{order.order_number}</h1>
            <p className="text-gray-500 text-xs mt-1">
              {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {order.status}
          </span>
        </div>

        {/* Data pembeli */}
        <div className="p-6 border-b border-white/10 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs mb-1">Penerima</p>
            <p className="text-white text-sm font-semibold">{order.recipient_name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{order.phone}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Alamat</p>
            <p className="text-gray-300 text-sm">{order.address}</p>
          </div>
          {order.notes && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs mb-1">Catatan</p>
              <p className="text-gray-300 text-sm">{order.notes}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <PaymentIcon size={16} className="text-green-400" />
            <span className="text-gray-300 text-sm">{order.payment_method}</span>
          </div>
        </div>

        {/* Daftar produk */}
        <div className="p-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Produk Dipesan</p>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{it.product_name}</p>
                  <p className="text-gray-500 text-xs">{it.qty} x {formatRupiah(it.price)}</p>
                </div>
                <p className="text-white font-semibold flex-shrink-0 ml-3">{formatRupiah(it.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
            <span className="text-white font-bold">Total</span>
            <span className="text-green-400 font-extrabold text-lg">{formatRupiah(order.total)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}