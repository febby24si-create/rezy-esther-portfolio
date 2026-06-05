import { useState } from 'react'
import { layanan } from '../../data/guestData'
import ServiceCard from '../../components/guest/ServiceCard'
import { MdSearch } from 'react-icons/md'

const categories = ['Semua', 'Perawatan', 'Performa', 'Ban & Kaki', 'Kenyamanan', 'Elektronik']

export default function Layanan() {
  const [search, setSearch]     = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')

  const filtered = layanan.filter((l) => {
    const matchSearch   = l.name.toLowerCase().includes(search.toLowerCase()) ||
                          l.desc.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'Semua' || l.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Layanan Kami</p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Servis Lengkap untuk Kendaraan Anda</h1>
          <p className="text-gray-400 text-base leading-relaxed">Semua layanan dikerjakan oleh mekanik bersertifikat dengan peralatan diagnostik modern.</p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="px-4 sm:px-6 pb-6" style={{ background: '#041C15' }}>
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="relative max-w-sm mb-5">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari layanan..."
              className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none transition-colors"
            />
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === c
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-white/5 text-gray-400 border border-white/8 hover:text-white hover:bg-white/10'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Service Grid */}
      <section className="px-4 sm:px-6 py-10" style={{ background: '#041C15' }}>
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-semibold text-lg mb-2">Layanan tidak ditemukan</p>
              <p className="text-gray-500 text-sm">Coba kata kunci atau kategori lain</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-5">{filtered.length} layanan ditemukan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}