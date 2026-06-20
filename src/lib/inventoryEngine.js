// ============================================================
// lib/inventoryEngine.js
//
// PHASE 2 — Inventory deduction sebagai subscriber ORDER_COMPLETED (Rule 4)
//
// Sebelumnya, Inventory.jsx adalah pulau total: tidak ada satu pun
// referensi ke order/service, dan tidak ada referensi balik dari
// Orders ke Inventory. Order 'Ganti Oli' tidak mengurangi stok oli.
//
// Fix (Phase 2, scope minimal -- bukan Phase 3 unifikasi katalog
// layanan penuh): SERVICE_PARTS_MAP memetakan NAMA SERVIS
// (dinormalisasi lowercase+trim, agar menjangkau kedua vocabulary
// yang masih berbeda antara SERVICE_OPTIONS/Orders.jsx admin dan
// `layanan`/guestData.js BookingService -- penyatuan penuh adalah
// scope Phase 3) ke daftar item inventory & qty yang terpakai per
// 1x servis.
//
// deductStockForOrder() dipanggil oleh subscriber ORDER_COMPLETED
// (lib/orderSubscribers.js), HANYA saat order benar-benar selesai
// (Rule 4) -- bukan saat dibuat/dikonfirmasi.
//
// Setiap deduksi otomatis dicatat ke garage_inventory_history
// dengan note yang menyebut orderId, agar admin bisa audit/koreksi
// manual jika qty aktual berbeda dari mapping standar (mis. servis
// tertentu memakai oli lebih dari biasanya).
// ============================================================

const LS_KEY_INVENTORY = 'garage_inventory'
const LS_KEY_HISTORY = 'garage_inventory_history'

// Mapping nama servis (normalized) -> daftar { itemCode, qty }.
// itemCode merujuk ke field `code` di inventoryData (lebih stabil
// untuk dibaca manusia dibanding `id`, dan tidak bergantung pada
// urutan seed).
//
// Hanya servis yang punya pemakaian part "standar" jelas yang
// dipetakan. Servis yang sangat bervariasi (mis. 'Servis Rem' bisa
// butuh kampas, bisa tidak) sengaja TIDAK dipetakan otomatis --
// admin tetap input manual via Restock Modal untuk kasus tersebut,
// untuk menghindari deduksi otomatis yang salah/menyesatkan.
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

function loadInventory() {
  try {
    const raw = sessionStorage.getItem(LS_KEY_INVENTORY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveInventory(list) {
  try {
    sessionStorage.setItem(LS_KEY_INVENTORY, JSON.stringify(list))
  } catch { /* ignore */ }
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
 * RULE 4 — Inventory deduction hanya terjadi saat ORDER_COMPLETED.
 *
 * Dipanggil dari subscriber ORDER_COMPLETED. Mengurangi stok item
 * yang dipetakan untuk `order.service` (jika ada mapping), dan
 * mencatat setiap deduksi ke garage_inventory_history.
 *
 * Jika Inventory.jsx belum pernah dibuka (garage_inventory belum
 * ada di sessionStorage), fungsi ini SKIP secara aman -- inventory
 * akan terinisialisasi dengan data seed saat halaman Inventory
 * pertama kali dibuka, dan deduksi untuk order-order sebelumnya
 * tidak bisa direkonstruksi mundur (limitasi sessionStorage-only,
 * dicatat sebagai known limitation untuk Phase 4 / backend).
 *
 * @param {object} order - order yang baru COMPLETED
 * @returns {{ success: boolean, deducted?: Array, message?: string }}
 */
export function deductStockForOrder(order) {
  const serviceName = (order.service || '').trim().toLowerCase()
  const mapping = SERVICE_PARTS_MAP[serviceName]
  if (!mapping || mapping.length === 0) {
    return { success: false, message: `Tidak ada mapping part untuk servis "${order.service}" — skip deduksi otomatis.` }
  }

  const inventory = loadInventory()
  if (!inventory) {
    return { success: false, message: 'garage_inventory belum terinisialisasi — buka halaman Inventory minimal sekali.' }
  }

  const history = loadHistory()
  const deducted = []
  const now = new Date().toISOString().slice(0, 10)

  const updatedInventory = inventory.map(item => {
    const part = mapping.find(p => p.itemCode === item.code)
    if (!part) return item

    const newStock = Math.max(0, item.stock - part.qty)
    deducted.push({ itemId: item.id, itemName: item.name, qty: part.qty, before: item.stock, after: newStock })

    history.unshift({
      id: 'HIST-' + Date.now() + '-' + item.id,
      itemId: item.id,
      itemName: item.name,
      change: -part.qty,
      note: `Otomatis: ${order.service} — ${order.id}`,
      date: now,
      source: 'order_completed',
      orderId: order.id,
    })

    return { ...item, stock: newStock }
  })

  if (deducted.length === 0) {
    return { success: false, message: `Mapping ada untuk "${order.service}", tapi tidak ada item inventory dengan code yang cocok.` }
  }

  saveInventory(updatedInventory)
  saveHistory(history)
  return { success: true, deducted }
}