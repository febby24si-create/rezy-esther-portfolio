import { Link } from 'react-router-dom'
import {
  MdDirectionsCar, MdBuild, MdCardGiftcard, MdStars, MdNotifications,
  MdCalendarMonth, MdArrowForward, MdStar, MdGpsFixed, MdCheckCircle
} from 'react-icons/md'
import { myVehicles, myVouchers, loyaltyData, crmNotifications, serviceHistory, activeTracking } from '../../data/guestData'

const CUSTOMER = { name: 'Budi Santoso', tier: 'Gold', joinDate: '2023-03-15', totalService: 12 }

const tierColor = { Silver: 'from-gray-400 to-slate-500', Gold: 'from-yellow-400 to-amber-500', Platinum: 'from-cyan-400 to-blue-500' }

const notifTypeStyle = {
  reminder: 'bg-orange-500/15 text-orange-400',
  promo:    'bg-purple-500/15 text-purple-400',
  point:    'bg-yellow-500/15 text-yellow-400',
  followup: 'bg-blue-500/15   text-blue-400',
}
const priorityDot = { high: 'bg-red-400', medium: 'bg-yellow-400', low: 'bg-gray-500' }

export default function DashboardCustomer() {
  const activeVouchers = myVouchers.filter(v => v.status === 'active').length
  const lastService    = serviceHistory[0]
  const nextVehicle    = myVehicles.find(v => new Date(v.nextService) > new Date())

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-5xl mx-auto py-10">

        {/* ── Greeting ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tierColor[CUSTOMER.tier]} flex items-center justify-center text-xl font-extrabold text-white shadow-lg`}>
              {CUSTOMER.name.split(' ').map(w => w[0]).slice(0,2).join('')}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Selamat datang kembali 👋</p>
              <h1 className="text-xl font-extrabold text-white">{CUSTOMER.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${tierColor[CUSTOMER.tier]} text-white`}>
                  {CUSTOMER.tier} Member
                </span>
                <span className="text-gray-500 text-xs">{CUSTOMER.totalService} kali servis</span>
              </div>
            </div>
          </div>
          <Link to="/guest/booking"
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-green-500/25 transition-all self-start sm:self-auto">
            🚗 Booking Service
            <MdArrowForward />
          </Link>
        </div>

        {/* ── Quick Stats ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: MdStars,        label: 'Loyalty Point',  value: loyaltyData.currentPoints.toLocaleString('id-ID'), color: 'text-yellow-400', path: '/guest/loyalty' },
            { icon: MdCardGiftcard, label: 'Voucher Aktif',  value: activeVouchers,                                    color: 'text-purple-400', path: '/guest/voucher' },
            { icon: MdBuild,        label: 'Total Servis',   value: CUSTOMER.totalService,                             color: 'text-green-400',  path: '/guest/riwayat' },
            { icon: MdDirectionsCar,label: 'Kendaraan',      value: myVehicles.length,                                 color: 'text-blue-400',   path: '/guest/dashboard' },
          ].map(({ icon: Icon, label, value, color, path }) => (
            <Link to={path} key={label}
              className="rounded-xl p-4 border border-white/8 hover:border-green-500/25 transition-all hover:bg-white/3 group" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Icon className={`text-xl ${color} mb-2`} />
              <p className="text-white font-extrabold text-xl">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Kendaraan + Tracking ───────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Kendaraan Saya */}
            <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2"><MdDirectionsCar className="text-green-400" /> Kendaraan Saya</h2>
                <Link to="/guest/dashboard" className="text-xs text-green-400 hover:text-green-300">Kelola →</Link>
              </div>
              <div className="space-y-3">
                {myVehicles.map((v) => {
                  const daysUntilService = Math.ceil((new Date(v.nextService) - new Date()) / 86400000)
                  const isUrgent = daysUntilService <= 30
                  return (
                    <div key={v.id} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:border-green-500/25"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{v.brand} {v.model}</p>
                        <p className="text-gray-500 text-xs">{v.plate} · {v.km.toLocaleString('id-ID')} km</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${isUrgent ? 'text-orange-400' : 'text-gray-400'}`}>
                          {isUrgent ? `⚠️ ${daysUntilService} hari lagi` : `${daysUntilService} hari`}
                        </p>
                        <p className="text-gray-600 text-xs">Service berikutnya</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Active Tracking */}
            <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2"><MdGpsFixed className="text-green-400" /> Service Aktif</h2>
                <Link to="/guest/tracking" className="text-xs text-green-400 hover:text-green-300">Detail →</Link>
              </div>
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-sm">{activeTracking.orderId}</p>
                    <p className="text-gray-400 text-xs">{activeTracking.service}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    Dalam Proses
                  </span>
                </div>
                {/* Mini timeline */}
                <div className="flex items-center gap-1.5">
                  {activeTracking.steps.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1.5 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.done && !s.active ? 'bg-green-500' : s.active ? 'bg-yellow-400 animate-pulse' : 'bg-white/20'}`} />
                      {i < activeTracking.steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${s.done ? 'bg-green-500/40' : 'bg-white/8'}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">{activeTracking.steps[0].label}</span>
                  <span className="text-xs text-gray-500">{activeTracking.steps[activeTracking.steps.length-1].label}</span>
                </div>
                <p className="text-gray-400 text-xs mt-2">Est. selesai pukul <span className="text-green-400 font-semibold">{activeTracking.estimatedFinish} WIB</span></p>
              </div>
            </div>

            {/* Riwayat terakhir */}
            {lastService && (
              <div className="rounded-2xl border p-5" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2"><MdBuild className="text-green-400" /> Servis Terakhir</h2>
                  <Link to="/guest/riwayat" className="text-xs text-green-400 hover:text-green-300">Semua Riwayat →</Link>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center flex-shrink-0">
                    <MdBuild className="text-green-400 text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{lastService.service}</p>
                    <p className="text-gray-400 text-xs">{lastService.vehicle} · {lastService.plate}</p>
                    <p className="text-gray-500 text-xs">{new Date(lastService.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">Rp {(lastService.total/1000).toFixed(0)}rb</p>
                    <span className="flex items-center gap-1 text-yellow-400 text-xs justify-end mt-1">
                      <MdStar className="text-sm" />+{lastService.pointsEarned}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Notifications ─────────────────────── */}
          <div>
            <div className="rounded-2xl border p-5 sticky top-20" style={{ background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <MdNotifications className="text-green-400" /> Notifikasi CRM
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    {crmNotifications.filter(n => n.priority === 'high').length}
                  </span>
                </h2>
              </div>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scroll">
                {crmNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl border border-white/6 hover:border-white/12 transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-start gap-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${notifTypeStyle[n.type]}`}>
                        {n.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="text-white font-semibold text-xs leading-tight">{n.title}</p>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${priorityDot[n.priority]}`} />
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed mb-2">{n.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-xs">{n.time}</span>
                          <Link to={n.actionPath} className="text-xs text-green-400 hover:text-green-300 font-medium">{n.action} →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}