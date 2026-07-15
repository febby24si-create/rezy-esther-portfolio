import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";
import MemberLayout from "./layouts/MemberLayout";
import Loading from "./components/Loading";

// ─── Admin Pages ─────────────────────────────────────────────
const Dashboard      = React.lazy(() => import("./pages/Dashboard"));
const Bookings       = React.lazy(() => import("./pages/Bookings"));
const CheckInPage    = React.lazy(() => import("./pages/CheckIn"));
const Orders         = React.lazy(() => import("./pages/Orders"));
const OrderDetail    = React.lazy(() => import("./pages/OrderDetail"));
const Customers      = React.lazy(() => import("./pages/Customers"));
const Vehicles       = React.lazy(() => import("./pages/Vehicles"));
const Mechanics      = React.lazy(() => import("./pages/Mechanics"));
const Reports        = React.lazy(() => import("./pages/Reports"));
const Settings       = React.lazy(() => import("./pages/Settings"));
const Components     = React.lazy(() => import("./pages/Components"));
const Inventory      = React.lazy(() => import("./pages/Inventory"));
const PesananProduk  = React.lazy(() => import("./pages/PesananProduk"));
const MechanicSchedule = React.lazy(() => import("./pages/MechanicSchedule"));
const CRMAutomation    = React.lazy(() => import("./pages/CRMAutomation"));
const CustomerDetail   = React.lazy(() => import("./pages/CustomerDetail"));const MembershipAdmin = React.lazy(() => import("./pages/MembershipAdmin"));
const LoyaltyAdmin    = React.lazy(() => import("./pages/LoyaltyAdmin"));
const UserPage         = React.lazy(() => import("./pages/User"));

// ─── CRM Pages ────────────────────────────────────────────────
const CrmDashboard    = React.lazy(() => import("./pages/crm/CrmDashboard"));
const Customer360     = React.lazy(() => import("./pages/crm/Customer360"));
const CrmCampaign     = React.lazy(() => import("./pages/crm/CrmCampaign"));
const RewardCenter    = React.lazy(() => import("./pages/crm/RewardCenter"));

// ─── Admin Auth Pages ─────────────────────────────────────────
const Login    = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Forgot   = React.lazy(() => import("./pages/auth/Forgot"));

// ─── Error Pages ─────────────────────────────────────────────
const ErrorPage = React.lazy(() => import("./pages/ErrorPage"));
const NotFound  = React.lazy(() => import("./pages/NotFound"));

// ─── Guest Public Pages ───────────────────────────────────────
// Hanya halaman publik — tidak perlu login
const LandingPage      = React.lazy(() => import("./pages/guest/LandingPage"));
const TentangKami      = React.lazy(() => import("./pages/guest/TentangKami"));
const Layanan          = React.lazy(() => import("./pages/guest/Layanan"));
const PromoVoucher     = React.lazy(() => import("./pages/guest/PromoVoucher"));
const LoginCustomer    = React.lazy(() => import("./pages/guest/LoginCustomer"));
const RegisterCustomer = React.lazy(() => import("./pages/guest/RegisterCustomer"));

// ─── Member Area Pages ────────────────────────────────────────
// Semua fitur pengguna (setelah login) ada di sini
const MemberDashboard  = React.lazy(() => import("./pages/guest/MemberDashboard"));
const BookingService   = React.lazy(() => import("./pages/guest/BookingService"));
const TrackingStatus   = React.lazy(() => import("./pages/guest/TrackingStatus"));
const LoyaltyPoint     = React.lazy(() => import("./pages/guest/LoyaltyPoint"));
const VoucherSaya      = React.lazy(() => import("./pages/guest/VoucherSaya"));
const RiwayatService   = React.lazy(() => import("./pages/guest/RiwayatService"));
const ProfilCustomer   = React.lazy(() => import("./pages/guest/ProfilCustomer"));
const Leaderboard      = React.lazy(() => import("./pages/guest/Leaderboard"));
const ProdukKatalog    = React.lazy(() => import("./pages/guest/ProdukKatalog"));
const ProdukDetail     = React.lazy(() => import("./pages/guest/ProdukDetail"));
const Keranjang        = React.lazy(() => import("./pages/guest/Keranjang"));
const Checkout         = React.lazy(() => import("./pages/guest/Checkout"));
const RiwayatPembelian = React.lazy(() => import("./pages/guest/RiwayatPembelian"));
const BukuServis        = React.lazy(() => import("./pages/guest/BukuServis"));
const InvoicePembelian = React.lazy(() => import("./pages/guest/InvoicePembelian"));
const DetailPembelian  = React.lazy(() => import("./pages/guest/DetailPembelian"));
const KendaraanSaya    = React.lazy(() => import("./pages/guest/KendaraanSaya"));
const KartuMember      = React.lazy(() => import("./pages/member/KartuMember"));


export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ── Admin Auth Routes ──────────────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<Login />}    />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot"   element={<Forgot />}   />
            </Route>

            {/* ── Admin Protected Routes ─────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard"       element={<Dashboard />}         />
                <Route path="/bookings"        element={<Bookings />}          />
                <Route path="/checkin"         element={<CheckInPage />}       />
                <Route path="/orders"          element={<Orders />}            />
                <Route path="/orders/:id"      element={<OrderDetail />}       />
                <Route path="/customers"       element={<Customers />}         />
                <Route path="/vehicles"        element={<Vehicles />}          />
                <Route path="/mechanics"       element={<Mechanics />}         />
                <Route path="/Schedule"        element={<MechanicSchedule />}  />
                <Route path="/reports"         element={<Reports />}           />
                <Route path="/settings"        element={<Settings />}          />
                <Route path="/inventory"       element={<Inventory />}         />
                <Route path="/pesanan-produk"  element={<PesananProduk />}     />
                <Route path="/buku-service/:id"    element={<BukuServis />}        />
                <Route path="/components"      element={<Components />}        />
                <Route path="/crm"             element={<CRMAutomation />}     />
                <Route path="/crm/dashboard"   element={<CrmDashboard />}       />
                <Route path="/crm/customer/:id" element={<Customer360 />}       />
                <Route path="/crm/campaign"    element={<CrmCampaign />}        />
                <Route path="/crm/rewards"     element={<RewardCenter />}       />
                <Route path="/customers/:id"   element={<CustomerDetail />}    />
                <Route path="/membership"      element={<MembershipAdmin />}   />
                <Route path="/loyalty"         element={<LoyaltyAdmin />}        />
                <Route path="/users"          element={<UserPage />}          />
                <Route path="/error-400" element={<ErrorPage code="400" message="Bad Request"   description="Permintaan tidak valid atau tidak dapat diproses." />} />
                <Route path="/error-401" element={<ErrorPage code="401" message="Unauthorized"  description="Anda tidak memiliki izin untuk mengakses halaman ini." />} />
                <Route path="/error-403" element={<ErrorPage code="403" message="Forbidden"     description="Akses ke halaman ini dilarang." />} />
              </Route>
            </Route>

            {/* ── Guest Public Routes ────────────────────── */}
            {/* Hanya halaman publik, tidak ada fitur member di sini */}
            <Route element={<GuestLayout />}>
              <Route path="/"                element={<LandingPage />}      />

              <Route path="/guest/tentang"   element={<TentangKami />}      />
              <Route path="/guest/layanan"   element={<Layanan />}          />
              <Route path="/guest/promo"     element={<PromoVoucher />}     />
              <Route path="/guest/produk"      element={<ProdukKatalog />} />
              <Route path="/guest/produk/:id"  element={<ProdukDetail />}  />
              <Route path="/guest/keranjang"   element={<Keranjang />}     />
              <Route path="/guest/login"     element={<LoginCustomer />}    />
              <Route path="/guest/register"  element={<RegisterCustomer />} />

              {/* Redirect lama → member area */}
              <Route path="/guest/dashboard"    element={<Navigate to="/member/dashboard" replace />} />
              <Route path="/guest/member"       element={<Navigate to="/member/dashboard" replace />} />
              <Route path="/guest/booking"      element={<Navigate to="/member/booking"   replace />} />
              <Route path="/guest/tracking"     element={<Navigate to="/member/tracking"  replace />} />
              <Route path="/guest/loyalty"      element={<Navigate to="/member/loyalty"   replace />} />
              <Route path="/guest/voucher"      element={<Navigate to="/member/voucher"   replace />} />
              <Route path="/guest/riwayat"      element={<Navigate to="/member/riwayat"   replace />} />
              <Route path="/guest/profil"       element={<Navigate to="/member/profil"    replace />} />
              <Route path="/guest/leaderboard"  element={<Navigate to="/member/leaderboard" replace />} />
            </Route>

            {/* ── Member Area Routes ─────────────────────── */}
            {/* Semua fitur pengguna — bisa diakses tanpa login */}
            <Route element={<MemberLayout />}>
              <Route path="/member/dashboard"   element={<MemberDashboard />} />
              <Route path="/member/kartu"       element={<KartuMember />}     />
              <Route path="/member/booking"     element={<BookingService />}  />
              <Route path="/member/tracking"    element={<TrackingStatus />}  />
              <Route path="/member/loyalty"     element={<LoyaltyPoint />}    />
              <Route path="/member/voucher"     element={<VoucherSaya />}     />
              <Route path="/member/riwayat"     element={<RiwayatService />}  />
              <Route path="/member/profil"      element={<ProfilCustomer />}  />
              <Route path="/member/leaderboard" element={<Leaderboard />}     />
              <Route path="/member/checkout"    element={<Checkout />}       />
              <Route path="/member/pembelian"          element={<RiwayatPembelian />}  />
              <Route path="/member/pembelian/:id"        element={<DetailPembelian />}   />
              <Route path="/member/pembelian/:id/invoice" element={<InvoicePembelian />} />
              <Route path="/member/kendaraan"            element={<KendaraanSaya />}     />
              <Route path="/member/buku-servis/:id"      element={<BukuServis />}        />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}