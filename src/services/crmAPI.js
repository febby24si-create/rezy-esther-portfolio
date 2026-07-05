// ============================================================
// crmAPI.js — CRM Automation Service
// Tabel: crm_reminders, crm_reviews
// ============================================================
import axios from 'axios'

const API_URL = "https://pupgvsrrfelnfglzwvjo.supabase.co/rest/v1"
const API_KEY = "sb_publishable_SLsI4RDFdUT8ZbNfRi2xUA_p8P2Eid4"

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

export const crmAPI = {

  // ── REMINDERS ──────────────────────────────────────────────

  async fetchReminders() {
    const response = await axios.get(`${API_URL}/crm_reminders`, {
      headers,
      params: { order: 'sent_at.desc' }
    })
    return response.data
  },

  async logReminder(data) {
    const response = await axios.post(`${API_URL}/crm_reminders`, {
      template_id:    data.templateId,
      template_title: data.templateTitle,
      segment:        data.segment,
      target_count:   data.targetCount,
      sent_by:        data.sentBy || 'Admin',
      sent_at:        new Date().toISOString(),
      channel:        data.channel || 'whatsapp,email',
    }, { headers })
    return response.data[0] || null
  },

  // ── REVIEWS ────────────────────────────────────────────────

  async fetchReviews() {
    const response = await axios.get(`${API_URL}/crm_reviews`, {
      headers,
      params: { order: 'date.desc' }
    })
    return response.data
  },

  async createReview(data) {
    const response = await axios.post(`${API_URL}/crm_reviews`, {
      customer_name: data.customerName,
      service:       data.service,
      mechanic:      data.mechanic,
      rating:        data.rating,
      review_text:   data.reviewText,
      date:          new Date().toISOString().slice(0, 10),
    }, { headers })
    return response.data[0] || null
  },

  async deleteReview(id) {
    await axios.delete(`${API_URL}/crm_reviews?id=eq.${id}`, { headers })
  },
}