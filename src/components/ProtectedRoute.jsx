import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth()

  // Show nothing while checking sessionStorage
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#041C15' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}