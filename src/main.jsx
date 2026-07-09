import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { registerOrderSubscribers } from './lib/orderSubscribers'

// ── Daftarkan subscriber ORDER_EVENTS sekali di bootstrap ──────────────
// (loyalty, voucher, status mekanik, deduksi stok — semua sudah
// Supabase-backed, lihat lib/orderSubscribers.js)
//
// CATATAN PEMBERSIHAN: sebelumnya di sini juga ada
// registerBookingSubscribers(), seedLocalStorageIfEmpty(), dan
// import './bookingSeedData.js' — ketiganya dihapus karena hanya
// mengisi/mendaftarkan sessionStorage & event BOOKING_* yang sudah
// tidak pernah dibaca/dipicu sejak Bookings.jsx, CheckIn.jsx,
// Mechanics.jsx, Orders.jsx, dan Inventory.jsx semuanya pindah ke
// Supabase. File-file terkait (lib/bookingSubscribers.js,
// lib/calendarModule/calendarStorage.js, utils/seedLocalStorage.js,
// bookingSeedData.js) sudah dihapus dari project.
registerOrderSubscribers()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)