// ============================================================
// CustomerInsights.jsx — Panel rekomendasi insight otomatis
// ============================================================
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function generateInsights(customer, orders = []) {
  const insights = []
  const now = new Date()

  // Helper untuk cek hari sejak terakhir
  const daysSince = (dateStr) => {
    if (!dateStr) return 9999
    return Math.floor((now - new Date(dateStr)) / 86400000)
  }

  // 1. Tidak servis >= 90 hari
  const lastOrderDays = daysSince(customer.lastOrderDate || customer.last_service_date)
  if (lastOrderDays >= 90 && lastOrderDays < 365) {
    insights.push({
      id: 'long-no-service',
      type: 'warning',
      icon: '⚠️',
      title: 'Tidak Servis &gt; 90 Hari',
      message: `${customer.name} sudah ${lastOrderDays} hari tidak servis. Kirim reminder atau promo untuk menarik kembali.`,
      severity: 'warning',
      priority: 3,
    })
  } else if (lastOrderDays >= 365) {
    insights.push({
      id: 'churn-risk',
      type: 'danger',
      icon: '🚨',
      title: 'Risiko Churn Tinggi',
      message: `${customer.name} tidak kembali selama ${lastOrderDays} hari. Pertimbangkan campaign re-engagement dengan diskon besar.`,
      severity: 'danger',
      priority: 5,
    })
  }

  // 2. Hampir naik tier
  const points = customer.points || 0
  if (points >= 400 && points < 500) {
    insights.push({
      id: 'near-silver',
      type: 'success',
      icon: '🥈',
      title: 'Hampir Naik ke Silver!',
      message: `${customer.name} hanya butuh ${500 - points} poin lagi untuk naik ke Silver. Dorong dengan 1-2 kali servis.`,
      severity: 'success',
      priority: 4,
    })
  } else if (points >= 1400 && points < 1500) {
    insights.push({
      id: 'near-gold',
      type: 'success',
      icon: '🥇',
      title: 'Hampir Naik ke Gold!',
      message: `${customer.name} hanya butuh ${1500 - points} poin lagi untuk naik ke Gold. Tawarkan servis bernilai tambah.`,
      severity: 'success',
      priority: 4,
    })
  } else if (points >= 2900 && points < 3000) {
    insights.push({
      id: 'near-platinum',
      type: 'success',
      icon: '💎',
      title: 'Hampir Naik ke Platinum!',
      message: `${customer.name} hanya butuh ${3000 - points} poin lagi untuk mencapai Platinum! Beri penawaran spesial.`,
      severity: 'success',
      priority: 5,
    })
  }

  // 3. Loyalitas tinggi
  const totalOrders = customer.totalOrders || orders.length
  if (totalOrders >= 10) {
    insights.push({
      id: 'high-loyalty',
      type: 'success',
      icon: '👑',
      title: 'Loyalitas Tinggi',
      message: `${customer.name} telah melakukan ${totalOrders} transaksi. Beri reward eksklusif untuk retain.`,
      severity: 'success',
      priority: 3,
    })
  }

  // 4. Sering ganti oli — cari dari riwayat order
  const oilChanges = orders.filter((o) =>
    (o.service || '').toLowerCase().includes('oli') || (o.service || '').toLowerCase().includes('oil')
  ).length
  if (oilChanges >= 3) {
    insights.push({
      id: 'frequent-oil',
      type: 'info',
      icon: '🛢️',
      title: 'Sering Ganti Oli',
      message: `${customer.name} sudah ganti oli ${oilChanges}x. Tawarkan paket langganan ganti oli untuk efisiensi biaya.`,
      severity: 'info',
      priority: 2,
    })
  }

  // 5. Ultah dalam 30 hari
  if (customer.birthDate || customer.birth_date) {
    const birth = new Date(customer.birthDate || customer.birth_date)
    const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
    const nextBirthday = thisYear < now
      ? new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
      : thisYear
    const daysToBirthday = Math.ceil((nextBirthday - now) / 86400000)
    if (daysToBirthday <= 30) {
      insights.push({
        id: 'birthday-near',
        type: 'info',
        icon: '🎂',
        title: 'Ulang Tahun dalam ${daysToBirthday} Hari',
        message: `Kirim voucher ulang tahun dan promo spesial untuk ${customer.name}.`,
        severity: 'info',
        priority: 3,
      })
    }
  }

  // 6. Total spending tinggi
  const totalSpent = customer.totalSpent || orders.reduce((s, o) => s + (o.total || 0), 0)
  if (totalSpent >= 5000000) {
    insights.push({
      id: 'big-spender',
      type: 'success',
      icon: '💰',
      title: 'Big Spender',
      message: `Total pengeluaran ${customer.name} mencapai Rp ${totalSpent.toLocaleString('id-ID')}. Beri perlakuan VIP.`,
      severity: 'success',
      priority: 4,
    })
  }

  return insights.sort((a, b) => b.priority - a.priority)
}

const SEVERITY_STYLE = {
  danger:  { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#EF4444' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#F59E0B' },
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#3B82F6' },
  success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22C55E' },
}

export default function CustomerInsights({ customer, orders = [] }) {
  const [dismissed, setDismissed] = useState(new Set())
  const insights = useMemo(() => generateInsights(customer, orders), [customer, orders])
  const active = insights.filter((i) => !dismissed.has(i.id))

  if (active.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl">🎯</span>
        <p className="text-gray-500 text-sm mt-2">Tidak ada insight khusus untuk customer ini saat ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {active.map((insight, i) => {
        const style = SEVERITY_STYLE[insight.severity] || SEVERITY_STYLE.info
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 border relative group"
            style={{ background: style.bg, borderColor: style.border }}
          >
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, insight.id]))}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-[10px]"
            >
              ✕
            </button>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-semibold">{insight.title}</p>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                  >
                    {insight.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
