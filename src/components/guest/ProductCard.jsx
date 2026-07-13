import { useNavigate } from 'react-router-dom'
import { MdShoppingCart, MdInventory2 } from 'react-icons/md'
import { useCart } from '../../hooks/useCart'
import { formatRupiah } from '../../lib/formatRupiah'

function getStockStatus(product) {
  const stock = product.stock ?? 0
  const minStock = product.min_stock ?? 0
  if (stock <= 0) return { label: 'Habis', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  if (stock <= minStock) return { label: 'Hampir Habis', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Tersedia', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const status = getStockStatus(product)
  const outOfStock = (product.stock ?? 0) <= 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product, 1)
  }

  return (
    <div
      onClick={() => navigate(`/guest/produk/${product.id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-[#111C33] border border-white/10 hover:border-blue-500/40 transition-all duration-300 flex flex-col"
    >
      {/* Foto — pakai placeholder ikon kalau belum ada photo_url */}
      <div className="relative h-40 bg-[#0B1424] flex items-center justify-center overflow-hidden">
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <MdInventory2 size={40} className="text-blue-500/30" />
        )}
        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">
          {product.category}
        </span>
        <h3 className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1">
          {product.description || 'Sparepart berkualitas untuk kendaraan Anda.'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-extrabold text-base">{formatRupiah(product.sell_price)}</span>
          <span className="text-gray-500 text-[11px]">Stok: {product.stock ?? 0}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/guest/produk/${product.id}`) }}
            className="flex-1 text-xs font-semibold py-2 rounded-lg border border-white/15 text-gray-300 hover:text-white hover:border-white/30 transition-all"
          >
            Lihat Detail
          </button>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label="Tambah ke keranjang"
            className="flex items-center justify-center w-10 h-9 rounded-lg text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
          >
            <MdShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}