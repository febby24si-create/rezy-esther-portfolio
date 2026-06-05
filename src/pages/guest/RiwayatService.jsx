import { useState } from 'react'
import { serviceHistory } from '../../data/guestData'
import { MdDirectionsCar, MdBuild, MdPerson, MdCalendarToday, MdStar, MdExpandMore, MdExpandLess } from 'react-icons/md'

function formatRupiah(n) { return 'Rp ' + n.toLocaleString('id-ID') }

function RiwayatCard({ order }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 100%)', borderColor: 'rgba(34,197,94,0.12)' }}>

      {/* Summary row */}
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center flex-shrink-0">
            <MdBuild className="text-green-400 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-bold text-sm">{order.service}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MdDirectionsCar className="text-green-400 text-sm" />
                    {order.vehicle} · {order.plate}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MdCalendarToday className="text-green-400 text-sm" />
                    {new Date(order.date).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MdPerson className="text-green-400 text-sm" /> {order.mechanic}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-green-400 font-bold">{formatRupiah(order.total)}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <MdStar className="text-sm" /> +{order.pointsEarned} poin
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                {open ? <><MdExpandLess className="text-sm" />Tutup Detail</> : <><MdExpandMore className="text-sm" />Lihat Detail</>}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Detail */}
      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sparepart */}
            {order.parts.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Sparepart</p>
                <div className="space-y-2">
                  {order.parts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{p.name} <span className="text-gray-600">×{p.qty}</span></span>
                      <span className="text-white font-medium">{formatRupiah(p.price * p.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Jasa */}
            {order.jasa.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Jasa</p>
                <div className="space-y-2">
                  {order.jasa.map((j, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{j.name}</span>
                      <span className="text-white font-medium">{formatRupiah(j.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Catatan mekanik */}
          {order.notes && (
            <div className="mt-4 p-3.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1.5">📋 Catatan Mekanik</p>
              <p className="text-gray-300 text-sm leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
            <span className="text-gray-400 font-semibold text-sm">Total</span>
            <span className="text-green-400 font-extrabold text-base">{formatRupiah(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RiwayatService() {
  const [search, setSearch] = useState('')

  const filtered = serviceHistory.filter((o) =>
    o.service.toLowerCase().includes(search.toLowerCase()) ||
    o.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent = serviceHistory.reduce((a, b) => a + b.total, 0)
  const totalPoints = serviceHistory.reduce((a, b) => a + b.pointsEarned, 0)

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Histori Kendaraan</p>
        <h1 className="text-2xl font-extrabold text-white mb-6">Riwayat Service</h1>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Servis',   value: serviceHistory.length, suffix: 'kali',   color: 'text-green-400' },
            { label: 'Total Biaya',    value: `Rp ${(totalSpent/1000000).toFixed(1)}jt`, color: 'text-white'     },
            { label: 'Total Poin',     value: totalPoints, suffix: ' poin',            color: 'text-yellow-400' },
          ].map(({ label, value, suffix = '', color }) => (
            <div key={label} className="rounded-xl p-4 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`text-lg font-extrabold ${color}`}>{value}{suffix}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari servis, kendaraan, atau nomor order..."
            className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none transition-colors" />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-semibold text-lg mb-2">Tidak ditemukan</p>
            <p className="text-gray-500 text-sm">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => <RiwayatCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  )
}