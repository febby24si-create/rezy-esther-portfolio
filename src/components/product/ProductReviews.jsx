// ============================================================
// ProductReviews.jsx
// Komponen ulasan produk — tampil di halaman detail produk
// Rating rata-rata, filter bintang, form tulis ulasan
// ============================================================
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdStar, MdStarOutline, MdCamera, MdSend, MdVerified } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { shopAPI } from '../../services/shopAPI'

// ── Star display ─────────────────────────────────────────────
function Stars({ rating, size = 14, color = '#FBBF24' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? color : '#374151' }}>★</span>
      ))}
    </div>
  )
}

// ── Star selector for form ───────────────────────────────────
function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110"
          style={{ color: (hovered || value) >= s ? '#FBBF24' : '#374151' }}>
          ★
        </button>
      ))}
    </div>
  )
}

// ── Rating summary bar ───────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-4 text-right">{star}</span>
      <MdStar size={12} className="text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-amber-400"
        />
      </div>
      <span className="text-xs text-gray-500 w-6">{count}</span>
    </div>
  )
}

// ── Single review card ───────────────────────────────────────
function ReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
          {review.customer_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-sm font-semibold">{review.customer_name || 'Pembeli'}</p>
            {review.is_verified && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-400 font-semibold">
                <MdVerified size={11} /> Terverifikasi
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars rating={review.rating} size={12} />
            <span className="text-gray-500 text-xs">
              {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          {review.review_text && (
            <p className="text-gray-300 text-sm leading-relaxed mt-2">{review.review_text}</p>
          )}
          {review.photo_urls?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.photo_urls.map((url, i) => (
                <img key={i} src={url} alt={`foto ${i+1}`}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 cursor-pointer hover:scale-105 transition-transform"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Write review form ────────────────────────────────────────
function WriteReviewForm({ productId, orderId, onSubmitted }) {
  const { customer } = useCustomerAuth()
  const [form, setForm] = useState({ rating: 0, review_text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!form.rating) return
    setSubmitting(true)
    try {
      await shopAPI.createReview({
        product_id: productId,
        order_id: orderId,
        customer_id: customer.id,
        customer_name: customer.name,
        rating: form.rating,
        review_text: form.review_text,
        is_verified: !!orderId,
      })
      setDone(true)
      onSubmitted?.()
    } catch (err) {
      console.error('Gagal kirim review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-2xl text-center"
      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
      <p className="text-green-400 font-bold text-lg">⭐ Terima kasih atas ulasan Anda!</p>
      <p className="text-gray-400 text-sm mt-1">Review Anda membantu pembeli lain.</p>
    </motion.div>
  )

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
      <p className="text-white font-bold text-sm">Tulis Ulasan Anda</p>

      <div>
        <p className="text-gray-400 text-xs mb-2">Rating *</p>
        <StarSelector value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
        {form.rating > 0 && (
          <p className="text-amber-400 text-xs mt-1">
            {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus!'][form.rating]}
          </p>
        )}
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-1.5">Ceritakan pengalaman Anda (opsional)</p>
        <textarea
          value={form.review_text}
          onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
          rows={3}
          placeholder="Bagaimana kualitas produk ini? Apakah sesuai dengan deskripsi?"
          className="w-full px-4 py-3 rounded-xl text-sm text-white resize-none outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!form.rating || submitting}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}
      >
        {submitting ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <><MdSend size={15} /> Kirim Ulasan</>
        )}
      </motion.button>
    </div>
  )
}

// ── MAIN ProductReviews ──────────────────────────────────────
export default function ProductReviews({ productId, orderId, canReview = false }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStar, setFilterStar] = useState(0)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    shopAPI.fetchReviews(productId)
      .then(data => setReviews(data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [productId, refresh])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const starCounts = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length
  }))

  const filtered = filterStar ? reviews.filter(r => r.rating === filterStar) : reviews

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-white font-bold text-xl">Ulasan Produk</h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="rounded-2xl p-5 grid sm:grid-cols-2 gap-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Average */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-white">{avgRating.toFixed(1)}</p>
              <Stars rating={avgRating} size={18} />
              <p className="text-gray-500 text-xs mt-1">{reviews.length} ulasan</p>
            </div>
          </div>
          {/* Bars */}
          <div className="space-y-1.5">
            {starCounts.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {canReview && (
        <WriteReviewForm
          productId={productId}
          orderId={orderId}
          onSubmitted={() => setRefresh(r => r + 1)}
        />
      )}

      {/* Filter by star */}
      {reviews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[0,5,4,3,2,1].map(s => (
            <button key={s}
              onClick={() => setFilterStar(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filterStar === s
                ? { background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s === 0 ? 'Semua' : `${'★'.repeat(s)} (${reviews.filter(r => r.rating === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold">Belum ada ulasan</p>
          <p className="text-sm mt-1">Jadilah yang pertama memberi ulasan!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
        </div>
      )}
    </div>
  )
}
