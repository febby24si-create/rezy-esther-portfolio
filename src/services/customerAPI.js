import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const customerAPI = {
  // Login member: cari by email + password
  async loginCustomer(email, password) {
    const response = await axios.get(`${API_URL}/customers`, {
      headers,
      params: { email: `eq.${email}`, password: `eq.${password}`, limit: 1 }
    })
    return response.data[0] || null
  },

  // Register customer baru
  async registerCustomer(data) {
    const response = await axios.post(`${API_URL}/customers`, data, { headers })
    return response.data[0] || null
  },

  // Ambil semua customer (admin)
  async fetchAll() {
    const response = await axios.get(`${API_URL}/customers`, {
      headers,
      params: { order: 'created_at.desc' }
    })
    return response.data
  },

  // Ambil customer by ID
  async fetchById(id) {
    const response = await axios.get(`${API_URL}/customers`, {
      headers,
      params: { id: `eq.${id}`, limit: 1 }
    })
    return response.data[0] || null
  },

  // Update customer
  async update(id, data) {
    const response = await axios.patch(`${API_URL}/customers?id=eq.${id}`, data, { headers })
    return response.data[0] || null
  },

  // Hapus customer
  async delete(id) {
    await axios.delete(`${API_URL}/customers?id=eq.${id}`, { headers })
  },

  // Cek email sudah terdaftar
  async checkEmail(email) {
    const response = await axios.get(`${API_URL}/customers`, {
      headers,
      params: { email: `eq.${email}`, limit: 1 }
    })
    return response.data.length > 0
  },
}