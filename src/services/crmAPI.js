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

  // ── CAMPAIGNS ──────────────────────────────────────────────

  async fetchCampaigns() {
    const response = await axios.get(`${API_URL}/crm_campaigns`, {
      headers,
      params: { order: 'created_at.desc' }
    })
    return response.data
  },

  async createCampaign(data) {
    const response = await axios.post(`${API_URL}/crm_campaigns`, {
      name:            data.name,
      type:            data.type,
      description:     data.description,
      discount_pct:    data.discountPct,
      target_segment:  data.targetSegment,
      voucher_quota:   data.voucherQuota,
      voucher_used:    0,
      starts_at:       data.startsAt || new Date().toISOString(),
      ends_at:         data.endsAt || null,
      status:          data.status || 'draft',
    }, { headers })
    return response.data[0] || null
  },

  async updateCampaign(id, data) {
    const response = await axios.patch(`${API_URL}/crm_campaigns?id=eq.${id}`, data, { headers })
    return response.data[0] || null
  },

  async deleteCampaign(id) {
    await axios.delete(`${API_URL}/crm_campaigns?id=eq.${id}`, { headers })
  },

  // ── REWARDS ────────────────────────────────────────────────

  async fetchRewards() {
    const response = await axios.get(`${API_URL}/crm_rewards`, {
      headers,
      params: { order: 'created_at.desc' }
    })
    return response.data
  },

  async createReward(data) {
    const response = await axios.post(`${API_URL}/crm_rewards`, {
      name:         data.name,
      description:  data.description,
      points_cost:  data.pointsCost,
      icon:         data.icon || '🎁',
      stock:        data.stock ?? 0,
      redeemed:     0,
      is_active:    true,
    }, { headers })
    return response.data[0] || null
  },

  // ── POINT LOG (pakai tabel point_history yang sudah ada) ────
  // Sengaja dibuat terpisah dari pointAPI.addPoint karena dipanggil
  // dari alur reward-redemption (bukan alur order/registrasi).
  async logPointChange(data) {
    const signedPoints = data.type === 'out' ? -Math.abs(data.points) : Math.abs(data.points)
    const response = await axios.post(`${API_URL}/point_history`, {
      customer_id:  data.customerId,
      type:         data.type,
      points:       signedPoints,
      description:  data.description,
      created_by:   data.createdBy || 'Admin',
    }, { headers })
    return response.data[0] || null
  },

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