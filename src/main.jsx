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
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

