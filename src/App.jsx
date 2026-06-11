import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import GuestLayout from './layouts/GuestLayout'
import Loading from './components/Loading'

// ─── Admin Pages ─────────────────────────────────────────────
const Dashboard       = React.lazy(() => import('./pages/Dashboard'))
const Orders          = React.lazy(() => import('./pages/Orders'))
const Customers       = React.lazy(() => import('./pages/Customers'))
const Vehicles        = React.lazy(() => import('./pages/Vehicles'))
const Mechanics       = React.lazy(() => import('./pages/Mechanics'))
const Reports         = React.lazy(() => import('./pages/Reports'))
const Settings        = React.lazy(() => import('./pages/Settings'))
const Components      = React.lazy(() => import('./pages/Components'))
const Inventory       = React.lazy(() => import('./pages/Inventory'))
const MechanicSchedule = React.lazy(() => import('./pages/MechanicSchedule'))
const CRMAutomation   = React.lazy(() => import('./pages/CRMAutomation'))
const CustomerDetail  = React.lazy(() => import('./pages/CustomerDetail'))

// ─── Auth Pages (Admin) ───────────────────────────────────────
const Login    = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const Forgot   = React.lazy(() => import('./pages/auth/Forgot'))

// ─── Error Pages ─────────────────────────────────────────────
const ErrorPage = React.lazy(() => import('./pages/ErrorPage'))
const NotFound  = React.lazy(() => import('./pages/NotFound'))

// ─── Guest / Customer Pages ───────────────────────────────────
const LandingPage       = React.lazy(() => import('./pages/guest/LandingPage'))
const TentangKami       = React.lazy(() => import('./pages/guest/TentangKami'))
const Layanan           = React.lazy(() => import('./pages/guest/Layanan'))
const PromoVoucher      = React.lazy(() => import('./pages/guest/PromoVoucher'))
const LoginCustomer     = React.lazy(() => import('./pages/guest/LoginCustomer'))
const RegisterCustomer  = React.lazy(() => import('./pages/guest/RegisterCustomer'))
const Leaderboard       = React.lazy(() => import('./pages/guest/Leaderboard'))

// ─── Customer Protected Pages ─────────────────────────────────
const BookingService    = React.lazy(() => import('./pages/guest/BookingService'))
const TrackingStatus    = React.lazy(() => import('./pages/guest/TrackingStatus'))
const LoyaltyPoint      = React.lazy(() => import('./pages/guest/LoyaltyPoint'))
const VoucherSaya       = React.lazy(() => import('./pages/guest/VoucherSaya'))
const RiwayatService    = React.lazy(() => import('./pages/guest/RiwayatService'))
const DashboardCustomer = React.lazy(() => import('./pages/guest/DashboardCustomer'))

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>

            {/* ── Admin Protected Routes ─────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/"             element={<Dashboard />} />
                <Route path="/orders"       element={<Orders />} />
                <Route path="/customers"    element={<Customers />} />
                <Route path="/vehicles"     element={<Vehicles />} />
                <Route path="/mechanics"    element={<Mechanics />} />
                <Route path="/Schedule"     element={<MechanicSchedule />} />
                <Route path="/reports"      element={<Reports />} />
                <Route path="/settings"     element={<Settings />} />
                <Route path="/inventory"    element={<Inventory />} />
                <Route path="/components"   element={<Components />} />
                <Route path="/crm"          element={<CRMAutomation />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/error-400" element={<ErrorPage code="400" message="Bad Request"  description="Permintaan tidak valid atau tidak dapat diproses." />} />
                <Route path="/error-401" element={<ErrorPage code="401" message="Unauthorized" description="Anda tidak memiliki izin untuk mengakses halaman ini." />} />
                <Route path="/error-403" element={<ErrorPage code="403" message="Forbidden"    description="Akses ke halaman ini dilarang." />} />
              </Route>
            </Route>

            {/* ── Admin Auth Routes ──────────────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot"   element={<Forgot />} />
            </Route>

            {/* ── Guest Public Routes ────────────────────── */}
            <Route element={<GuestLayout />}>
              <Route path="/guest"           element={<LandingPage />} />
              <Route path="/guest/tentang"   element={<TentangKami />} />
              <Route path="/guest/layanan"   element={<Layanan />} />
              <Route path="/guest/promo"     element={<PromoVoucher />} />
              <Route path="/guest/login"     element={<LoginCustomer />} />
              <Route path="/guest/register"  element={<RegisterCustomer />} />
              <Route path="/guest/leaderboard" element={<Leaderboard />} />

              {/* ── Customer Protected Routes ──────────── */}
              <Route element={<CustomerProtectedRoute />}>
                <Route path="/guest/dashboard" element={<DashboardCustomer />} />
                <Route path="/guest/booking"   element={<BookingService />} />
                <Route path="/guest/tracking"  element={<TrackingStatus />} />
                <Route path="/guest/loyalty"   element={<LoyaltyPoint />} />
                <Route path="/guest/voucher"   element={<VoucherSaya />} />
                <Route path="/guest/riwayat"   element={<RiwayatService />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CustomerAuthProvider>
    </AuthProvider>
  )
}