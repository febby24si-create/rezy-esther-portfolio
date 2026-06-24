// // import { createRoot } from "react-dom/client";
// // import { BrowserRouter, Routes, Route } from "react-router-dom";

// // import "./assets/tailwind.css";

// // import BiodataDiri from "./BiodataDiri/BiodataDiri";
// // import WisataIndonesia from "./WisataIndonesia/WisataIndonesia";

// // createRoot(document.getElementById("root")).render(
// //   <BrowserRouter>
// //     <Routes>
// //       <Route path="/biodatadiri" element={<BiodataDiri />} />
// //       <Route path="/wisataindonesia" element={<WisataIndonesia />} />
// //     </Routes>
// //   </BrowserRouter>
// // );
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// )

// import { createRoot } from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import "./assets/tailwind.css";

// import BiodataDiri from "./BiodataDiri/BiodataDiri";
// import WisataIndonesia from "./WisataIndonesia/WisataIndonesia";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/biodatadiri" element={<BiodataDiri />} />
//       <Route path="/wisataindonesia" element={<WisataIndonesia />} />
//     </Routes>
//   </BrowserRouter>
// );
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App.jsx'
// import './index.css'
// import { registerOrderSubscribers } from './lib/orderSubscribers'


// // PHASE 2 — daftarkan semua side-effect Order (Loyalty, Voucher,
// // Mechanic) sebagai subscriber terhadap ORDER_* events, sekali
// // di bootstrap. Lihat lib/orderSubscribers.js untuk detail.
// registerOrderSubscribers()

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// );


import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { registerOrderSubscribers } from './lib/orderSubscribers'
import { registerBookingSubscribers } from './lib/bookingSubscribers'
import { seedLocalStorageIfEmpty } from './utils/seedLocalStorage'
// src/main.jsx — tambah baris ini paling atas
import './bookingSeedData.js'

// ── Seed demo data ke sessionStorage saat pertama kali dibuka ──────────
// Ini memastikan Dashboard tidak kosong waktu deploy / presentasi.
// Data diambil dari src/data/*.json dan hanya di-load sekali.
seedLocalStorageIfEmpty()

// ── Daftarkan semua event subscribers sekali di bootstrap ──────────────
// Urutan registrasi tidak berpengaruh karena kedua subscriber
// beroperasi pada storage key yang berbeda dan tidak saling bergantung.
//
// Order subscribers  : ORDER_EVENTS → loyalty, voucher, mechanic stats
// Booking subscribers: BOOKING_EVENTS → admin notif, customer notif, calendar (Sprint 2)
registerOrderSubscribers()
registerBookingSubscribers()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)