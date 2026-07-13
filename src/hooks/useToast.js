// ============================================================
// hooks/useToast.js
// Hook untuk manajemen toast notifications — dipisah dari
// components/guest/Toast.jsx agar tidak melanggar
// react-refresh/only-export-components.
// ============================================================

import { useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const addToast = (message, type = 'success') =>
    setToasts((prev) => [...prev, { id: Date.now(), message, type }])
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))
  return { toasts, addToast, removeToast }
}
