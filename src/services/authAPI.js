import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1/users"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
}

export const authAPI = {
  // Validasi login: cari user dengan email dan password yang sesuai
  async loginUser(email, password) {
    const response = await axios.get(API_URL, {
      headers,
      params: {
        email: `eq.${email}`,
        password: `eq.${password}`,
      },
    })
    return response.data // array, jika kosong = tidak ditemukan
  },

  // Register: simpan user baru ke tabel users
  async registerUser(data) {
    const response = await axios.post(API_URL, data, { headers })
    return response.data
  },
}
