// ============================================================
// useCustomerStore.js — Fase 2
// Data customer sekarang dari Supabase via customerAPI
// API hook tetap sama agar semua consumer tidak perlu diubah
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { customerAPI } from '../services/customerAPI'

export function useCustomerStore() {
  const [customers, setCustomersState] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  // Load dari Supabase saat mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerAPI.fetchAll()
        setCustomersState(data)
      } catch (err) {
        console.error('Gagal load customers:', err)
      } finally {
        setLoadingCustomers(false)
      }
    }
    load()
  }, [])

  const setCustomers = useCallback((updater) => {
    setCustomersState(prev => typeof updater === 'function' ? updater(prev) : updater)
  }, [])

  const addCustomer = useCallback(async (customer) => {
    try {
      const created = await customerAPI.registerCustomer(customer)
      if (created) setCustomersState(prev => [created, ...prev])
      return created
    } catch (err) {
      console.error('Gagal tambah customer:', err)
      return null
    }
  }, [])

  const updateCustomer = useCallback(async (id, patch) => {
    try {
      const updated = await customerAPI.update(id, patch)
      if (updated) {
        setCustomersState(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
      }
      return updated
    } catch (err) {
      console.error('Gagal update customer:', err)
      return null
    }
  }, [])

  const deleteCustomer = useCallback(async (id) => {
    try {
      await customerAPI.delete(id)
      setCustomersState(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Gagal hapus customer:', err)
    }
  }, [])

  const getCustomerById = useCallback((id) => {
    return customers.find(c => c.id === id) || null
  }, [customers])

  const getCustomerByName = useCallback((name) => {
    return customers.find(c => c.name?.toLowerCase() === name?.toLowerCase()) || null
  }, [customers])

  return {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomerByName,
    loadingCustomers,
  }
}

// Fungsi publik untuk modul non-React (Orders, CRM, dll)
export async function getAllCustomersFromStore() {
  try {
    return await customerAPI.fetchAll()
  } catch {
    return []
  }
}