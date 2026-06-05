import { Outlet } from 'react-router-dom'
import GuestNavbar from '../components/guest/GuestNavbar'
import GuestFooter from '../components/guest/GuestFooter'
import { ToastContainer, useToast } from '../components/guest/Toast'
import { createContext, useContext } from 'react'

const ToastCtx = createContext(null)
export const useGuestToast = () => useContext(ToastCtx)

export default function GuestLayout() {
  const { toasts, addToast, removeToast } = useToast()

  return (
    <ToastCtx.Provider value={addToast}>
      <div className="min-h-screen flex flex-col" style={{ background: '#020f09' }}>
        <GuestNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <GuestFooter />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastCtx.Provider>
  )
}