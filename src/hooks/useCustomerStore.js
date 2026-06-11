// ============================================================
// useCustomerStore.js
// Satu sumber data customer yang konsisten di semua halaman.
// Membaca dari localStorage('garage_customers'), dengan fallback
// ke customersData.json. Semua mutasi disimpan kembali ke localStorage.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import customersData from '../data/customersData.json'

const LS_KEY = 'garage_customers'

// ─── Storage helpers ──────────────────────────────────────────
function loadCustomers() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Pastikan field baru yang ada di customersData.json tapi belum
      // ada di localStorage di-merge agar data tidak basi
      const enriched = parsed.map(stored => {
        const fresh = customersData.find(c => c.id === stored.id)
        if (!fresh) return stored
        return { ...fresh, ...stored } // stored override fresh (preserve edits)
      })
      // Tambahkan customer baru dari customersData yang belum ada di storage
      const storedIds = new Set(parsed.map(c => c.id))
      const newOnes = customersData.filter(c => !storedIds.has(c.id))
      return [...enriched, ...newOnes]
    }
  } catch { /* ignore */ }
  return customersData
}

function saveCustomers(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

// ─── Hook ─────────────────────────────────────────────────────
export function useCustomerStore() {
  const [customers, setCustomersState] = useState(loadCustomers)

  // Persist setiap kali data berubah
  useEffect(() => {
    saveCustomers(customers)
  }, [customers])

  const setCustomers = useCallback((updater) => {
    setCustomersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveCustomers(next)
      return next
    })
  }, [])

  const addCustomer = useCallback((customer) => {
    setCustomers(prev => [...prev, customer])
  }, [setCustomers])

  const updateCustomer = useCallback((id, patch) => {
    setCustomers(prev =>
      prev.map(c => c.id === id ? { ...c, ...patch } : c)
    )
  }, [setCustomers])

  const deleteCustomer = useCallback((id) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [setCustomers])

  const getCustomerById = useCallback((id) => {
    return customers.find(c => c.id === id) || null
  }, [customers])

  const getCustomerByName = useCallback((name) => {
    return customers.find(c => c.name === name) || null
  }, [customers])

  return {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomerByName,
  }
}

// ─── Fungsi non-hook untuk dibaca modul non-React (CRM, dll) ─
export function getAllCustomersFromStore() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const enriched = parsed.map(stored => {
        const fresh = customersData.find(c => c.id === stored.id)
        if (!fresh) return stored
        return { ...fresh, ...stored }
      })
      const storedIds = new Set(parsed.map(c => c.id))
      const newOnes = customersData.filter(c => !storedIds.has(c.id))
      return [...enriched, ...newOnes]
    }
  } catch { /* ignore */ }
  return customersData
}
