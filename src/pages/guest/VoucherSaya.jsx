import { useState } from 'react'
import { MdContentCopy, MdCheck, MdCardGiftcard } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

const tabs = [
  { key: 'active',  label: 'Aktif'      },
  { key: 'used',    label: 'Terpakai'   },
  { key: 'expired', label: 'Kadaluarsa' },
]

const typeIcon  = { birthday: '🎂', aftersvc: '🔧', loyalty: '⭐', member: '👋', promo: '🏷️' }
const statusStyle = {
  active:  'bg-green-500/15 text-green-400  border-green-500/25',
  used:    'bg-gray-500/15  text-gray-400   border-gray-500/25',
  expired: 'bg-red-500/15   text-red-400    border-red-500/25',
}

function isExpired(v) {
  if (v.status === 'expired') return true
  if (!v.validUntil || v.validUntil === 'Tidak Ada Batas' || v.validUntil === 'Bulan Ulang Tahun') return false
  return new Date(v.validUntil) < new Date()
}

function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const expired = isExpired(voucher)
  const status  = voucher.status === 'used' ? 'used' : expired ? 'expired' : 'active'

  const daysLeft = voucher.validUntil && voucher.validUntil !== 'Tidak Ada Batas' && voucher.validUntil !== 'Bulan Ulang Tahun'
    ? Math.ceil((new Date(voucher.validUntil) - new Date()) / 86400000)
    : null

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${status !== 'active' ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10'}`}
      style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 100%)', borderColor: 'rgba(34,197,94,0.12)' }}>

      {/* Top bar color by type */}
      <div className="h-1" style={{ background: status === 'active' ? 'linear-gradient(90deg,#22C55E,#10B981)' : 'rgba(255,255,255,0.08)' }} />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            {typeIcon[voucher.type] || '🎁'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">{voucher.title}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle[status]}`}>
              {status === 'active' ? 'Aktif' : status === 'used' ? 'Terpakai' : 'Kadaluarsa'}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-green-400 font-extrabold text-2xl">{voucher.diskon}%</p>
            <p className="text-gray-600 text-xs">DISKON</p>
          </div>
        </div>

        {/* Code */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="flex-1 font-mono text-sm text-green-300 tracking-widest truncate">{voucher.code}</span>
          {status === 'active' && (
            <button onClick={handleCopy}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 transition-all flex-shrink-0">
              {copied ? <MdCheck className="text-sm" /> : <MdContentCopy className="text-sm" />}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Berlaku s/d:</span>
          <span className={status === 'active' ? 'text-gray-300 font-medium' : 'text-gray-600'}>
            {voucher.validUntil === 'Tidak Ada Batas' || voucher.validUntil === 'Bulan Ulang Tahun'
              ? voucher.validUntil
              : new Date(voucher.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Urgency warning */}
        {status === 'active' && daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
            ⚠️ Kadaluarsa dalam {daysLeft} hari!
          </div>
        )}

        {voucher.usedAt && (
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-500">Digunakan:</span>
            <span className="text-gray-600">{new Date(voucher.usedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VoucherSaya() {
  const [tab, setTab] = useState('active')
  const { customer }  = useCustomerAuth()

  if (!customer) return null

  const allVouchers = customer.vouchers || []

  // Normalisasi status berdasarkan tanggal kadaluarsa
  const normalized = allVouchers.map(v => ({
    ...v,
    _displayStatus: v.status === 'used' ? 'used' : isExpired(v) ? 'expired' : 'active',
  }))

  const filtered    = normalized.filter(v => v._displayStatus === tab)
  const activeCount = normalized.filter(v => v._displayStatus === 'active').length
  const usedCount   = normalized.filter(v => v._displayStatus === 'used').length
  const expiredCount = normalized.filter(v => v._displayStatus === 'expired').length
  const countMap    = { active: activeCount, used: usedCount, expired: expiredCount }

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Koleksi Voucher</p>
        <h1 className="text-2xl font-extrabold text-white mb-2">Voucher Saya</h1>
        <p className="text-gray-500 text-sm mb-6">
          {activeCount > 0
            ? `${activeCount} voucher aktif menanti digunakan.`
            : 'Lakukan servis untuk mendapatkan voucher otomatis.'}
        </p>

        {/* Tabs */}
        <div className="flex border border-white/8 rounded-xl p-1 mb-6">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === key ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
              }`}>
              {label}
              {countMap[key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-green-500/30' : 'bg-white/10'}`}>
                  {countMap[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{tab === 'active' ? '🎟️' : tab === 'used' ? '✅' : '⏰'}</div>
            <p className="text-white font-semibold text-lg mb-2">
              {tab === 'active' ? 'Belum ada voucher aktif' : tab === 'used' ? 'Belum ada voucher terpakai' : 'Tidak ada voucher kadaluarsa'}
            </p>
            <p className="text-gray-500 text-sm mb-5">
              {tab === 'active' ? 'Lakukan servis atau tukar poin untuk mendapatkan voucher.' : 'Voucher yang sudah digunakan akan tampil di sini.'}
            </p>
            {tab === 'active' && (
              <div className="flex gap-3 justify-center">
                <Link to="/guest/loyalty"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-yellow-400 border border-yellow-500/25 bg-yellow-500/10 hover:bg-yellow-500/15 transition-all">
                  Tukar Poin
                </Link>
                <Link to="/guest/booking"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-500/25 bg-green-500/10 hover:bg-green-500/15 transition-all">
                  Booking Service
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((v) => <VoucherCard key={v.id} voucher={v} />)}
          </div>
        )}

        {/* Info cara dapat voucher */}
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
          <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">💡 Cara Dapat Voucher</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-400">
            <span>🔧 Otomatis setelah setiap servis</span>
            <span>🎂 Voucher ulang tahun tiap tahun</span>
            <span>⭐ Tukar poin di Reward Catalog</span>
            <span>🏆 Naik tier loyalty otomatis</span>
          </div>
        </div>
      </div>
    </div>
  )
}