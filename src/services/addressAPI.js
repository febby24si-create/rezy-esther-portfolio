// ============================================================
// addressAPI.js
// CRUD untuk customer_addresses di Supabase
// ============================================================
import axios from 'axios'

const API_URL = 'https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1'
const API_KEY = 'sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4'

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

export const addressAPI = {
  // Ambil semua alamat milik satu customer
  async fetchByCustomer(customerId) {
    try {
      const res = await axios.get(`${API_URL}/customer_addresses`, {
        headers,
        params: { customer_id: `eq.${customerId}`, order: 'is_default.desc,created_at.desc' },
      })
      return res.data
    } catch {
      // Jika tabel belum ada, kembalikan array kosong
      return []
    }
  },

  // Buat alamat baru
  async create(data) {
    const res = await axios.post(`${API_URL}/customer_addresses`, data, { headers })
    return res.data[0]
  },

  // Update alamat
  async update(id, data) {
    const res = await axios.patch(
      `${API_URL}/customer_addresses?id=eq.${id}`,
      { ...data, updated_at: new Date().toISOString() },
      { headers }
    )
    return res.data[0]
  },

  // Hapus alamat
  async delete(id) {
    await axios.delete(`${API_URL}/customer_addresses?id=eq.${id}`, { headers })
  },

  // Set default address
  async setDefault(customerId, id) {
    // Reset semua jadi non-default
    await axios.patch(
      `${API_URL}/customer_addresses?customer_id=eq.${customerId}`,
      { is_default: false },
      { headers: { ...headers, Prefer: 'return=minimal' } }
    )
    // Set yang dipilih jadi default
    await axios.patch(
      `${API_URL}/customer_addresses?id=eq.${id}`,
      { is_default: true },
      { headers: { ...headers, Prefer: 'return=minimal' } }
    )
  },
}
