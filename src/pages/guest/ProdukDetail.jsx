// ============================================================
// ProdukDetail.jsx — UPGRADED
// - Tombol "Beli Sekarang" (langsung checkout)
// - Sticky bottom CTA pada mobile
// - Garansi badge
// - Section ulasan produk
// - Galeri foto premium
// ============================================================
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowBack, MdInventory2, MdAdd, MdRemove, MdShoppingCart,
  MdCheckCircle, MdBolt, MdVerified, MdStar, MdLocalShipping,
  MdShield, MdStore,
} from 'react-icons/md'
import { productAPI } from '../../services/productAPI'
import { useCart } from '../../hooks/useCart'
import ProductCard from '../../components/guest/ProductCard'
import ProductReviews from '../../components/product/ProductReviews'
import { formatRupiah } from '../../lib/formatRupiah'
import PageSkeleton from '../../components/ui/PageSkeleton'

function getStockStatus(product) {
  const stock = product?.stock ?? 0
  const minStock = product?.min_stock ?? 0
  if (stock <= 0) return { label: 'Habis', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  if (stock <= minStock) return { label: 'Hampir Habis', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Tersedia', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
}

// Star display mini
function MiniStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= Math.round(rating || 0) ? '#FBBF24' : '#374151' }}>★</span>
      ))}
    </div>
  )
}

export default function ProdukDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [selectedImg, setSelectedImg] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    let cancelled = false
    setQty(1)
    setSelectedImg(0)

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

  // Build foto gallery (bisa multi foto di masa depan)
  const photos = product?.photo_url ? [product.photo_url] : []

  const handleQtyChange = (delta) => {
    setQty(q => Math.min(Math.max(q + delta, 1), Math.max(stock, 1)))
  }

  const handleAddToCart = () => {
    if (outOfStock || !product) return
    addToCart(product, qty)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleBuyNow = async () => {
    if (outOfStock || !product) return
    setBuyLoading(true)
    // Tambah ke cart terlebih dahulu, lalu navigate ke checkout
    addToCart(product, qty)
    await new Promise(r => setTimeout(r, 400)) // UX feedback
    setBuyLoading(false)
    navigate('/member/checkout', { state: { buyNow: true, productId: product.id, qty } })
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen px-6 sm:px-10 lg:px-16 py-10" style={{ background: '#040E09' }}>
        <div className="max-w-5xl mx-auto">
          <PageSkeleton variant="card" count={1} />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#040E09' }}>
        <MdInventory2 size={56} className="text-gray-700" />
        <h2 className="text-white text-lg font-bold">Produk tidak ditemukan</h2>
        <button onClick={() => navigate('/guest/produk')}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
          Kembali ke Katalog
        </button>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen pb-28 sm:pb-10" style={{ background: '#040E09' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <button onClick={() => navigate('/guest/produk')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6 group">
          <MdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Katalog
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-10"
        >
          {/* ── Foto Gallery ─────────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center"
              style={{ background: 'rgba(8,24,16,0.8)', border: '1px solid rgba(34,197,94,0.12)' }}>

              {/* Status badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>

              {/* Warranty badge */}
              {product.warranty_months > 0 && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <MdShield size={12} /> Garansi {product.warranty_months}bl
                  </span>
                </div>
              )}

              {photos.length > 0 ? (
                <img
                  key={selectedImg}
                  src={photos[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <MdInventory2 size={80} className="text-green-900/50" />
                  <p className="text-gray-600 text-sm">Foto produk belum tersedia</p>
                </div>
              )}
            </div>

            {/* Thumbnail strip (for future multi-photo) */}
            {photos.length > 1 && (
              <div className="flex gap-2">
                {photos.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: selectedImg === i ? '#22C55E' : 'rgba(255,255,255,0.1)' }}>
                    <img src={url} alt={`foto ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ──────────────────────────────────── */}
          <div className="space-y-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">{product.category}</span>
              {product.is_active && (
                <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <MdVerified size={10} className="inline mr-0.5" />Tersedia
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{product.name}</h1>

            {/* Rating mini */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <MiniStars rating={avgRating} />
                <span className="text-amber-400 text-sm font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-xs">({reviewCount} ulasan)</span>
              </div>
            )}

            {/* Price */}
            <div>
              <p className="text-4xl font-extrabold text-white">{formatRupiah(product.sell_price)}</p>
              <p className="text-gray-500 text-xs mt-1">Harga sudah termasuk pajak</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Stok:</span>
              <span className="text-sm font-bold" style={{ color: status.color }}>{stock} unit</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Garansi detail */}
            {product.warranty_months > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
              >
                <MdShield className="text-blue-400 flex-shrink-0" size={20} />
                <div>
                  <p className="text-blue-400 font-bold text-sm">Garansi Resmi {product.warranty_months} Bulan</p>
                  <p className="text-gray-400 text-xs">{product.warranty_desc || 'Garansi berlaku sejak tanggal pembelian.'}</p>
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: MdLocalShipping, text: 'Pengiriman ke Rumah' },
                { icon: MdStore, text: 'Ambil di Bengkel' },
                { icon: MdVerified, text: 'Produk Original' },
                { icon: MdShield, text: 'Terjamin Kualitas' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon size={14} className="text-green-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Jumlah</span>
              <div className="flex items-center rounded-xl border border-white/15 overflow-hidden">
                <button onClick={() => handleQtyChange(-1)} disabled={outOfStock || qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors">
                  <MdRemove size={18} />
                </button>
                <span className="w-12 text-center text-white font-bold text-sm">{qty}</span>
                <button onClick={() => handleQtyChange(1)} disabled={outOfStock || qty >= stock}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors">
                  <MdAdd size={18} />
                </button>
              </div>
              {!outOfStock && qty >= stock && (
                <span className="text-amber-400 text-xs">Maks. stok</span>
              )}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden sm:flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={outOfStock}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-40 transition-all"
                style={{
                  background: addedToCart ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  border: addedToCart ? '1.5px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.15)',
                  color: addedToCart ? '#22C55E' : '#fff',
                }}
              >
                {addedToCart
                  ? <><MdCheckCircle size={18} /> Ditambahkan!</>
                  : <><MdShoppingCart size={18} /> Tambah ke Keranjang</>}
              </motion.button>
              <motion.button
                onClick={handleBuyNow}
                disabled={outOfStock || buyLoading}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
              >
                {buyLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><MdBolt size={18} /> Beli Sekarang</>
                )}
              </motion.button>
            </div>

            {/* Subtotal */}
            {qty > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <span className="text-gray-400 text-sm">Subtotal ({qty} item)</span>
                <span className="text-green-400 font-extrabold text-base">{formatRupiah(qty * product.sell_price)}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Produk terkait */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-white font-bold text-xl mb-5">Produk Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Ulasan produk */}
        <ProductReviews
          productId={id}
          onLoaded={(count, avg) => { setReviewCount(count); setAvgRating(avg) }}
        />
      </div>

      {/* ── STICKY MOBILE CTA ─────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-4"
        style={{ background: 'rgba(4,14,9,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="flex gap-3">
          <motion.button
            onClick={handleAddToCart}
            disabled={outOfStock}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{
              background: addedToCart ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
              border: addedToCart ? '1.5px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.12)',
              color: addedToCart ? '#22C55E' : '#fff',
            }}
          >
            {addedToCart ? <><MdCheckCircle size={17} /> Ditambahkan</> : <><MdShoppingCart size={17} /> Keranjang</>}
          </motion.button>
          <motion.button
            onClick={handleBuyNow}
            disabled={outOfStock || buyLoading}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
          >
            {buyLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : <><MdBolt size={17} /> Beli Sekarang</>}
          </motion.button>
        </div>
      </div>
    </div>
  )
}