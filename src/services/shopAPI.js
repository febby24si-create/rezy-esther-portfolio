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

  // ── Semua item pesanan sekaligus (untuk statistik Dashboard) ──
  async fetchAllOrderItems() {
    const response = await axios.get(`${API_URL}/product_order_items`, { headers })
    return response.data
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
// ── Buat pesanan baru (checkout) ──
async createOrder({
  customerId,
  recipientName,
  phone,
  address,
  notes,
  paymentMethod,
  deliveryMethod,
  deliveryFee = 0,
  latitude,
  longitude,
  distanceKm,
  items,
}) {
  try {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.price)), 0)
    const total = subtotal + Number(deliveryFee || 0)

    const orderNumber = `PRD-${Date.now()}`
    const invoiceNumber = `INV-${orderNumber}`

    const isQRIS = (paymentMethod || "").toLowerCase().includes("qris")
    const initialStatus = isQRIS
      ? "Menunggu Pembayaran"
      : "Menunggu Konfirmasi"

    const payload = {
      order_number: orderNumber,
      invoice_number: invoiceNumber,

      customer_id: Number(customerId),

      recipient_name: recipientName,
      phone,
      address,
      notes: notes || null,

      payment_method: paymentMethod || "Cash",
      payment_status: isQRIS
        ? "Menunggu Pembayaran"
        : "Dibayar Nanti",

      delivery_method: deliveryMethod || null,
      delivery_fee: Number(deliveryFee || 0),

      latitude: latitude ?? null,
      longitude: longitude ?? null,
      distance_km: distanceKm ?? null,

      status: initialStatus,
      tracking_step: 1,

      subtotal,
      total,
    }

    console.log("Payload Order:", payload)

    const orderRes = await axios.post(
      `${API_URL}/product_orders`,
      payload,
      { headers }
    )

    const order = orderRes.data[0]

    if (!order) {
      throw new Error("Order gagal dibuat.")
    }

    const itemsPayload = items.map((it) => ({
      product_order_id: order.id,
      product_id: Number(it.product_id),
      product_name: it.product_name,
      qty: Number(it.qty),
      price: Number(it.price),
      subtotal: Number(it.qty) * Number(it.price),
    }))

    console.log("Payload Items:", itemsPayload)

    await axios.post(
      `${API_URL}/product_order_items`,
      itemsPayload,
      { headers }
    )

    return order
  } catch (err) {
  console.error("STATUS:", err.response?.status);

  console.error(
    "SUPABASE:",
    JSON.stringify(err.response?.data, null, 2)
  );

  console.error("PAYLOAD:", JSON.stringify(payload, null, 2));

  throw err;
}
},

  // ── Update status pesanan ──
  async updateOrderStatus(id, status, extra = {}) {
    const response = await axios.patch(`${API_URL}/product_orders?id=eq.${id}`, {
      status,
      updated_at: new Date().toISOString(),
      ...extra,
    }, { headers })
    return response.data[0] || null
  },

  // ── Update payment status ──
  async updatePaymentStatus(id, paymentStatus) {
    const response = await axios.patch(`${API_URL}/product_orders?id=eq.${id}`, {
      payment_status: paymentStatus,
      status: paymentStatus === 'Lunas' ? 'Diproses' : undefined,
      updated_at: new Date().toISOString(),
    }, { headers })
    return response.data[0] || null
  },

  // ── Kurangi stok produk saat pesanan SELESAI ──
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

  // ── Review produk ──────────────────────────────────────────
  async fetchReviews(productId) {
    try {
      const res = await axios.get(`${API_URL}/product_reviews`, {
        headers,
        params: { product_id: `eq.${productId}`, order: 'created_at.desc' }
      })
      return res.data
    } catch {
      return []
    }
  },

  async createReview(data) {
    try {
      const res = await axios.post(`${API_URL}/product_reviews`, data, { headers })
      return res.data[0]
    } catch (err) {
      console.error('Gagal kirim review:', err)
      // Simpan di localStorage jika tabel belum ada
      const key = `review_${data.product_id}_${data.customer_id}`
      localStorage.setItem(key, JSON.stringify({ ...data, id: Date.now(), created_at: new Date().toISOString() }))
      return data
    }
  },
}