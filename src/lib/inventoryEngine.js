// ============================================================
// lib/inventoryEngine.js
//
// Inventory deduction sebagai subscriber ORDER_COMPLETED (Supabase-backed)
//
// MIGRASI: fungsi utama (baca & kurangi stok) sekarang lewat
// productAPI (Supabase) — sama seperti yang sudah dipakai
// pages/Inventory.jsx untuk CRUD & restock manual, jadi deduksi
// otomatis di sini akan langsung terlihat konsisten di halaman
// Inventory.
//
// Log riwayat deduksi TETAP ditulis ke sessionStorage
// ('garage_inventory_history') — ini SENGAJA, karena
// pages/Inventory.jsx sendiri juga masih memakai key yang sama
// untuk log riwayat (restock manual). Jadi ini bukan kemunduran,
// hanya mengikuti konvensi yang sudah ada di halaman tersebut.
// Kalau nanti riwayat inventory dipindah ke tabel Supabase,
// silakan migrasikan dua-duanya sekaligus.
// ============================================================

import { productAPI } from '../services/productAPI'

const LS_KEY_HISTORY = 'garage_inventory_history'

// Mapping nama servis (normalized) -> daftar { itemCode, qty }.
// Sama seperti sebelumnya — hanya servis dengan pemakaian part
// "standar" jelas yang dipetakan otomatis.
const SERVICE_PARTS_MAP = {
  'ganti oli': [
    { itemCode: 'OL-001', qty: 4 }, // Oli Mesin Shell 10W-40, ~4 liter
    { itemCode: 'FL-001', qty: 1 }, // Filter Oli Toyota
  ],
  'service berkala': [
    { itemCode: 'OL-001', qty: 4 },
    { itemCode: 'FL-001', qty: 1 },
  ],
  'servis berkala': [
    { itemCode: 'OL-001', qty: 4 },
    { itemCode: 'FL-001', qty: 1 },
  ],
  'ganti kampas rem': [
    { itemCode: 'RM-001', qty: 1 }, // Kampas Rem Depan Honda, 1 set
  ],
}

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(LS_KEY_HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(list) {
  try {
    sessionStorage.setItem(LS_KEY_HISTORY, JSON.stringify(list))
  } catch { /* ignore */ }
}

/**
 * Kurangi stok item yang dipetakan untuk `order.service` (jika ada
 * mapping) langsung di Supabase, dan catat setiap deduksi ke
 * riwayat (sessionStorage, mengikuti konvensi Inventory.jsx).
 *
 * @param {object} order - order yang baru COMPLETED
 * @returns {Promise<{ success: boolean, deducted?: Array, message?: string }>}
 */
export async function deductStockForOrder(order) {
  const serviceName = (order.service || '').trim().toLowerCase()
  const mapping = SERVICE_PARTS_MAP[serviceName]
  if (!mapping || mapping.length === 0) {
    return { success: false, message: `Tidak ada mapping part untuk servis "${order.service}" — skip deduksi otomatis.` }
  }

  let inventory
  try {
    inventory = await productAPI.fetchAll()
  } catch (err) {
    return { success: false, message: `Gagal mengambil data inventory dari Supabase: ${err.message}` }
  }
  if (!inventory || inventory.length === 0) {
    return { success: false, message: 'Data inventory kosong di Supabase.' }
  }

  const history = loadHistory()
  const deducted = []
  const today = new Date().toISOString().slice(0, 10)

  for (const part of mapping) {
    const item = inventory.find(i => i.code === part.itemCode)
    if (!item) continue

    const newStock = Math.max(0, item.stock - part.qty)
    try {
      await productAPI.update(item.id, { stock: newStock })
    } catch (err) {
      console.error(`[inventoryEngine] Gagal update stok ${item.code}:`, err)
      continue
    }

    deducted.push({ itemId: item.id, itemName: item.name, qty: part.qty, before: item.stock, after: newStock })

    history.unshift({
      id: 'HIST-' + Date.now() + '-' + item.id,
      itemId: item.id,
      itemName: item.name,
      change: -part.qty,
      note: `Otomatis: ${order.service} — ${order.id}`,
      date: today,
      source: 'order_completed',
      orderId: order.id,
    })
  }

  if (deducted.length === 0) {
    return { success: false, message: `Mapping ada untuk "${order.service}", tapi tidak ada item inventory dengan code yang cocok di Supabase.` }
  }

  saveHistory(history)
  return { success: true, deducted }
}