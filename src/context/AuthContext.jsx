import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/authAPI'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('eg_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      sessionStorage.removeItem('eg_user')
    } finally {
      setLoading(false)
    }
  }, [])

  // Login: query ke tabel users di Supabase
  const login = async (email, password) => {
    try {
      const result = await authAPI.loginUser(email, password)
      if (!result || result.length === 0) {
        return { success: false, message: 'Email atau password salah.' }
      }
      const found    = result[0]
      const userData = { id: found.id, name: found.name, email: found.email, role: found.role }
      setUser(userData)
      sessionStorage.setItem('eg_user',  JSON.stringify(userData))
      sessionStorage.setItem('eg_token', 'supabase_' + Date.now())
      return { success: true }
    } catch (err) {
      return { success: false, message: `Terjadi kesalahan: ${err.message}` }
    }
  }

  // Dipanggil setelah loginUser berhasil (dari Login.jsx yang sudah pakai authAPI langsung)
  const loginWithToken = (token, userData) => {
    setUser(userData)
    sessionStorage.setItem('eg_user',  JSON.stringify(userData))
    sessionStorage.setItem('eg_token', token)
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('eg_user')
    sessionStorage.removeItem('eg_token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

