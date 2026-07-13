// ============================================================
// hooks/useAuth.js
// Hook untuk mengakses AuthContext — dipisah dari AuthContext.jsx
// agar tidak melanggar react-refresh/only-export-components.
// ============================================================

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
