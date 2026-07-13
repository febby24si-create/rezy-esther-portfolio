// ============================================================
// lib/orderSubscribers.js
//
// PHASE 2 — Subscriber registration
//
// File ini mendaftarkan SEMUA side effect Order sebagai subscriber
// terhadap event dari lib/orderEvents.js. Didaftarkan SEKALI di
// bootstrap aplikasi (main.jsx) via registerOrderSubscribers().
//
// Tidak ada side effect bisnis yang boleh dipanggil langsung dari
// UI component (Rule: "Jangan menaruh side effect langsung di UI
// component"). UI component hanya men-dispatch event via emit();
// file ini yang menentukan apa yang terjadi sebagai akibatnya.
//
// ── ORDER_COMPLETED ──────────────────────────────────────────
//   1. Loyalty: applyOrderCompletedLoyalty(customerId, finalTotal, ...)
//      - poin, tier-up voucher, after-service voucher
//      - RULE 2: pakai finalTotal, bukan estimatedTotal
//   2. Voucher: jika order.voucherId ada, markVoucherAsUsed(...)
//      - RULE 3: voucher 'used' hanya di sini, bukan saat dipilih
//   3. Mechanic: activeOrderIds dikurangi, status di-derive ulang
//      - RULE 5: status mekanik adalah derived state
//
// ── ORDER_CONFIRMED ───────────────────────────────────────────
//   - Mechanic: activeOrderIds bertambah (order baru masuk antrian
//     kerja mekanik tersebut), status di-derive ulang
//
// ── ORDER_CANCELLED ───────────────────────────────────────────
//   - Mechanic: activeOrderIds dikurangi jika sudah pernah di-assign
//   - TIDAK ADA reversal Loyalty/Voucher/Inventory karena memang
//     belum pernah diberikan sebelum COMPLETED (Rule 1 & 2)
//
// ── ORDER_CREATED ─────────────────────────────────────────────
//   - TIDAK ADA side effect (Rule 1). Hanya logging/no-op.
// ============================================================

import { ORDER_EVENTS, subscribe, emit } from './orderEvents'
import { applyOrderCompletedLoyalty, markVoucherAsUsed } from './loyaltyEngine'
import { updateMechanicActiveOrders } from './mechanicEngine'
import { deductStockForOrder } from './inventoryEngine'

let registered = false

/**
 * Daftarkan semua subscriber. Idempotent — aman dipanggil lebih
 * dari sekali (mis. React StrictMode double-invoke di development),
 * hanya akan benar-benar mendaftar sekali.
 */
export function registerOrderSubscribers() {
  if (registered) return
  registered = true

  // ── ORDER_CREATED ────────────────────────────────────────
  // Rule 1: BookingService hanya boleh membuat Order. Tidak ada
  // side effect ke Loyalty/Voucher/Inventory/Mechanic di sini.
  subscribe(ORDER_EVENTS.ORDER_CREATED, () => {
    // Intentionally no-op. Order sudah ditulis oleh caller
    // (BookingService atau Orders.jsx) sebelum emit ini.
    // Placeholder untuk audit log / notifikasi admin di masa depan.
  })

  // ── ORDER_CONFIRMED ──────────────────────────────────────
  // Admin assign mekanik & konfirmasi order -> mekanik tersebut
  // mendapat 1 order aktif baru.
  subscribe(ORDER_EVENTS.ORDER_CONFIRMED, ({ order }) => {
    if (order.mechanicId) {
      updateMechanicActiveOrders(order.mechanicId, order.id, 'add').catch(err =>
        console.error('[orderSubscribers] Gagal update mechanic active orders (confirmed):', err)
      )
    }
  })

  // ── ORDER_STARTED ────────────────────────────────────────
  // Placeholder untuk SLA tracking di masa depan. Tidak ada
  // side effect wajib saat ini.
  subscribe(ORDER_EVENTS.ORDER_STARTED, () => {
    // no-op for now
  })

  // ── ORDER_COMPLETED ──────────────────────────────────────
  subscribe(ORDER_EVENTS.ORDER_COMPLETED, async ({ order }) => {
    // 1. Loyalty — Rule 2: gunakan finalTotal, bukan estimatedTotal
    // SUDAH Supabase-backed (lihat lib/loyaltyEngine.js). CATATAN: untuk
    // order yang selesai lewat OrderDetail.jsx (workflowEngine), poin
    // dasar SUDAH diberikan langsung di completeOrder() itu sendiri —
    // baris ini akan menambah poin KEDUA KALINYA untuk jalur tersebut.
    // Untuk order yang selesai lewat Orders.jsx (yang TIDAK meng-emit
    // event ini), baris ini adalah satu-satunya jalur pemberian poin.
    const total = order.finalTotal ?? order.total
    if (order.customerId && total > 0) {
      try {
        const result = await applyOrderCompletedLoyalty(order.customerId, total, order.id, order.service)
        if (result.success && result.pointsEarned > 0) {
          const { notificationAPI } = await import('../services/notificationAPI')
          await notificationAPI.notifyServiceDone(order.customer, order.service, order.id, order.customerId)
          await notificationAPI.notifyPointsEarned(order.customerId, result.pointsEarned, order.service)
        }
      } catch (err) {
        console.error('[orderSubscribers] Gagal proses loyalty (completed):', err)
      }
    }

    // 2. Voucher — Rule 3: voucher jadi 'used' hanya di sini
    // SUDAH Supabase-backed (lihat lib/loyaltyEngine.js).
    if (order.customerId && order.voucherId) {
      try {
        const result = await markVoucherAsUsed(order.customerId, order.voucherId, order.id)
        if (result.success) {
          emit(ORDER_EVENTS.VOUCHER_APPLIED, { order, voucherId: order.voucherId })
        }
      } catch (err) {
        console.error('[orderSubscribers] Gagal tandai voucher used:', err)
      }
    }

    // 3. Mechanic — Rule 5: activeOrderIds berkurang, status derived
    // SUDAH Supabase-backed (lihat lib/mechanicEngine.js). order.mechanicId
    // sekarang terisi kalau mekanik di-assign lewat Orders.jsx atau
    // OrderDetail.jsx (lihat pages/Orders.jsx handleSubmit/handleQuickAssign).
    if (order.mechanicId) {
      updateMechanicActiveOrders(order.mechanicId, order.id, 'remove').catch(err =>
        console.error('[orderSubscribers] Gagal update mechanic active orders (completed):', err)
      )
    }

    // 4. Inventory — Rule 4: deduksi stok hanya saat COMPLETED
    // SUDAH Supabase-backed (lihat lib/inventoryEngine.js).
    deductStockForOrder(order).catch(err =>
      console.error('[orderSubscribers] Gagal deduksi stok inventory:', err)
    )
  })

  // ── ORDER_CANCELLED ──────────────────────────────────────
  // Tidak ada reversal Loyalty/Voucher/Inventory — memang belum
  // pernah diberikan sebelum COMPLETED.
  subscribe(ORDER_EVENTS.ORDER_CANCELLED, ({ order }) => {
    if (order.mechanicId) {
      updateMechanicActiveOrders(order.mechanicId, order.id, 'remove').catch(err =>
        console.error('[orderSubscribers] Gagal update mechanic active orders (cancelled):', err)
      )
    }
  })
}