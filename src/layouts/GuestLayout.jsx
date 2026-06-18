import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import GuestNavbar from '../components/guest/GuestNavbar'
import GuestFooter from '../components/guest/GuestFooter'
import { ToastContainer, useToast } from '../components/guest/Toast'
import { createContext, useContext } from 'react'

const ToastCtx = createContext(null)
export const useGuestToast = () => useContext(ToastCtx)

// GuestLayout — halaman publik, dapat diakses siapa saja (login maupun tidak).
// Redirect ke member dashboard setelah login ditangani oleh LoginCustomer.jsx,
// bukan di sini, agar member tetap bisa melihat halaman publik kapan saja.
export default function GuestLayout() {
  const { toasts, addToast, removeToast } = useToast()
  const location = useLocation()

  return (
    <ToastCtx.Provider value={addToast}>
      <div className="min-h-screen flex flex-col guest-theme" style={{ background: '#020b18' }}>
        <GuestNavbar />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
        <GuestFooter />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastCtx.Provider>
  )
}
