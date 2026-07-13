// ============================================================
// CartContext.jsx
// Keranjang belanja produk — state client-side (localStorage),
// terpisah total dari CustomerAuthContext/loyalty. Cart tidak
// perlu tabel Supabase; baru jadi baris nyata (product_orders)
// saat checkout berhasil (lihat services/shopAPI.js).
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

export const CartContext = createContext(null)
const LS_KEY = 'esther_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items))
    } catch { /* ignore quota errors */ }
  }, [items])

  // product: { id, name, sell_price, stock, photo_url, category }
  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(it => it.product_id === product.id)
      const maxQty = product.stock ?? 0
      if (existing) {
        const newQty = Math.min(existing.qty + qty, maxQty)
        return prev.map(it => it.product_id === product.id ? { ...it, qty: newQty } : it)
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.sell_price || 0,
        photo_url: product.photo_url || null,
        category: product.category || '',
        stock: maxQty,
        qty: Math.min(Math.max(qty, 1), Math.max(maxQty, 0)),
      }]
    })
  }, [])

  // Qty tidak boleh melebihi stok (Rule eksplisit dari brief) — clamp di sini.
  const updateQty = useCallback((productId, qty) => {
    setItems(prev => prev
      .map(it => it.product_id === productId
        ? { ...it, qty: Math.min(Math.max(qty, 0), it.stock) }
        : it
      )
      .filter(it => it.qty > 0)
    )
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(it => it.product_id !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.price, 0),
    [items]
  )
  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  )

  const value = { items, addToCart, updateQty, removeFromCart, clearCart, subtotal, totalItems }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
