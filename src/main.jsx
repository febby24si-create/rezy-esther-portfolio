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
import { seedLocalStorageIfEmpty } from './utils/seedLocalStorage'

// ── Seed demo data ke sessionStorage saat pertama kali dibuka ──────────
// Ini memastikan Dashboard tidak kosong waktu deploy / presentasi.
// Data diambil dari src/data/*.json dan hanya di-load sekali.
seedLocalStorageIfEmpty()

// PHASE 2 — daftarkan semua side-effect Order (Loyalty, Voucher,
// Mechanic) sebagai subscriber terhadap ORDER_* events, sekali
// di bootstrap. Lihat lib/orderSubscribers.js untuk detail.
registerOrderSubscribers()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)