// ============================================================
// QRISModal.jsx
// Modal QRIS Payment — QR code + countdown + status real-time
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdCheckCircle, MdRefresh, MdCopyAll, MdCheck } from 'react-icons/md'
import { QRCodeSVG } from 'qrcode.react'
import { formatRupiah } from '../../lib/formatRupiah'

const QRIS_TIMEOUT = 15 * 60 // 15 menit dalam detik

function CountdownRing({ timeLeft, total }) {
  const pct = timeLeft / total
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  const color = pct > 0.4 ? '#22C55E' : pct > 0.15 ? '#F59E0B' : '#EF4444'

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <motion.circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.5 }}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
        {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
      </text>
    </svg>
  )
}

function QRISStatus({ status }) {
  const config = {
    waiting:  { icon: '⏳', label: 'Menunggu Pembayaran', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    checking: { icon: '🔄', label: 'Memverifikasi...', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    success:  { icon: '✅', label: 'Pembayaran Berhasil!', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    expired:  { icon: '⏰', label: 'Kode QRIS Kadaluarsa', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  }[status] || {}

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}25` }}
    >
      <motion.span
        animate={status === 'checking' ? { rotate: 360 } : {}}
        transition={status === 'checking' ? { repeat: Infinity, duration: 1 } : {}}
      >
        {config.icon}
      </motion.span>
      {config.label}
    </motion.div>
  )
}

export default function QRISModal({ open, orderNumber, total, onSuccess, onClose }) {
  const [timeLeft, setTimeLeft] = useState(QRIS_TIMEOUT)
  const [status, setStatus] = useState('waiting') // waiting | checking | success | expired
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  // QRIS string (simulasi — format QRIS real butuh payment gateway)
  const qrisString = `ESTHERGARAGE|${orderNumber}|${total}|SPAREPART`

  // Countdown
  useEffect(() => {
    if (!open || status === 'success') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setStatus('expired')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [open, status])

  // Simulate payment polling (setiap 5 detik — di produksi pakai Supabase Realtime)
  // Untuk demo: auto-success setelah 30 detik jika masih waiting
  useEffect(() => {
    if (!open || status !== 'waiting') return
    const AUTO_SUCCESS_DELAY = 999999 // disabled di produksi — admin konfirmasi manual
    pollRef.current = setTimeout(() => {
      // Di produksi: cek status order di Supabase
      // setStatus('checking')
      // setTimeout(() => setStatus('success'), 1500)
    }, AUTO_SUCCESS_DELAY)
    return () => clearTimeout(pollRef.current)
  }, [open, status])

  // Reset saat buka
  useEffect(() => {
    if (open) {
      setTimeLeft(QRIS_TIMEOUT)
      setStatus('waiting')
      setCopied(false)
    }
  }, [open])

  const handleCopy = () => {
    navigator.clipboard.writeText(qrisString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefresh = () => {
    setTimeLeft(QRIS_TIMEOUT)
    setStatus('waiting')
  }

  const handleSimulateSuccess = () => {
    setStatus('checking')
    setTimeout(() => {
      setStatus('success')
      clearInterval(timerRef.current)
      setTimeout(() => onSuccess?.(), 2000)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={status !== 'success' ? onClose : undefined}
            className="fixed inset-0 z-50 bg-black/75"
            style={{ backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'rgba(4,14,9,0.98)', border: '1px solid rgba(59,130,246,0.25)', backdropFilter: 'blur(24px)' }}>

              {/* Header */}
              <div className="px-6 pt-5 pb-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-white font-extrabold text-lg">Bayar dengan QRIS</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Scan dengan aplikasi e-wallet atau bank Anda</p>
                </div>
                {status !== 'success' && (
                  <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/8">
                    <MdClose size={20} />
                  </button>
                )}
              </div>

              <div className="px-6 py-5 space-y-5">
                {status === 'success' ? (
                  /* Success state */
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-7xl mb-4"
                    >✅</motion.div>
                    <p className="text-green-400 font-extrabold text-2xl">Pembayaran Berhasil!</p>
                    <p className="text-gray-400 text-sm mt-2">Pesanan Anda sedang diproses oleh admin.</p>
                  </motion.div>
                ) : status === 'expired' ? (
                  /* Expired state */
                  <div className="text-center py-4 space-y-4">
                    <div className="text-5xl">⏰</div>
                    <p className="text-red-400 font-bold">Kode QRIS Kadaluarsa</p>
                    <p className="text-gray-400 text-sm">QR code berlaku selama 15 menit. Silakan refresh untuk mendapatkan kode baru.</p>
                    <motion.button onClick={handleRefresh} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }}>
                      <MdRefresh size={16} /> Refresh QR
                    </motion.button>
                  </div>
                ) : (
                  /* Active QRIS */
                  <>
                    {/* Order info */}
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <div>
                        <p className="text-gray-400 text-xs">No. Order</p>
                        <p className="text-white font-mono font-bold text-sm">{orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Total Bayar</p>
                        <p className="text-blue-400 font-extrabold text-lg">{formatRupiah(total)}</p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-2xl bg-white relative">
                        <QRCodeSVG
                          value={qrisString}
                          size={180}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            src: '',
                            height: 32,
                            width: 32,
                            excavate: true,
                          }}
                        />
                        {/* Esther Garage logo overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center"
                            style={{ boxShadow: '0 0 0 4px white' }}>
                            <span className="text-white font-extrabold text-xs">EG</span>
                          </div>
                        </div>
                      </div>

                      {/* Countdown */}
                      <div className="flex items-center gap-3">
                        <CountdownRing timeLeft={timeLeft} total={QRIS_TIMEOUT} />
                        <div>
                          <p className="text-white font-bold text-sm">Batas Waktu</p>
                          <p className="text-gray-400 text-xs">QR kedaluwarsa dalam</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <QRISStatus status={status} />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-gray-400 text-xs font-semibold">Cara Bayar:</p>
                      {[
                        '1. Buka aplikasi e-wallet / m-banking Anda',
                        '2. Pilih menu QRIS atau Scan QR',
                        '3. Scan QR code di atas',
                        '4. Konfirmasi pembayaran',
                      ].map((s, i) => (
                        <p key={i} className="text-gray-500 text-xs">{s}</p>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={handleCopy}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#22C55E' : '#9CA3AF' }}>
                        {copied ? <MdCheck size={14} /> : <MdCopyAll size={14} />}
                        {copied ? 'Disalin!' : 'Salin Kode'}
                      </button>
                      {/* DEMO: tombol simulasi sukses — di produksi hapus ini */}
                      <button onClick={handleSimulateSuccess}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                        ✓ Simulasi Bayar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
