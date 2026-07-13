import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdRemove, MdDelete, MdShoppingCart, MdArrowForward, MdInventory2 } from 'react-icons/md'
import { useCart } from '../../hooks/useCart'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { formatRupiah } from '../../lib/formatRupiah'

export default function Keranjang() {
  const navigate = useNavigate()
  const { items, updateQty, removeFromCart, subtotal } = useCart()
  const { customer } = useCustomerAuth()

  const handleCheckout = () => {
    // Checkout butuh customer_id — kalau belum login, arahkan ke login
    // dulu (cart tetap tersimpan di localStorage, tidak hilang).
    if (!customer) {
      navigate('/guest/login', { state: { from: '/member/checkout' } })
      return
    }
    navigate('/member/checkout')
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#0F172A' }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Keranjang Belanja</h1>
        <p className="text-gray-400 text-sm mb-8">
          {items.length > 0 ? `${items.length} produk dalam keranjang` : 'Keranjang Anda masih kosong'}
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5">
              <MdShoppingCart size={36} className="text-gray-600" />
            </div>
            <h3 className="text-white font-semibold">Belum ada produk di keranjang</h3>
            <p className="text-gray-500 text-sm max-w-xs">Jelajahi katalog sparepart kami dan tambahkan produk yang Anda butuhkan.</p>
            <button
              onClick={() => navigate('/guest/produk')}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
            >
              Lihat Katalog Produk
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Daftar item */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <motion.div
                    key={it.product_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#111C33] border border-white/10"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#0B1424] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {it.photo_url ? (
                        <img src={it.photo_url} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <MdInventory2 size={24} className="text-blue-500/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{it.name}</p>
                      <p className="text-gray-500 text-xs">{formatRupiah(it.price)} / item</p>
                      {it.qty >= it.stock && (
                        <p className="text-amber-400 text-[11px] mt-0.5">Stok maksimal tercapai</p>
                      )}
                    </div>

                    <div className="flex items-center rounded-lg border border-white/15 overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => updateQty(it.product_id, it.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <MdRemove size={14} />
                      </button>
                      <span className="w-9 text-center text-white text-sm font-semibold">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.product_id, it.qty + 1)}
                        disabled={it.qty >= it.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors"
                      >
                        <MdAdd size={14} />
                      </button>
                    </div>

                    <p className="text-white font-bold text-sm w-24 text-right flex-shrink-0">
                      {formatRupiah(it.qty * it.price)}
                    </p>

                    <button
                      onClick={() => removeFromCart(it.product_id)}
                      aria-label="Hapus dari keranjang"
                      className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <MdDelete size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Ringkasan */}
            <div className="rounded-2xl p-6 h-fit sticky top-24 bg-[#111C33] border border-white/10">
              <h3 className="text-white font-bold mb-4">Ringkasan Belanja</h3>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-white font-bold text-lg pt-3 mt-3 border-t border-white/10">
                <span>Total</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
              >
                Lanjut ke Checkout <MdArrowForward size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}