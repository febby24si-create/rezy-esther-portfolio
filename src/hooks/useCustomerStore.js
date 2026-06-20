// ============================================================
// useCustomerStore.js
//
// PHASE 3 — Diarahkan ke unified `customers` store
//
// Sebelumnya hook ini membaca/menulis langsung ke
// sessionStorage('garage_customers'), terpisah dari
// sessionStorage('eg_customers') yang dipakai portal customer
// (CustomerAuthContext). Ini adalah AKAR dari masalah dualisme
// customer store.
//
// Fix: hook ini sekarang membaca/menulis ke sessionStorage('customers')
// -- hasil merge garage_customers + eg_customers oleh
// lib/customerMigration.js (runCustomerMigration, dipanggil
// idempoten via loadUnifiedCustomers).
//
// PENTING -- API hook ini TIDAK BERUBAH:
//   { customers, setCustomers, addCustomer, updateCustomer,
//     deleteCustomer, getCustomerById, getCustomerByName }
// dan getAllCustomersFromStore() tetap punya signature yang sama.
//
// Ini berarti SEMUA consumer existing (Customers.jsx,
// CustomerDetail.jsx, CRMAutomation.jsx, Vehicles.jsx, Orders.jsx)
// TIDAK PERLU DIUBAH SAMA SEKALI -- mereka sekarang membaca data
// gabungan tanpa perlu tahu bahwa sumbernya sudah berubah.
//
// garage_customers & eg_customers TETAP ADA (ditandai deprecated
// oleh customerMigration.js), tidak dihapus -- additive migration.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { loadUnifiedCustomers, saveUnifiedCustomers } from '../lib/customerMigration'

// ─── Hook ─────────────────────────────────────────────────────
export function useCustomerStore() {
  const [customers, setCustomersState] = useState(loadUnifiedCustomers)

  // Persist setiap kali data berubah
  useEffect(() => {
    saveUnifiedCustomers(customers)
  }, [customers])

  const setCustomers = useCallback((updater) => {
    setCustomersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveUnifiedCustomers(next)
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

// ─── Fungsi non-hook untuk dibaca modul non-React (CRM, Orders, dll) ─
export function getAllCustomersFromStore() {
  return loadUnifiedCustomers()
}