import { useState, useEffect } from 'react'
import { MdDirectionsCar, MdBuild, MdPerson, MdCalendarToday, MdStar, MdExpandMore, MdExpandLess, MdRateReview, MdSearch } from 'react-icons/md'
import PageSkeleton from '../../components/ui/PageSkeleton'
import EmptyState from '../../components/EmptyState'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

// ── Rating Stars Component ─────────────────────────────────────
function StarRating({ value, onChange, size = 'text-2xl' }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className={`${size} transition-transform hover:scale-110 ${(hovered || value) >= s ? 'text-yellow-400' : 'text-gray-600'}`}>
          ★
        </button>
      ))}
    </div>
  )
}

// ── Review Modal ───────────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmit }) {
  const [form, setForm] = useState({
    rating: 0,
    reviewText: '',
    ratingMekanik: 0,
    ratingPelayanan: 0,
    ratingKecepatan: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const isValid = form.rating > 0 && form.ratingMekanik > 0 && form.ratingPelayanan > 0 && form.ratingKecepatan > 0

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    onSubmit(form)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#041C15', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Beri Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        {/* Order info */}
        <div className="p-3 rounded-xl mb-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
          <p className="text-white font-semibold text-sm">{order.service}</p>
          <p className="text-gray-400 text-xs mt-0.5">{order.id} · {order.mechanic}</p>
        </div>

        {/* Rating keseluruhan */}
        <div className="mb-5">
          <label className="block text-gray-300 text-sm font-semibold mb-3">Rating Keseluruhan *</label>
          <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} size="text-3xl" />
          {form.rating > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Luar Biasa!'][form.rating]}
            </p>
          )}
        </div>

        {/* Rating detail */}
        <div className="space-y-4 mb-5">
          {[
            { key: 'ratingMekanik',   label: 'Kualitas Mekanik'     },
            { key: 'ratingPelayanan', label: 'Pelayanan & Keramahan' },
            { key: 'ratingKecepatan', label: 'Kecepatan Servis'      },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-sm">{label} *</label>
                {form[key] > 0 && <span className="text-yellow-400 text-xs font-medium">{form[key]}/5</span>}
              </div>
              <StarRating value={form[key]} onChange={(v) => setForm(f => ({ ...f, [key]: v }))} size="text-xl" />
            </div>
          ))}
        </div>

        {/* Review text */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-semibold mb-2">Ceritakan Pengalaman Anda</label>
          <textarea
            value={form.reviewText}
            onChange={e => setForm(f => ({ ...f, reviewText: e.target.value }))}
            placeholder="Bagaimana kondisi kendaraan setelah diservis? Apakah mekanik menjelaskan dengan baik?..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div className="p-3 rounded-xl mb-5 text-xs text-yellow-400" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
          ⭐ Bonus +50 poin loyalty setelah review dikirim!
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={!isValid || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ background: isValid && !submitting ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'rgba(34,197,94,0.3)' }}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </span>
            ) : 'Kirim Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Riwayat Card ───────────────────────────────────────────────
function RiwayatCard({ order, onReview }) {
  const [open, setOpen]       = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { customer } = useCustomerAuth()

  // Simpan review di localStorage (sederhana, tanpa butuh addReview di context)
  const storageKey = `review_${customer?.id}_${order.id}`
  const savedReview = (() => { try { return JSON.parse(localStorage.getItem(storageKey)) } catch { return null } })()
  const alreadyReviewed = !!savedReview
  const isSelesai       = order.status === 'Selesai'

  const handleSubmitReview = (formData) => {
    const review = { ...formData, orderId: order.id, mechanic: order.mechanic, date: new Date().toISOString() }
    localStorage.setItem(storageKey, JSON.stringify(review))
    setShowModal(false)
    onReview?.()
  }

  return (
    <>
      {showModal && <ReviewModal order={order} onClose={() => setShowModal(false)} onSubmit={handleSubmitReview} />}

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
                      {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MdPerson className="text-green-400 text-sm" /> {order.mechanic}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-400 font-bold">{fmt(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    order.status === 'Selesai'
                      ? 'bg-green-500/15 text-green-400 border-green-500/20'
                      : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                  }`}>{order.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <MdStar className="text-sm" /> +{order.pointsEarned || Math.floor(order.total / 1000)} poin
                  </span>
                  {/* Rating badge jika sudah review */}
                  {alreadyReviewed && (
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15">
                      ✓ Sudah Direview
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {open ? <><MdExpandLess className="text-sm" />Tutup</> : <><MdExpandMore className="text-sm" />Detail</>}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Detail */}
        {open && (
          <div className="px-5 pb-5 border-t border-white/5 pt-4">
            <div>
            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Rincian Pekerjaan</p>
                <div className="space-y-2">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{it.description} <span className="text-gray-600">×{it.qty} {it.unit}</span></span>
                      <span className="text-white font-medium">{fmt((it.unitPrice || 0) * (it.qty || 1))}</span>
                    </div>
                  ))}
                  {order.laborCost > 0 && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                      <span className="text-gray-300">Jasa Servis</span>
                      <span className="text-white font-medium">{fmt(order.laborCost)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>

            {order.notes && (
              <div className="mt-4 p-3.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1.5">📋 Catatan Mekanik</p>
                <p className="text-gray-300 text-sm leading-relaxed">{order.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <span className="text-gray-400 font-semibold text-sm">Total Pembayaran</span>
              <span className="text-green-400 font-extrabold text-base">{fmt(order.total)}</span>
            </div>

            {/* Review button */}
            {isSelesai && !alreadyReviewed && (
              <button onClick={() => setShowModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                <MdRateReview /> Beri Rating & Review (+50 poin)
              </button>
            )}

            {/* Show existing review */}
            {alreadyReviewed && savedReview && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 font-bold text-sm">Review Anda</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= savedReview.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                    ))}
                  </div>
                </div>
                {savedReview.reviewText && <p className="text-gray-300 text-sm">{savedReview.reviewText}</p>}
                <p className="text-gray-500 text-xs mt-2">Dikirim {new Date(savedReview.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function RiwayatService() {
  const [search, setSearch] = useState('')
  const [allHistory, setAllHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const { customer } = useCustomerAuth()

  // Load riwayat servis dari Supabase
  useEffect(() => {
    if (!customer?.id) return
    const load = async () => {
      try {
        const { orderAPI } = await import('../../services/orderAPI')
        const data = await orderAPI.fetchByCustomer(customer.id)
        const selesai = data
          .filter(o => o.status === 'Selesai')
          .map(o => ({
            id:           o.order_number || o.id,
            vehicle:      o.vehicle_display?.split(' - ')[0] || o.vehicle_display || '',
            plate:        o.vehicle_display?.split(' - ')[1] || '',
            date:         o.order_date,
            mechanic:     o.mechanic_name || '—',
            service:      o.service,
            status:       o.status,
            total:        o.total,
            duration:     o.duration || '—',
            items:        o.estimasi?.items || [],
            laborCost:    o.estimasi?.laborCost || 0,
            notes:        o.notes || o.estimasi?.notes || '',
            pointsEarned: Math.floor((o.total || 0) / 1000),
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        setAllHistory(selesai)
      } catch (err) {
        console.error('Gagal load riwayat:', err)
      } finally {
        setLoadingHistory(false)
      }
    }
    load()
  }, [customer?.id, refresh])

  const filtered = allHistory.filter(o =>
    o.service.toLowerCase().includes(search.toLowerCase()) ||
    o.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent  = allHistory.reduce((a, b) => a + b.total, 0)
  const totalPoints = allHistory.reduce((a, b) => a + (b.pointsEarned || Math.floor(b.total / 1000)), 0)

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Histori Kendaraan</p>
        <h1 className="text-2xl font-extrabold text-white mb-6">Riwayat Service</h1>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Servis', value: allHistory.length, suffix: ' kali', color: 'text-green-400' },
            { label: 'Total Biaya',  value: `Rp ${(totalSpent / 1000000).toFixed(1)}jt`, color: 'text-white' },
            { label: 'Total Poin',   value: totalPoints, suffix: ' poin', color: 'text-yellow-400' },
          ].map(({ label, value, suffix = '', color }) => (
            <div key={label} className="rounded-xl p-4 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`text-lg font-extrabold ${color}`}>{value}{suffix}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari servis, kendaraan, atau nomor order..."
            className="w-full border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        {/* List */}
        {loadingHistory ? (
          <PageSkeleton variant="list" count={3} />
        ) : allHistory.length === 0 ? (
          <EmptyState 
            icon={MdBuild}
            title="Belum ada riwayat servis"
            description="Anda belum pernah melakukan servis. Jadwalkan servis pertama Anda sekarang!"
            actionLabel="Booking Sekarang"
            onAction={() => window.location.href = '/member/booking'}
          />
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon={MdSearch}
            title="Tidak ditemukan"
            description="Coba gunakan kata kunci lain untuk mencari histori servis Anda."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(o => (
              <RiwayatCard key={o.id} order={o} onReview={() => setRefresh(r => r + 1)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}