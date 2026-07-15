// ============================================================
// DetailPembelian.jsx — /member/pembelian/:id
// Detail lengkap order produk:
// - Info produk yang dibeli
// - 7-step timeline animated
// - Biaya pengiriman + total
// - Tombol Beli Lagi
// - Download Invoice
// - Tulis ulasan
// ============================================================
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowBack, MdCheckCircle, MdRadioButtonUnchecked,
  MdShoppingCart, MdDownload, MdLocationOn, MdPhone,
  MdPerson, MdReceiptLong, MdLocalShipping, MdBolt,
} from 'react-icons/md'
import { shopAPI } from '../../services/shopAPI'
import { useCart } from '../../hooks/useCart'
import { formatRupiah } from '../../lib/formatRupiah'
import { fmtRp } from '../../lib/deliveryEngine'
import PageSkeleton from '../../components/ui/PageSkeleton'
import ProductReviews from '../../components/product/ProductReviews'

// ── 7-step order status ──────────────────────────────────────
const ORDER_STEPS = [
  { id: 1, key: 'Menunggu Pembayaran',  label: 'Menunggu Pembayaran', icon: '💳' },
  { id: 2, key: 'Pembayaran Berhasil',  label: 'Pembayaran Dikonfirmasi', icon: '✅' },
  { id: 3, key: 'Diproses',             label: 'Pesanan Diproses', icon: '⚙️' },
  { id: 4, key: 'Dikemas',              label: 'Sedang Dikemas', icon: '📦' },
  { id: 5, key: 'Dikirim',              label: 'Sedang Dikirim', icon: '🚚' },
  { id: 6, key: 'Hampir Sampai',        label: 'Hampir Sampai', icon: '📍' },
  { id: 7, key: 'Selesai',              label: 'Selesai', icon: '⭐' },
]

const STATUS_TO_STEP = {
  'Menunggu Konfirmasi': 1,
  'Menunggu Pembayaran': 1,
  'Pembayaran Berhasil': 2,
  'Dikonfirmasi':        2,
  'Diproses':            3,
  'Dikemas':             4,
  'Dikirim':             5,
  'Hampir Sampai':       6,
  'Selesai':             7,
  'Dibatalkan':          0,
}

const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Menunggu Pembayaran': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Pembayaran Berhasil': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  'Diproses':            { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  'Dikemas':             { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  'Dikirim':             { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Hampir Sampai':       { color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  'Selesai':             { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'Dibatalkan':          { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

function OrderTimeline({ status }) {
  const currentStep = STATUS_TO_STEP[status] || 1
  const isCancelled = status === 'Dibatalkan'

  if (isCancelled) return (
    <div className="rounded-2xl p-5 text-center"
      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <p className="text-4xl mb-2">❌</p>
      <p className="text-red-400 font-bold">Pesanan Dibatalkan</p>
    </div>
  )

  return (
    <div className="rounded-2xl p-5 space-y-0"
      style={{ background: 'rgba(4,14,9,0.6)', border: '1px solid rgba(34,197,94,0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-bold text-sm">Status Pesanan</p>
        <p className="text-gray-500 text-xs">Step {currentStep}/{ORDER_STEPS.length}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / (ORDER_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#22C55E,#10B981)' }}
        />
      </div>

      {ORDER_STEPS.map((step, i) => {
        const done = step.id < currentStep
        const active = step.id === currentStep
        const isLast = i === ORDER_STEPS.length - 1

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center flex-shrink-0">
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={active ? { repeat: Infinity, duration: 2 } : {}}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background: done ? 'rgba(34,197,94,0.15)' : active ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                  border: done ? '2px solid rgba(34,197,94,0.5)' : active ? '2px solid rgba(34,197,94,0.7)' : '2px solid rgba(255,255,255,0.08)',
                }}>
                {done ? <MdCheckCircle className="text-green-400" size={16} /> : active
                  ? <motion.span animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 1.5 }}>{step.icon}</motion.span>
                  : <span className="text-gray-600 text-xs">{step.icon}</span>}
              </motion.div>
              {!isLast && (
                <div className="w-0.5 h-5 my-1 rounded-full"
                  style={{ background: done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
            <div className={`pb-3 flex-1 ${isLast ? 'pb-0' : ''} flex items-center min-h-8`}>
              <p className={`text-sm font-medium transition-colors ${done ? 'text-gray-400' : active ? 'text-white font-bold' : 'text-gray-600'}`}>
                {step.label}
                {active && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-green-400"
                  />
                )}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function DetailPembelian() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [rebuyLoading, setRebuyLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([shopAPI.fetchOrderById(id), shopAPI.fetchItemsByOrder(id)])
      .then(([ord, its]) => {
        setOrder(ord || null)
        setItems(its || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleBuyAgain = async () => {
    setRebuyLoading(true)
    items.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        sell_price: item.price,
      }, item.qty)
    })
    await new Promise(r => setTimeout(r, 400))
    setRebuyLoading(false)
    navigate('/member/checkout')
  }

  if (loading) {
    return (
      <div className="p-6">
        <PageSkeleton variant="list" count={3} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Order tidak ditemukan.</p>
        <button onClick={() => navigate('/member/pembelian')}
          className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-500/30">
          Kembali ke Riwayat
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Menunggu Konfirmasi']
  const subtotal = items.reduce((s, it) => s + (it.subtotal || it.qty * it.price), 0)
  const deliveryFee = order.delivery_fee || 0
  const total = subtotal + deliveryFee
  const isSelesai = order.status === 'Selesai'

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/member/pembelian')}
          className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <MdArrowBack size={18} />
        </button>
        <div>
          <h1 className="text-white font-extrabold text-lg">Detail Pesanan</h1>
          <p className="text-gray-500 text-xs font-mono">{order.order_number}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <OrderTimeline status={order.status} />

      {/* Produk */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(4,14,9,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-white font-bold text-sm">Produk yang Dibeli</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <MdReceiptLong className="text-green-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{item.product_name}</p>
                <p className="text-gray-400 text-xs">{formatRupiah(item.price)} × {item.qty}</p>
              </div>
              <p className="text-white font-bold text-sm flex-shrink-0">{formatRupiah(item.subtotal || item.qty * item.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alamat */}
      {order.address && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
          <MdLocationOn className="text-green-400 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-1">Dikirim ke</p>
            <p className="text-white font-semibold text-sm">{order.recipient_name}</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{order.address}</p>
            {order.phone && <p className="text-gray-500 text-xs mt-0.5">{order.phone}</p>}
          </div>
        </div>
      )}

      {/* Ringkasan biaya */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(4,14,9,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-white font-bold text-sm">Rincian Pembayaran</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal produk</span>
            <span className="text-gray-200">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><MdLocalShipping size={14} /> Ongkos kirim</span>
            <span className={deliveryFee === 0 ? 'text-green-400 font-semibold' : 'text-gray-200'}>
              {deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span>Total</span>
            <span className="text-green-400">{formatRupiah(total)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-gray-500 text-xs">Metode Pembayaran</span>
          <span className="text-gray-300 text-xs font-semibold">{order.payment_method || 'Cash'}</span>
        </div>
        {order.notes && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-gray-500 text-xs">📋 Catatan: <span className="text-gray-400">{order.notes}</span></p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => navigate(`/member/pembelian/${id}/invoice`)}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
          <MdDownload size={16} /> Lihat Invoice
        </motion.button>
        <motion.button
          onClick={handleBuyAgain}
          disabled={rebuyLoading || items.length === 0}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 16px rgba(34,197,94,0.25)' }}>
          {rebuyLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : <><MdShoppingCart size={16} /> Beli Lagi</>}
        </motion.button>
      </div>

      {/* Ulasan produk (hanya jika selesai) */}
      {isSelesai && items.map(item => (
        <ProductReviews
          key={item.product_id}
          productId={item.product_id}
          orderId={id}
          canReview={true}
        />
      ))}
    </div>
  )
}
