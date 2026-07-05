import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const pointAPI = {
  // Ambil riwayat poin customer
  async fetchByCustomer(customerId) {
    const response = await axios.get(`${API_URL}/point_history`, {
      headers,
      params: { customer_id: `eq.${customerId}`, order: 'created_at.desc' }
    })
    return response.data
  },

  // Tambah transaksi poin
  async addPoint(data) {
    const response = await axios.post(`${API_URL}/point_history`, data, { headers })
    return response.data[0] || null
  },
}