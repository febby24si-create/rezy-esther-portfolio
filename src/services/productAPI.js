import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const productAPI = {
  async fetchAll() {
    const response = await axios.get(`${API_URL}/products`, {
      headers,
      params: { order: 'category.asc,name.asc' }
    })
    return response.data
  },

  // Dipakai halaman publik/member (Landing Page, Katalog Produk) — hanya
  // produk yang is_active = true yang boleh tampil ke customer.
  async fetchActive() {
    const response = await axios.get(`${API_URL}/products`, {
      headers,
      params: { order: 'category.asc,name.asc', is_active: 'eq.true' }
    })
    return response.data
  },

  // Ambil 1 produk berdasarkan id — dipakai halaman detail produk (guest).
  async fetchById(id) {
    const response = await axios.get(`${API_URL}/products`, {
      headers,
      params: { id: `eq.${id}`, limit: 1 }
    })
    return response.data?.[0] || null
  },

  async create(data) {
    const response = await axios.post(`${API_URL}/products`, data, { headers })
    return response.data[0] || null
  },

  async update(id, data) {
    const response = await axios.patch(`${API_URL}/products?id=eq.${id}`, data, { headers })
    return response.data[0] || null
  },

  async delete(id) {
    await axios.delete(`${API_URL}/products?id=eq.${id}`, { headers })
  },
}