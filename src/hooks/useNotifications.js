// ============================================================
// useNotifications.js
// Hook untuk polling notifikasi real-time dari Supabase
// Interval: 30 detik
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationAPI, NOTIF_ICON } from '../services/notificationAPI'

const POLL_INTERVAL = 30000 // 30 detik

// ── Admin hook ────────────────────────────────────────────────
export function useAdminNotifications() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const timerRef              = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const data = await notificationAPI.fetchForAdmin(30)
      setNotifs(data.map(n => ({
        ...n,
        icon: NOTIF_ICON[n.type] || '🔔',
        read: n.is_read,
      })))
    } catch (err) {
      console.warn('Notifikasi admin gagal diambil:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetch])

  const markRead = useCallback(async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try { await notificationAPI.markRead(id) } catch {}
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    try { await notificationAPI.markAllRead('admin') } catch {}
  }, [])

  const dismiss = useCallback(async (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
    try { await notificationAPI.delete(id) } catch {}
  }, [])

  const refresh = useCallback(() => fetch(), [fetch])

  const unreadCount = notifs.filter(n => !n.read).length

  return { notifs, unreadCount, loading, markRead, markAllRead, dismiss, refresh }
}

// ── Member/Customer hook ──────────────────────────────────────
export function useCustomerNotifications(customerId) {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const timerRef              = useRef(null)

  const fetch = useCallback(async () => {
    if (!customerId) return
    try {
      const data = await notificationAPI.fetchForCustomer(customerId, 20)
      setNotifs(data.map(n => ({
        ...n,
        icon: NOTIF_ICON[n.type] || '🔔',
        read: n.is_read,
      })))
    } catch (err) {
      console.warn('Notifikasi customer gagal diambil:', err.message)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (!customerId) return
    fetch()
    timerRef.current = setInterval(fetch, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetch, customerId])

  const markRead = useCallback(async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try { await notificationAPI.markRead(id) } catch {}
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    try { await notificationAPI.markAllRead('customer', customerId) } catch {}
  }, [customerId])

  const dismiss = useCallback(async (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
    try { await notificationAPI.delete(id) } catch {}
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  return { notifs, unreadCount, loading, markRead, markAllRead, dismiss }
}