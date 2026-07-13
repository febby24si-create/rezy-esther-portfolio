import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MdSearch, MdShoppingCart, MdInventory2 } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { productAPI } from '../../services/productAPI'
import { useCart } from '../../hooks/useCart'
import ProductCard from '../../components/guest/ProductCard'
import PageSkeleton from '../../components/ui/PageSkeleton'
import EmptyState from '../../components/EmptyState'

// "Jasa" (ongkos pasang/labor) sengaja dikeluarkan dari katalog customer —
// itu bukan barang fisik dengan konsep stok, jadi tidak masuk akal dijual
// lewat keranjang belanja. Tetap ada di modul Inventory admin seperti biasa.
const EXCLUDED_CATEGORIES = ['Jasa']

export default function ProdukKatalog() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')

  useEffect(() => {
    let cancelled = false
    productAPI.fetchActive()
      .then((data) => {
        if (cancelled) return
        setProducts((data || []).filter(p => !EXCLUDED_CATEGORIES.includes(p.category)))
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean))
    return ['Semua', ...Array.from(set).sort()]
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      const matchCategory = category === 'Semua' || p.category === category
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [products, search, category])

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#0F172A' }}>
      {/* ─── HEADER ─── */}
      <section className="relative py-16 px-6 sm:px-10 lg:px-16 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">Toko Sparepart</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
              Produk & <span className="gradient-text-brand">Sparepart Original</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-lg">
              Sparepart berkualitas langsung dari stok bengkel — beli online, ambil di lokasi atau kami kirim.
            </p>
          </motion.div>

          <button
            onClick={() => navigate('/guest/keranjang')}
            className="relative inline-flex items-center gap-2.5 self-start md:self-auto bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-5 py-3 rounded-xl transition-all"
          >
            <MdShoppingCart size={18} />
            Keranjang
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ─── FILTER ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau kode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                style={category === c
                  ? { background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GRID PRODUK ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <PageSkeleton variant="card" count={8} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={MdInventory2}
              title="Produk tidak ditemukan"
              description="Coba kata kunci atau kategori lain."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}