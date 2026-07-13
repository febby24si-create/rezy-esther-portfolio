import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

// ============================================================
// shopAPI — pesanan produk (BEDA dari orderAPI yang untuk servis
// kendaraan). Reuse tabel `products` yang sudah ada (lihat
// productAPI.js) untuk katalog & stok — di sini hanya menangani
// product_orders & product_order_items (fitur baru).
// ============================================================
export const shopAPI = {
  // ── Pesanan produk milik satu customer (untuk Riwayat Pembelian) ──
  async fetchOrdersByCustomer(customerId) {
    const response = await axios.get(`${API_URL}/product_orders`, {
      headers,
      params: { customer_id: `eq.${customerId}`, order: 'created_at.desc' }
    })
    return response.data
  },

  // ── Semua pesanan produk (untuk admin) ──
  async fetchAllOrders() {
    const response = await axios.get(`${API_URL}/product_orders`, {
      headers,
      params: { order: 'created_at.desc' }
    })
    return response.data
  },

  async fetchOrderById(id) {
    const response = await axios.get(`${API_URL}/product_orders`, {
      headers,
      params: { id: `eq.${id}`, limit: 1 }
    })
    return response.data[0] || null
  },

  // ── Item dari satu pesanan (untuk detail/invoice) ──
  async fetchItemsByOrder(productOrderId) {
    const response = await axios.get(`${API_URL}/product_order_items`, {
      headers,
      params: { product_order_id: `eq.${productOrderId}` }
    })
    return response.data
  },

  // ── Buat pesanan baru (checkout) ──
  // items: [{ product_id, product_name, qty, price }]
  async createOrder({ customerId, recipientName, phone, address, notes, paymentMethod, items }) {
    const total = items.reduce((sum, it) => sum + it.qty * it.price, 0)
    const orderNumber = 'PRD-' + Date.now().toString().slice(-8)

    const orderRes = await axios.post(`${API_URL}/product_orders`, {
      order_number: orderNumber,
      customer_id: customerId,
      recipient_name: recipientName,
      phone,
      address,
      notes: notes || null,
      payment_method: paymentMethod,
      status: 'Menunggu Konfirmasi',
      total,
    }, { headers })

    const order = orderRes.data[0]
    if (!order) throw new Error('Gagal membuat pesanan produk.')

    const itemsPayload = items.map(it => ({
      product_order_id: order.id,
      product_id: it.product_id,
      product_name: it.product_name,
      qty: it.qty,
      price: it.price,
      subtotal: it.qty * it.price,
    }))
    await axios.post(`${API_URL}/product_order_items`, itemsPayload, { headers })

    return order
  },

  // ── Update status pesanan (admin) ──
  async updateOrderStatus(id, status) {
    const response = await axios.patch(`${API_URL}/product_orders?id=eq.${id}`, {
      status,
      updated_at: new Date().toISOString(),
    }, { headers })
    return response.data[0] || null
  },

  // ── Kurangi stok produk saat pesanan SELESAI ──
  // Dipanggil HANYA saat status berubah -> 'Selesai' (bukan setiap
  // update status apa pun), dan HANYA sekali per pesanan — caller
  // (PesananProduk.jsx) bertanggung jawab memastikan status
  // sebelumnya BUKAN 'Selesai' supaya stok tidak terpotong dua kali.
  // Stok tidak boleh negatif (di-clamp ke 0).
  async deductStockOnComplete(productOrderId) {
    const items = await this.fetchItemsByOrder(productOrderId)
    const { productAPI } = await import('./productAPI')

    const results = []
    for (const item of items) {
      if (!item.product_id) continue
      try {
        const product = await productAPI.fetchById(item.product_id)
        if (!product) continue
        const newStock = Math.max(0, (product.stock || 0) - item.qty)
        await productAPI.update(product.id, { stock: newStock })
        results.push({ productId: product.id, name: product.name, before: product.stock, after: newStock })
      } catch (err) {
        console.error(`[shopAPI] Gagal mengurangi stok produk ${item.product_id}:`, err)
      }
    }
    return results
  },
}