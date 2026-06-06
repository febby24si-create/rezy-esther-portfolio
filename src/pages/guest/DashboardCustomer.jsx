import { Link } from 'react-router-dom'
import {
  MdDirectionsCar, MdBuild, MdCardGiftcard, MdStars, MdNotifications,
  MdArrowForward, MdStar, MdGpsFixed, MdCheckCircle, MdEmojiEvents,
  MdTrendingUp, MdLogout
} from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import { activeTracking } from '../../data/guestData'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const NOTIF_STYLE = {
  reminder: 'bg-orange-500/15 text-orange-400',
  promo:    'bg-purple-500/15 text-purple-400',
  point:    'bg-yellow-500/15 text-yellow-400',
  followup: 'bg-blue-500/15   text-blue-400',
}

// Hitung CRM notifications berdasarkan data customer
function buildNotifications(customer) {
  const notifs = []
  const today = new Date()

  // Reminder service (jika kendaraan ada nextService dalam 30 hari)
  if (customer.vehicles) {
    customer.vehicles.forEach(v => {
      const days = Math.ceil((new Date(v.nextService) - today) / 86400000)
      if (days <= 60 && days > 0) {
        notifs.push({
          id: 'N-SVC-' + v.id,
          type: 'reminder', icon: '🔔',
          title: `Reminder Service — ${v.brand} ${v.model}`,
          desc: `Jadwal service berikutnya ${days} hari lagi (${new Date(v.nextService).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}).`,
          action: 'Booking Sekarang', actionPath: '/guest/booking', priority: days <= 14 ? 'high' : 'medium',
        })
      }
    })
  }

  // Ulang tahun
  if (customer.birthDate) {
    const birth = new Date(customer.birthDate)
    const thisYear = today.getFullYear()
    const bday = new Date(thisYear, birth.getMonth(), birth.getDate())
    const diffDays = Math.ceil((bday - today) / 86400000)
    if (diffDays >= 0 && diffDays <= 30) {
      notifs.push({
        id: 'N-BDAY',
        type: 'promo', icon: '🎂',
        title: diffDays === 0 ? 'Selamat Ulang Tahun! 🎉' : `Ulang Tahun ${diffDays} Hari Lagi`,
        desc: 'Voucher diskon 20% khusus ulang tahun siap untukmu!',
        action: 'Lihat Voucher', actionPath: '/guest/voucher', priority: 'high',
      })
    }
  }

  // Point terbaru
  const lastPoint = (customer.pointHistory || [])[0]
  if (lastPoint && lastPoint.type === 'in') {
    notifs.push({
      id: 'N-PTS',
      type: 'point', icon: '⭐',
      title: 'Point Loyalty Bertambah',
      desc: `+${lastPoint.points} poin dari "${lastPoint.desc}". Total: ${(customer.points || 0).toLocaleString('id-ID')} poin.`,
      action: 'Lihat Point', actionPath: '/guest/loyalty', priority: 'medium',
    })
  }

  // Voucher aktif
  const activeVouchers = (customer.vouchers || []).filter(v => v.status === 'active')
  if (activeVouchers.length > 0) {
    notifs.push({
      id: 'N-VCH',
      type: 'promo', icon: '🎁',
      title: `${activeVouchers.length} Voucher Menanti Digunakan`,
      desc: 'Gunakan voucher Anda sebelum kadaluarsa.',
      action: 'Lihat Voucher', actionPath: '/guest/voucher', priority: 'low',
    })
  }

  // Follow up review
  notifs.push({
    id: 'N-REV',
    type: 'followup', icon: '💬',
    title: 'Bagaimana Servis Anda?',
    desc: 'Beri rating untuk mendapatkan +50 poin bonus.',
    action: 'Beri Rating', actionPath: '/guest/riwayat', priority: 'low',
  })

  return notifs.slice(0, 6)
}

export default function DashboardCustomer() {
  const { customer, logout } = useCustomerAuth()
  if (!customer) return null

  const loyalty       = calcLoyaltyProgress(customer.points || 0)
  const tierCfg       = TIER_CONFIG[loyalty.tier]
  const activeVouchers = (customer.vouchers || []).filter(v => v.status === 'active').length
  const orders         = JSON.parse(localStorage.getItem('garage_orders') || '[]')
  const myOrders       = orders.filter(o => o.customer === customer.name)
  const notifications  = buildNotifications(customer)
  const highPriority   = notifications.filter(n => n.priority === 'high').length

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-5xl mx-auto py-10">

        {/* ── Greeting ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-lg flex-shrink-0"
              style={{ background: tierCfg.color }}>
              {getInitials(customer.name)}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Selamat datang kembali 👋</p>
              <h1 className="text-xl font-extrabold text-white">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}>
                  {tierCfg.icon} {loyalty.tier} Member
                </span>
                <span className="text-gray-500 text-xs">{customer.totalOrders || 0} kali servis</span>
                <span className="text-gray-500 text-xs">·</span>
                <span className="text-gray-500 text-xs">Bergabung {new Date(customer.joinDate).getFullYear()}</span>
              </div>
            </div>
          </div>
          <Link to="/guest/booking"
            className="flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-green-500/25 transition-all self-start sm:self-auto"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
            🚗 Booking Service <MdArrowForward />
          </Link>
        </div>

        {/* ── Loyalty Progress Card ─────────────────────────── */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MdStars style={{ color: tierCfg.color }} className="text-xl" />
              <span className="text-white font-bold text-sm">Program Loyalitas</span>
            </div>
            <Link to="/guest/loyalty" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
              Detail <MdArrowForward className="text-sm" />
            </Link>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold" style={{ color: tierCfg.color }}>
                {(customer.points || 0).toLocaleString('id-ID')}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                {loyalty.nextTier ? `/ ${TIER_CONFIG[loyalty.nextTier].min.toLocaleString('id-ID')} poin` : 'poin (Tier Tertinggi)'}
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: tierCfg.color }}>{loyalty.progress}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${loyalty.progress}%`, background: tierCfg.color }} />
          </div>
          <p className="text-xs text-gray-500">
            {loyalty.nextTier
              ? `${loyalty.pointsToNext.toLocaleString('id-ID')} poin lagi menuju ${tierCfg.icon.replace(/[^a-zA-Z]/g,'')} ${loyalty.nextTier}`
              : `🎉 Anda sudah mencapai tier tertinggi — Platinum!`}
          </p>
        </div>

        {/* ── Quick Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: MdStars,         label: 'Loyalty Point',  value: (customer.points || 0).toLocaleString('id-ID'), color: tierCfg.color,    path: '/guest/loyalty'    },
            { icon: MdCardGiftcard,  label: 'Voucher Aktif',  value: activeVouchers,                                 color: '#A855F7',         path: '/guest/voucher'    },
            { icon: MdBuild,         label: 'Total Servis',   value: customer.totalOrders || 0,                      color: '#22C55E',         path: '/guest/riwayat'    },
            { icon: MdDirectionsCar, label: 'Kendaraan',      value: (customer.vehicles || []).length,               color: '#60A5FA',         path: '/guest/dashboard'  },
          ].map(({ icon: Icon, label, value, color, path }) => (
            <Link to={path} key={label}
              className="rounded-xl p-4 border hover:border-green-500/25 transition-all hover:bg-white/3 group"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <Icon className="text-xl mb-2" style={{ color }} />
              <p className="text-white font-extrabold text-xl">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Kendaraan */}
            <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2"><MdDirectionsCar className="text-green-400" /> Kendaraan Saya</h2>
              </div>
              {(customer.vehicles || []).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Belum ada kendaraan terdaftar.</p>
              ) : (
                <div className="space-y-3">
                  {(customer.vehicles || []).map((v) => {
                    const daysUntil = Math.ceil((new Date(v.nextService) - new Date()) / 86400000)
                    const urgent    = daysUntil <= 30
                    return (
                      <div key={v.id} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:border-green-500/25"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{v.brand} {v.model}</p>
                          <p className="text-gray-500 text-xs">{v.plate} · {(v.km || 0).toLocaleString('id-ID')} km</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${urgent ? 'text-orange-400' : 'text-gray-400'}`}>
                            {urgent ? `⚠️ ${daysUntil} hari lagi` : `${daysUntil} hari`}
                          </p>
                          <p className="text-gray-600 text-xs">Service berikutnya</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Active Tracking */}
            <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2"><MdGpsFixed className="text-green-400" /> Service Aktif</h2>
                <Link to="/guest/tracking" className="text-xs text-green-400 hover:text-green-300">Detail →</Link>
              </div>
              {myOrders.filter(o => o.status === 'Sedang Dikerjakan').length > 0 ? (
                myOrders.filter(o => o.status === 'Sedang Dikerjakan').slice(0, 1).map(o => (
                  <div key={o.id} className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-sm">{o.id}</p>
                        <p className="text-gray-400 text-xs">{o.service}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Dalam Proses
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">Mekanik: <span className="text-white">{o.mechanic}</span></p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
                  <MdCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Tidak ada service aktif saat ini.</p>
                  <Link to="/guest/booking" className="text-green-400 text-xs hover:text-green-300 mt-1 inline-block">Buat booking baru →</Link>
                </div>
              )}
            </div>

            {/* Achievement preview */}
            <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2"><MdEmojiEvents className="text-yellow-400" /> Achievement</h2>
              </div>
              {(() => {
                const achievements = [
                  { id: 'first_service',   label: 'First Service',   icon: '🔧', check: customer.totalOrders >= 1    },
                  { id: 'loyal_5',         label: 'Loyal Customer',  icon: '⭐', check: customer.totalOrders >= 5    },
                  { id: 'loyal_10',        label: 'Elite Customer',  icon: '👑', check: customer.totalOrders >= 10   },
                  { id: 'silver_member',   label: 'Silver Member',   icon: '🥈', check: ['Silver','Gold','Platinum'].includes(loyalty.tier) },
                  { id: 'gold_member',     label: 'Gold Member',     icon: '🥇', check: ['Gold','Platinum'].includes(loyalty.tier)          },
                  { id: 'platinum_member', label: 'Platinum Member', icon: '💎', check: loyalty.tier === 'Platinum'                         },
                  { id: 'big_spender',     label: 'Big Spender',     icon: '💰', check: (customer.totalSpent || 0) >= 2000000              },
                  { id: 'top_reviewer',    label: 'Top Reviewer',    icon: '📝', check: (customer.reviewCount || 0) >= 3                   },
                ]
                return (
                  <div className="grid grid-cols-4 gap-2">
                    {achievements.map(a => (
                      <div key={a.id}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${a.check ? '' : 'opacity-30'}`}
                        style={{ background: a.check ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${a.check ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                        <span className="text-2xl">{a.icon}</span>
                        <span className="text-xs text-gray-400 leading-tight">{a.label}</span>
                        {a.check && <span className="text-xs text-yellow-400 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

          </div>

          {/* ── Right: Notifications ───────────────────────── */}
          <div>
            <div className="rounded-2xl border p-5 sticky top-20" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                  <MdNotifications className="text-green-400" /> Notifikasi CRM
                  {highPriority > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{highPriority}</span>
                  )}
                </h2>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl border border-white/6 hover:border-white/12 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-start gap-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${NOTIF_STYLE[n.type]}`}>
                        {n.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs leading-tight mb-1">{n.title}</p>
                        <p className="text-gray-400 text-xs leading-relaxed mb-2">{n.desc}</p>
                        <Link to={n.actionPath} className="text-xs text-green-400 hover:text-green-300 font-medium">{n.action} →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logout */}
              <button onClick={logout}
                className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
                <MdLogout size={16} /> Keluar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}