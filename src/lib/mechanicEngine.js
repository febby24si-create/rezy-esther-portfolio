// ============================================================
// lib/mechanicEngine.js
//
// Mechanic status sebagai derived state (Supabase-backed)
//
// MIGRASI: file ini sebelumnya baca/tulis sessionStorage
// ('garage_mechanics'), TERPISAH TOTAL dari tabel `mechanics` di
// Supabase yang dipakai mechanicAPI (dan dikonsumsi Orders.jsx,
// Reports.jsx, Dashboard.jsx). Halaman Mechanics.jsx sendiri juga
// sudah dimigrasikan untuk memakai mechanicAPI — lihat catatan di
// pages/Mechanics.jsx.
//
// status ('Tersedia'/'Sibuk') DI-DERIVE dari activeOrderIds:
//   - activeOrderIds.length > 0  -> 'Sibuk'
//   - activeOrderIds.length === 0 -> 'Tersedia'
//
// activeOrderIds disimpan sebagai kolom JSONB `active_order_ids`
// di tabel `mechanics` — lihat SUPABASE_MIGRATION_mechanics_inventory.sql
//
// CATATAN KETERBATASAN (belum terpecahkan oleh migrasi ini):
// Orders.jsx menyimpan mekanik sebagai `mechanic_name` (teks bebas),
// BUKAN `mechanic_id` (foreign key). Akibatnya, order yang dibuat
// lewat alur yang berjalan sekarang tidak pernah membawa
// `order.mechanicId`, sehingga updateMechanicActiveOrders() di bawah
// ini hanya akan benar-benar terpanggil dari completeOrder() (lewat
// OrderDetail.jsx) untuk order yang KEBETULAN sudah punya mechanicId
// (mis. diisi manual). Untuk membuat fitur ini benar-benar hidup,
// Orders.jsx perlu diubah agar dropdown mekanik menyimpan mechanicId
// juga — perubahan terpisah yang sengaja tidak digabung ke sini.
// ============================================================

import { mechanicAPI } from '../services/mechanicAPI'

/**
 * Derive status ('Tersedia'/'Sibuk') dari jumlah activeOrderIds.
 * Label ini yang dipakai di seluruh UI existing (Mechanics.jsx,
 * Orders.jsx, Dashboard.jsx, Reports.jsx) — tidak ada enum bahasa
 * Inggris terpisah lagi (disederhanakan dari versi sessionStorage).
 */
function deriveStatus(activeOrderIds) {
  return (activeOrderIds && activeOrderIds.length > 0) ? 'Sibuk' : 'Tersedia'
}

/**
 * Tambah/hapus orderId dari active_order_ids mekanik di Supabase,
 * lalu re-derive & simpan status.
 *
 * @param {string} mechanicId
 * @param {string} orderId
 * @param {'add'|'remove'} action
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function updateMechanicActiveOrders(mechanicId, orderId, action) {
  if (!mechanicId || !orderId) {
    return { success: false, message: 'mechanicId/orderId kosong.' }
  }

  try {
    const mechanic = await mechanicAPI.fetchById(mechanicId)
    if (!mechanic) {
      return { success: false, message: `Mechanic ${mechanicId} tidak ditemukan di Supabase.` }
    }

    let activeOrderIds = Array.isArray(mechanic.active_order_ids) ? [...mechanic.active_order_ids] : []

    if (action === 'add') {
      if (!activeOrderIds.includes(orderId)) activeOrderIds.push(orderId)
    } else if (action === 'remove') {
      activeOrderIds = activeOrderIds.filter(id => id !== orderId)
    } else {
      return { success: false, message: `Action tidak dikenal: ${action}` }
    }

    await mechanicAPI.update(mechanicId, {
      active_order_ids: activeOrderIds,
      status: deriveStatus(activeOrderIds),
    })

    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * Baca daftar mekanik beserta status derived terkini dari Supabase.
 * @returns {Promise<Array>}
 */
export async function getAllMechanics() {
  return await mechanicAPI.fetchAll()
}