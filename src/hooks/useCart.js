// ============================================================
// hooks/useCart.js
// Hook untuk mengakses CartContext — dipisah dari CartContext.jsx
// agar tidak melanggar react-refresh/only-export-components.
// ============================================================

import { useContext } from 'react'
import { CartContext } from '../context/CartContext'

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
  return ctx
}
