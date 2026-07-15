// ============================================================
// RiwayatPembelian.jsx — UPGRADED
// - Tab filter: Semua / Belum Bayar / Diproses / Dikirim / Selesai / Dibatalkan
// - Card premium: thumbnail, status badge, metode bayar, Beli Lagi
// - Empty state per tab
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdShoppingBag, MdChevronRight, MdReceiptLong,
  MdShoppingCart, MdCheckCircle, MdLocalShipping, MdClose,
} from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useCart } from '../../hooks/useCart'
import { shopAPI } from '../../services/shopAPI'
import { formatRupiah } from '../../lib/formatRupiah'
import PageSkeleton from '../../components/ui/PageSkeleton'
import EmptyState from '../../components/EmptyState'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  'Menunggu Pembayaran': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  'Pembayaran Berhasil': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', dot: '#3B82F6' },
  'Diproses':            { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', dot: '#8B5CF6' },
  'Dikemas':             { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  dot: '#06B6D4' },
  'Dikirim':             { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  'Hampir Sampai':       { color: '#F97316', bg: 'rgba(249,115,22,0.12)', dot: '#F97316' },
  'Selesai':             { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  dot: '#22C55E' },
  'Dibatalkan':          { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  dot: '#EF4444' },
}

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: 'all',      label: 'Semua',       filter: null },
  { id: 'unpaid',   label: 'Belum Bayar', filter: ['Menunggu Konfirmasi', 'Menunggu Pembayaran'] },
  { id: 'process',  label: 'Diproses',    filter: ['Pembayaran Berhasil', 'Diproses', 'Dikemas'] },
  { id: 'shipping', label: 'Dikirim',     filter: ['Dikirim', 'Hampir Sampai'] },
  { id: 'done',     label: 'Selesai',     filter: ['Selesai'] },
  { id: 'cancel',   label: 'Dibatalkan',  filter: ['Dibatalkan'] },
]

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Menunggu Konfirmasi']
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: cfg.dot }}
      />
      {status}
    </span>
  )
}

function OrderCard({ order, onBuyAgain }) {
  const navigate = useNavigate()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden transition-all hover:border-green-500/25"
      style={{ background: 'rgba(4,14,9,0.7)', border: '1px solid rgba(34,197,94,0.1)', backdropFilter: 'blur(8px)' }}
    >
      {/* Top: Order number + Date */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div>
          <p className="text-gray-400 text-[10px] font-mono">{order.order_number}</p>
          <p className="text-gray-500 text-[10px]">
            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Products preview */}
      <button
        onClick={() => navigate(`/member/pembelian/${order.id}`)}
        className="w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <MdReceiptLong className="text-green-400" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {order._previewName || `Order ${order.order_number}`}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {order._itemCount > 0 ? `${order._itemCount} produk` : 'Detail order'}
              {order.payment_method && ` · ${order.payment_method}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-extrabold text-base">{formatRupiah(order.total)}</p>
            <MdChevronRight className="text-gray-600 ml-auto mt-0.5" size={18} />
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => navigate(`/member/pembelian/${order.id}/invoice`)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          📄 Invoice
        </button>
        <button
          onClick={() => onBuyAgain(order)}
          className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
          style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,163,74,0.15))', border: '1px solid rgba(34,197,94,0.25)' }}>
          <MdShoppingCart size={13} className="text-green-400" /> Beli Lagi
        </button>
        {order.status !== 'Selesai' && order.status !== 'Dibatalkan' && (
          <button
            onClick={() => navigate(`/member/pembelian/${order.id}`)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-blue-400 flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <MdLocalShipping size={13} /> Tracking
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function RiwayatPembelian() {
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState({}) // orderId -> items[]
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [rebuyToast, setRebuyToast] = useState(false)

  useEffect(() => {
    if (!customer?.id) { setLoading(false); return }
    let cancelled = false
    shopAPI.fetchOrdersByCustomer(customer.id)
      .then(async (data) => {
        if (cancelled) return
        const enriched = data || []
        // Load first items for preview names
        const itemPromises = enriched.slice(0, 10).map(o =>
          shopAPI.fetchItemsByOrder(o.id).then(its => ({ id: o.id, items: its || [] })).catch(() => ({ id: o.id, items: [] }))
        )
        const results = await Promise.all(itemPromises)
        const itemMap = {}
        results.forEach(r => { itemMap[r.id] = r.items })
        // Enrich orders with item count & preview name
        const enrichedOrders = enriched.map(o => ({
          ...o,
          _itemCount: itemMap[o.id]?.length || 0,
          _previewName: itemMap[o.id]?.[0]?.product_name
            ? `${itemMap[o.id][0].product_name}${itemMap[o.id].length > 1 ? ` +${itemMap[o.id].length - 1} lainnya` : ''}`
            : `Order ${o.order_number}`,
          _items: itemMap[o.id] || [],
        }))
        if (!cancelled) { setOrders(enrichedOrders); setItems(itemMap) }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [customer?.id])

  const handleBuyAgain = (order) => {
    const its = order._items || []
    if (its.length === 0) { navigate(`/member/pembelian/${order.id}`); return }
    its.forEach(item => addToCart({
      id: item.product_id,
      name: item.product_name,
      sell_price: item.price,
    }, item.qty))
    setRebuyToast(true)
    setTimeout(() => { setRebuyToast(false); navigate('/member/checkout') }, 1500)
  }

  const tabDef = TABS.find(t => t.id === activeTab)
  const filtered = tabDef?.filter
    ? orders.filter(o => tabDef.filter.includes(o.status))
    : orders

  // Summary stats
  const totalSpent = orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-5 min-h-screen">
      {/* Rebuy toast */}
      <AnimatePresence>
        {rebuyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
            <MdCheckCircle size={18} /> Produk ditambahkan ke keranjang!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MdShoppingBag className="text-green-400" /> Riwayat Pembelian
          </h1>
          <p className="text-gray-400 text-sm mt-1">Semua transaksi sparepart Anda</p>
        </div>
        {totalSpent > 0 && (
          <div className="text-right hidden sm:block">
            <p className="text-gray-500 text-xs">Total Pengeluaran</p>
            <p className="text-green-400 font-extrabold text-lg">{formatRupiah(totalSpent)}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map(tab => {
          const count = tab.filter
            ? orders.filter(o => tab.filter.includes(o.status)).length
            : orders.length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
              style={activeTab === tab.id
                ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ background: activeTab === tab.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <PageSkeleton variant="list" count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MdShoppingBag}
          title={activeTab === 'all' ? 'Belum ada pembelian' : `Tidak ada pesanan ${tabDef?.label}`}
          description={activeTab === 'all' ? 'Yuk jelajahi katalog sparepart kami.' : 'Pesanan di kategori ini kosong.'}
          actionLabel={activeTab === 'all' ? 'Lihat Katalog' : undefined}
          onAction={activeTab === 'all' ? () => navigate('/guest/produk') : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onBuyAgain={handleBuyAgain} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}