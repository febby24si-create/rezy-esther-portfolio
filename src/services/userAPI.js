import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1/users"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
}

export const userAPI = {
  // Ambil semua data user
  async fetchUsers() {
    const response = await axios.get(API_URL, { headers })
    return response.data
  },

  // Tambah user baru
  async createUser(data) {
    const response = await axios.post(API_URL, data, { headers })
    return response.data
  },

  // Update user berdasarkan id
  async updateUser(id, data) {
    const response = await axios.patch(
      `${API_URL}?id=eq.${id}`,
      data,
      { headers }
    )
    return response.data
  },

  // Hapus user berdasarkan id
  async deleteUser(id) {
    await axios.delete(`${API_URL}?id=eq.${id}`, { headers })
  },
}
