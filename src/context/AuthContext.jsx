import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const HARDCODED_USERS = [
  { email: 'admin@esthergarage.id', password: 'admin123', name: 'Febby Fahrezy', role: 'Administrator' },
  { email: 'mekanik@esthergarage.id', password: 'mekanik123', name: 'Budi Pekerti', role: 'Mekanik' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from sessionStorage
    try {
      const stored = sessionStorage.getItem('eg_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Also support old dummyjson token flow
        const token = sessionStorage.getItem('eg_token')
        if (parsed || token) setUser(parsed || { name: 'User', role: 'Administrator' })
      }
    } catch {
      sessionStorage.removeItem('eg_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (email, password) => {
    // Try hardcoded users first
    const found = HARDCODED_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const userData = { name: found.name, email: found.email, role: found.role }
      setUser(userData)
      sessionStorage.setItem('eg_user', JSON.stringify(userData))
      sessionStorage.setItem('eg_token', 'local_' + Date.now())
      return { success: true }
    }
    return { success: false, message: 'Email atau password salah.' }
  }

  const loginWithToken = (token, userData) => {
    // Called after dummyjson API login
    setUser(userData)
    sessionStorage.setItem('eg_user', JSON.stringify(userData))
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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}