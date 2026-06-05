// /* Quiz */
// import React, { Suspense } from 'react'
// import { Routes, Route } from 'react-router-dom'
// import MainLayout from './layouts/MainLayout'
// import AuthLayout from './layouts/AuthLayout'
// import Loading from './components/Loading'

// const Dashboard = React.lazy(() => import('./pages/Dashboard'))
// const Orders = React.lazy(() => import('./pages/Orders'))
// const Customers = React.lazy(() => import('./pages/Customers'))
// const Vehicles = React.lazy(() => import('./pages/Vehicles'))
// const Mechanics = React.lazy(() => import('./pages/Mechanics'))
// const Reports = React.lazy(() => import('./pages/Reports'))
// const Settings = React.lazy(() => import('./pages/Settings'))
// const Login = React.lazy(() => import('./pages/auth/Login'))
// const Register = React.lazy(() => import('./pages/auth/Register'))
// const Forgot = React.lazy(() => import('./pages/auth/Forgot'))
// const ErrorPage = React.lazy(() => import('./pages/ErrorPage'))
// const NotFound = React.lazy(() => import('./pages/NotFound'))

// export default function App() {
//   return (
//     <Suspense fallback={<Loading />}>
//       <Routes>
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/customers" element={<Customers />} />
//           <Route path="/vehicles" element={<Vehicles />} />
//           <Route path="/mechanics" element={<Mechanics />} />
//           <Route path="/reports" element={<Reports />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/error-400" element={<ErrorPage code="400" message="Bad Request" description="Permintaan tidak valid atau tidak dapat diproses." />} />
//           <Route path="/error-401" element={<ErrorPage code="401" message="Unauthorized" description="Anda tidak memiliki izin untuk mengakses halaman ini." />} />
//           <Route path="/error-403" element={<ErrorPage code="403" message="Forbidden" description="Akses ke halaman ini dilarang." />} />
//         </Route>
//         <Route element={<AuthLayout />}>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot" element={<Forgot />} />
//         </Route>
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Suspense>
//   )
// }

import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Loading from "./components/Loading";

import GuestLayout from "./layouts/GuestLayout";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Customers = React.lazy(() => import("./pages/Customers"));
const Vehicles = React.lazy(() => import("./pages/Vehicles"));
const Mechanics = React.lazy(() => import("./pages/Mechanics"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Components = React.lazy(() => import("./pages/Components"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Forgot = React.lazy(() => import("./pages/auth/Forgot"));
const ErrorPage = React.lazy(() => import("./pages/ErrorPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const MechanicSchedule = React.lazy(() => import("./pages/MechanicSchedule"));

const LandingPage = React.lazy(() => import("./pages/guest/LandingPage"));
const TentangKami = React.lazy(() => import("./pages/guest/TentangKami"));
const Layanan = React.lazy(() => import("./pages/guest/Layanan"));
const PromoVoucher = React.lazy(() => import("./pages/guest/PromoVoucher"));
const BookingService = React.lazy(() => import("./pages/guest/BookingService"));
const TrackingStatus = React.lazy(() => import("./pages/guest/TrackingStatus"));
const LoyaltyPoint = React.lazy(() => import("./pages/guest/LoyaltyPoint"));
const VoucherSaya = React.lazy(() => import("./pages/guest/VoucherSaya"));
const RiwayatService = React.lazy(() => import("./pages/guest/RiwayatService"));
const DashboardCustomer = React.lazy(
  () => import("./pages/guest/DashboardCustomer"),
);

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Protected routes — requires login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/mechanics" element={<Mechanics />} />
              <Route path="/Schedule" element={<MechanicSchedule />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/components" element={<Components />} />
              <Route
                path="/error-400"
                element={
                  <ErrorPage
                    code="400"
                    message="Bad Request"
                    description="Permintaan tidak valid atau tidak dapat diproses."
                  />
                }
              />
              <Route
                path="/error-401"
                element={
                  <ErrorPage
                    code="401"
                    message="Unauthorized"
                    description="Anda tidak memiliki izin untuk mengakses halaman ini."
                  />
                }
              />
              <Route
                path="/error-403"
                element={
                  <ErrorPage
                    code="403"
                    message="Forbidden"
                    description="Akses ke halaman ini dilarang."
                  />
                }
              />
            </Route>
          </Route>

          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
          </Route>

          <Route element={<GuestLayout />}>
            <Route path="/guest" element={<LandingPage />} />
            <Route path="/guest/tentang" element={<TentangKami />} />
            <Route path="/guest/layanan" element={<Layanan />} />
            <Route path="/guest/promo" element={<PromoVoucher />} />
            <Route path="/guest/booking" element={<BookingService />} />
            <Route path="/guest/tracking" element={<TrackingStatus />} />
            <Route path="/guest/loyalty" element={<LoyaltyPoint />} />
            <Route path="/guest/voucher" element={<VoucherSaya />} />
            <Route path="/guest/riwayat" element={<RiwayatService />} />
            <Route path="/guest/dashboard" element={<DashboardCustomer />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
