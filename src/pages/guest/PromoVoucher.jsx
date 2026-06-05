import { useState, useEffect } from 'react'
import { promos } from '../../data/guestData'
import PromoCard from '../../components/guest/PromoCard'
import { MdSearch, MdFilterList } from 'react-icons/md'

const filters = ['Semua', 'Promo', 'Birthday', 'Loyalty', 'Member']

export default function PromoVoucher() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('Semua')
  const [countdown, setCountdown] = useState({})

  // Hitung waktu tersisa tiap promo bertanggal
  useEffect(() => {
    const tick = () => {
      const result = {}
      promos.forEach((p) => {
        const diff = new Date(p.validUntil) - Date.now()
        if (isNaN(diff) || diff <= 0) { result[p.id] = 'Berakhir'; return }
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        result[p.id] = d > 0 ? `${d} hari ${h} jam lagi` : `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      })
      setCountdown(result)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const filtered = promos.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.desc.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Semua' ||
      (filter === 'Promo'   && p.type === 'promo')   ||
      (filter === 'Birthday'&& p.type === 'birthday')||
      (filter === 'Loyalty' && p.type === 'loyalty') ||
      (filter === 'Member'  && p.type === 'member')
    return matchSearch && matchFilter
  })

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#020f09' }}>
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Hemat Lebih Banyak</p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Promo & Voucher Terkini</h1>
          <p className="text-gray-400 text-base">Dapatkan penghematan terbaik untuk setiap kunjungan servis Anda.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6 pb-6" style={{ background: '#041C15' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari promo..."
                className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none" />
            </div>
            {/* Category */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-white/5 text-gray-400 border border-white/8 hover:text-white hover:bg-white/10'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promo Grid */}
      <section className="px-4 sm:px-6 py-10" style={{ background: '#041C15' }}>
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="text-white font-semibold text-lg mb-2">Tidak ada promo ditemukan</p>
              <p className="text-gray-500 text-sm">Coba kata kunci lain atau lihat semua promo</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">{filtered.length} promo tersedia</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <PromoCard key={p.id} promo={{ ...p, countdown: countdown[p.id] }} showCode />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info section */}
      <section className="px-4 sm:px-6 py-12" style={{ background: '#020f09' }}>
        <div className="max-w-3xl mx-auto rounded-2xl p-7 border text-center"
          style={{ borderColor: 'rgba(34,197,94,0.12)', background: 'rgba(34,197,94,0.04)' }}>
          <div className="text-4xl mb-4">🎂</div>
          <h3 className="text-white font-bold text-xl mb-2">Voucher Ulang Tahun Otomatis</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Daftar sebagai member dan kami akan otomatis mengirimkan voucher diskon 20% setiap ulang tahun Anda via WhatsApp & Email.
          </p>
          <a href="/guest/dashboard"
            className="inline-flex items-center gap-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
            Daftar Sekarang → Gratis
          </a>
        </div>
      </section>
    </div>
  )
}