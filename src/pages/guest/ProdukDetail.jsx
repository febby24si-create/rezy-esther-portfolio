import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowBack, MdInventory2, MdAdd, MdRemove, MdShoppingCart, MdCheckCircle } from 'react-icons/md'
import { productAPI } from '../../services/productAPI'
import { useCart } from '../../hooks/useCart'
import ProductCard from '../../components/guest/ProductCard'
import { formatRupiah } from '../../lib/formatRupiah'
import PageSkeleton from '../../components/ui/PageSkeleton'

function getStockStatus(product) {
  const stock = product?.stock ?? 0
  const minStock = product?.min_stock ?? 0
  if (stock <= 0) return { label: 'Habis', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  if (stock <= minStock) return { label: 'Hampir Habis', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Tersedia', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
}

export default function ProdukDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Reset states are handled by the component re-render (key=id);
    // loading is set via initial state + the new Promise cycle.
    setQty(1)

    Promise.all([productAPI.fetchById(id), productAPI.fetchActive()])
      .then(([p, all]) => {
        if (cancelled) return
        setProduct(p)
        if (p) {
          setRelated((all || []).filter(r => r.category === p.category && r.id !== p.id).slice(0, 4))
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [id])

  const stock = product?.stock ?? 0
  const status = getStockStatus(product)
  const outOfStock = stock <= 0

  const handleQtyChange = (delta) => {
    setQty((q) => Math.min(Math.max(q + delta, 1), Math.max(stock, 1)))
  }

  const handleAddToCart = () => {
    if (outOfStock || !product) return
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen px-6 sm:px-10 lg:px-16 py-10" style={{ background: '#0F172A' }}>
        <div className="max-w-5xl mx-auto">
          <PageSkeleton variant="card" count={1} />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#0F172A' }}>
        <MdInventory2 size={56} className="text-gray-700" />
        <h2 className="text-white text-lg font-bold">Produk tidak ditemukan</h2>
        <button
          onClick={() => navigate('/guest/produk')}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
        >
          Kembali ke Katalog
        </button>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#0F172A' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <button
          onClick={() => navigate('/guest/produk')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <MdArrowBack size={16} /> Kembali ke Katalog
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-10"
        >
          {/* Foto besar */}
          <div className="rounded-2xl overflow-hidden bg-[#0B1424] border border-white/10 h-80 md:h-[420px] flex items-center justify-center">
            {product.photo_url ? (
              <img
                src={product.photo_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <MdInventory2 size={90} className="text-blue-500/25" />
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">{product.category}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              <span className="text-gray-500 text-xs">Stok tersedia: {stock}</span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mt-5">
              {product.description || 'Sparepart berkualitas untuk kendaraan Anda. Hubungi kami untuk informasi kompatibilitas lebih lanjut.'}
            </p>

            <p className="text-white font-extrabold text-3xl mt-6">{formatRupiah(product.sell_price)}</p>

            {/* Qty selector */}
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm text-gray-400">Jumlah</span>
              <div className="flex items-center rounded-xl border border-white/15 overflow-hidden">
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={outOfStock || qty <= 1}
                  className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <MdRemove size={16} />
                </button>
                <span className="w-12 text-center text-white font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  disabled={outOfStock || qty >= stock}
                  className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <MdAdd size={16} />
                </button>
              </div>
              {!outOfStock && qty >= stock && (
                <span className="text-amber-400 text-xs">Maks. stok tersedia</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="w-full sm:w-auto mt-7 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: added ? '#16a34a' : 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
            >
              {added ? <><MdCheckCircle size={18} /> Ditambahkan ke Keranjang</> : <><MdShoppingCart size={18} /> Tambah ke Keranjang</>}
            </button>
          </div>
        </motion.div>

        {/* Produk terkait */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-white font-bold text-lg mb-5">Produk Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}