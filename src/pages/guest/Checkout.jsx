import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdStore, MdAccountBalance, MdCheckCircle } from 'react-icons/md'
import { useCart } from '../../hooks/useCart'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { shopAPI } from '../../services/shopAPI'
import { formatRupiah } from '../../lib/formatRupiah'

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 transition-all"

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { customer } = useCustomerAuth()

  const [form, setForm] = useState({
    recipientName: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: '',
    paymentMethod: 'Bayar di Bengkel',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Guard: checkout butuh customer_id — kalau belum login, arahkan ke
  // login. Cart tetap aman di localStorage, tidak hilang.
  useEffect(() => {
    if (!customer) {
      navigate('/guest/login', { state: { from: '/member/checkout' } })
    } else if (items.length === 0) {
      navigate('/guest/keranjang')
    }
  }, [customer, items.length, navigate])

  if (!customer || items.length === 0) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.recipientName.trim()) newErrors.recipientName = 'Nama penerima wajib diisi'
    if (!form.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi'
    if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      const order = await shopAPI.createOrder({
        customerId: customer.id,
        recipientName: form.recipientName,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        items: items.map(it => ({
          product_id: it.product_id,
          product_name: it.name,
          qty: it.qty,
          price: it.price,
        })),
      })
      clearCart()
      navigate(`/member/pembelian/${order.id}`, { replace: true })
    } catch (err) {
      console.error('Gagal membuat pesanan produk:', err)
      setErrors({ submit: 'Gagal memproses pesanan. Silakan coba lagi.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-8" style={{ background: '#040E09' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-1">Checkout</h1>
        <p className="text-gray-400 text-sm mb-8">Lengkapi data pengiriman/pengambilan pesanan Anda.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <h3 className="text-white font-bold text-sm mb-1">Data Penerima</h3>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nama Penerima</label>
                <input
                  value={form.recipientName}
                  onChange={(e) => setForm(f => ({ ...f, recipientName: e.target.value }))}
                  className={inputCls}
                  placeholder="Nama lengkap"
                />
                {errors.recipientName && <p className="text-red-400 text-xs mt-1">{errors.recipientName}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nomor HP</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputCls}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Alamat</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className={inputCls}
                  rows={3}
                  placeholder="Alamat lengkap untuk pengiriman, atau tulis 'Ambil di Bengkel'"
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Catatan (opsional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={inputCls}
                  rows={2}
                  placeholder="Contoh: tolong siapkan sebelum jam 4 sore"
                />
              </div>
            </div>

            <div className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <h3 className="text-white font-bold text-sm mb-1">Metode Pembayaran</h3>
              {[
                { value: 'Bayar di Bengkel', icon: MdStore, desc: 'Bayar tunai/QRIS saat ambil di lokasi' },
                { value: 'Transfer Manual', icon: MdAccountBalance, desc: 'Transfer ke rekening bengkel, konfirmasi manual' },
              ].map(({ value, icon: Icon, desc }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: form.paymentMethod === value ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                    border: form.paymentMethod === value ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={form.paymentMethod === value}
                    onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    className="accent-green-500"
                  />
                  <Icon size={20} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{value}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {errors.submit && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {errors.submit}
              </div>
            )}
          </form>

          {/* Ringkasan */}
          <div className="rounded-2xl p-6 h-fit sticky top-8" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <h3 className="text-white font-bold mb-4">Pesanan Anda</h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.product_id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 truncate flex-1 mr-2">{it.name} <span className="text-gray-500">x{it.qty}</span></span>
                  <span className="text-white font-semibold flex-shrink-0">{formatRupiah(it.qty * it.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}
            >
              {submitting ? 'Memproses...' : <><MdCheckCircle size={18} /> Buat Pesanan</>}
            </motion.button>
            <p className="text-gray-500 text-[11px] text-center mt-3">
              Status awal pesanan: <span className="text-amber-400 font-medium">Menunggu Konfirmasi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}