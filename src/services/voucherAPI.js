import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const voucherAPI = {
  // Ambil voucher milik customer
  async fetchByCustomer(customerId) {
    const response = await axios.get(`${API_URL}/vouchers`, {
      headers,
      params: { customer_id: `eq.${customerId}`, order: 'created_at.desc' }
    })
    return response.data
  },

  async fetchById(id) {
    const response = await axios.get(`${API_URL}/vouchers`, {
      headers,
      params: { id: `eq.${id}`, limit: 1 }
    })
    return response.data[0] || null
  },

  // Buat voucher baru
  async create(data) {
    const response = await axios.post(`${API_URL}/vouchers`, data, { headers })
    return response.data[0] || null
  },

  // Update status voucher (misal: used)
  async update(id, data) {
    const response = await axios.patch(`${API_URL}/vouchers?id=eq.${id}`, data, { headers })
    return response.data[0] || null
  },
}