import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdShoppingBag, MdRefresh, MdClose, MdArrowBack, MdStore, MdAccountBalance,
  MdCheckCircle, MdReceiptLong,
} from 'react-icons/md'
import { shopAPI } from '../services/shopAPI'
import { formatRupiah } from '../lib/formatRupiah'
import { applyOrderCompletedLoyalty } from '../lib/loyaltyEngine'

const STATUS_LIST = ['Menunggu Konfirmasi', 'Diproses', 'Siap Diambil', 'Selesai', 'Dibatalkan']

const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Diproses':            { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  'Siap Diambil':        { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  'Selesai':             { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'Dibatalkan':          { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Menunggu Konfirmasi']
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  )
}

export default function PesananProduk() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailItems, setDetailItems] = useState([])
  const [updating, setUpdating] = useState(false)
  const [pointToast, setPointToast] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await shopAPI.fetchAllOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('Gagal load pesanan produk:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const filtered = useMemo(() => {
    if (filterStatus === 'Semua') return orders
    return orders.filter(o => o.status === filterStatus)
  }, [orders, filterStatus])

  const counts = useMemo(() => {
    const c = { Semua: orders.length }
    STATUS_LIST.forEach(s => { c[s] = orders.filter(o => o.status === s).length })
    return c
  }, [orders])

  const openDetail = async (order) => {
    setDetailOrder(order)
    setDetailItems([])
    try {
      const items = await shopAPI.fetchItemsByOrder(order.id)
      setDetailItems(items || [])
    } catch { /* ignore */ }
  }

  // Ubah status pesanan. Kalau berubah MENJADI 'Selesai' (dan sebelumnya
  // BUKAN 'Selesai' — guard idempoten supaya stok/poin tidak double),
  // otomatis (1) kurangi stok produk terkait via shopAPI, dan
  // (2) beri poin loyalty + tambah total_spent/total_orders customer
  // (sebelumnya cuma stok yang kepotong, poin & pengeluaran member
  // tidak pernah ke-update — makanya dashboard member ngga nambah).
  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return
    setUpdating(true)
    try {
      const wasCompleted = order.status === 'Selesai'
      await shopAPI.updateOrderStatus(order.id, newStatus)

      if (newStatus === 'Selesai' && !wasCompleted) {
        await shopAPI.deductStockOnComplete(order.id)

        if (order.customer_id && order.total) {
          try {
            const result = await applyOrderCompletedLoyalty(
              order.customer_id,
              order.total,
              order.order_number,
              'Pembelian Produk'
            )
            if (result.success) {
              setPointToast({ orderNumber: order.order_number, earned: result.pointsEarned, tierUp: result.tierUp })
              setTimeout(() => setPointToast(null), 4000)

              try {
                const { notificationAPI } = await import('../services/notificationAPI')
                await notificationAPI.notifyPointsEarned(order.customer_id, result.pointsEarned, order.order_number)
              } catch { /* notifikasi opsional, tidak gagalkan alur utama */ }
            } else {
              console.warn('Poin tidak diberikan:', result.message)
            }
          } catch (err) {
            console.error('Gagal memberi poin loyalty untuk pesanan produk:', err)
          }
        }
      }

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
      if (detailOrder?.id === order.id) setDetailOrder(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Gagal update status pesanan:', err)
      alert('Gagal mengubah status pesanan. Coba lagi.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ background: '#040E09', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MdShoppingBag className="text-green-400" /> Pesanan Produk
          </h1>
          <p className="text-gray-400 text-sm mt-1">Kelola pesanan sparepart dari customer — otomatis kurangi stok saat selesai.</p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <MdRefresh size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Toast poin loyalty */}
      <AnimatePresence>
        {pointToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="fixed top-6 right-6 z-[60] rounded-xl px-4 py-3 shadow-xl"
            style={{ background: 'rgba(11,59,46,0.95)', border: '1px solid rgba(34,197,94,0.35)' }}
          >
            <p className="text-white text-sm font-semibold flex items-center gap-1.5">
              <MdCheckCircle className="text-green-400" size={16} /> +{pointToast.earned} poin diberikan
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Pesanan {pointToast.orderNumber} selesai</p>
            {pointToast.tierUp && (
              <p className="text-amber-400 text-xs mt-1 font-semibold">
                🎉 Naik tier: {pointToast.tierUp.from} → {pointToast.tierUp.to}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tab */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {['Semua', ...STATUS_LIST].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
            style={filterStatus === s
              ? { background: 'linear-gradient(135deg,#22C55E,#16a34a)', color: 'white' }
              : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(34,197,94,0.1)' }}
          >
            {s} <span className="opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><MdRefresh size={24} className="text-green-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <MdReceiptLong size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Tidak ada pesanan produk</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((order) => (
            <div
              key={order.id}
              onClick={() => openDetail(order)}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:border-green-500/30 flex-wrap"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <div className="flex-1 min-w-[160px]">
                <p className="text-white font-semibold text-sm">{order.order_number}</p>
                <p className="text-gray-500 text-xs mt-0.5">{order.recipient_name} · {order.phone}</p>
              </div>
              <p className="text-gray-400 text-xs w-28">
                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-white font-bold text-sm w-32">{formatRupiah(order.total)}</p>
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  disabled={updating}
                  className="text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none bg-black/30 text-white border border-white/10"
                >
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {detailOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDetailOrder(null)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-md h-full overflow-y-auto p-6"
              style={{ background: '#061a14', borderLeft: '1px solid rgba(34,197,94,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm">
                  <MdArrowBack size={16} /> Tutup
                </button>
                <StatusBadge status={detailOrder.status} />
              </div>

              <h2 className="text-white font-extrabold text-lg mb-1">{detailOrder.order_number}</h2>
              <p className="text-gray-500 text-xs mb-6">
                {new Date(detailOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <p className="text-gray-500 text-xs mb-1">Data Pembeli</p>
                <p className="text-white text-sm font-semibold">{detailOrder.recipient_name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{detailOrder.phone}</p>
                <p className="text-gray-400 text-xs mt-1">{detailOrder.address}</p>
                {detailOrder.notes && <p className="text-gray-500 text-xs mt-2 italic">"{detailOrder.notes}"</p>}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {detailOrder.payment_method === 'Transfer Manual' ? <MdAccountBalance size={16} className="text-green-400" /> : <MdStore size={16} className="text-green-400" />}
                  <span className="text-gray-300 text-xs">{detailOrder.payment_method}</span>
                </div>
              </div>

              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Produk Dipesan</p>
              <div className="space-y-2 mb-4">
                {detailItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-white truncate">{it.product_name}</p>
                      <p className="text-gray-500 text-xs">{it.qty} x {formatRupiah(it.price)}</p>
                    </div>
                    <p className="text-white font-semibold ml-3">{formatRupiah(it.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 mb-6">
                <span className="text-white font-bold">Total</span>
                <span className="text-green-400 font-extrabold text-lg">{formatRupiah(detailOrder.total)}</span>
              </div>

              <label className="block text-xs text-gray-400 mb-1.5">Ubah Status</label>
              <select
                value={detailOrder.status}
                onChange={(e) => handleStatusChange(detailOrder, e.target.value)}
                disabled={updating}
                className="w-full text-sm rounded-xl px-3 py-2.5 outline-none bg-black/30 text-white border border-white/10"
              >
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {detailOrder.status === 'Selesai' && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
                  <MdCheckCircle size={14} /> Stok dikurangi & poin loyalty customer sudah ditambahkan
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}