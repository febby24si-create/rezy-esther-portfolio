import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { AnimatedPage } from '../../components/AnimatedPage'

// ─── Import komponen dashboard ──────────────────────────────
import HeroMembership from '../../components/dashboard/HeroMembership'
import QuickActions from '../../components/dashboard/QuickActions'
import ServiceTracking from '../../components/dashboard/ServiceTracking'
import VehicleSection from '../../components/dashboard/VehicleSection'
import NotificationPanel from '../../components/dashboard/NotificationPanel'
import RecentActivity from '../../components/dashboard/RecentActivity'
import VoucherSection from '../../components/dashboard/VoucherSection'

// ─── Skeleton loading ──────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="pt-16 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
            <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardCustomer() {
  const { customer, logout } = useCustomerAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState(null)

  // ─── Toast notification ────────────────────────────────────
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // ─── Refresh handler ──────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsRefreshing(false)
    setToast({ message: 'Data berhasil diperbarui!', type: 'success' })
  }

  if (!customer) return <DashboardSkeleton />

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ─── Hero Membership ────────────────────────────── */}
          <HeroMembership customer={customer} onRefresh={handleRefresh} />

          {/* ─── Quick Actions ──────────────────────────────── */}
          <QuickActions customer={customer} />

          {/* ─── Main Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left column (70%) */}
            <div className="lg:col-span-2 space-y-6">
              <ServiceTracking customer={customer} />
              <VehicleSection customer={customer} />
              <RecentActivity customer={customer} />
            </div>

            {/* Right column (30%) */}
            <div className="space-y-6">
              <NotificationPanel customer={customer} />
            </div>
          </div>

          {/* ─── Voucher Section (bottom) ───────────────────── */}
          <div className="mt-8">
            <VoucherSection customer={customer} />
          </div>

          {/* ─── Toast ───────────────────────────────────────── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium flex items-center gap-3 backdrop-blur-sm border border-white/10"
              >
                <span>{toast.type === 'success' ? '✨' : 'ℹ️'}</span>
                <span>{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </AnimatedPage>
  )
}