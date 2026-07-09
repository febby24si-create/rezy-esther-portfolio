/**
 * publicAPI.js
 * Service untuk mem-fetch data publik (Testimoni & Statistik) untuk Landing Page.
 * Menggunakan arsitektur mirip layanan Supabase lainnya dengan fallback ke mock data.
 */

// Mock Data Testimoni
const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Budi Santoso',
    vehicle: 'Toyota Fortuner',
    tier: 'Member Gold',
    rating: 5,
    text: '"Servis di Esther Garage benar-benar berbeda. Mekaniknya ramah, prosesnya cepat, dan hasilnya memuaskan. Mobil saya terasa lebih responsif setelah tune up. Rekomendasi banget!"',
    avatarId: 12
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    vehicle: 'Honda HRV',
    tier: 'Member Silver',
    rating: 5,
    text: '"Fasilitas nunggunya nyaman banget. Tracking via web sangat membantu jadi ga perlu nanya-nanya terus. Transparan dan jujur masalah harga sparepart."',
    avatarId: 5
  },
  {
    id: 3,
    name: 'Agus Pratama',
    vehicle: 'Mitsubishi Pajero',
    tier: 'Member Platinum',
    rating: 5,
    text: '"Sudah 2 tahun langganan. Mekaniknya jago banget nge-handle masalah mesin diesel saya yang sering ngempos. Puas pokoknya!"',
    avatarId: 8
  }
];

// Mock Data Stats
const MOCK_STATS = {
  pelanggan: 5120,
  mekanik: 12,
  tahun: 8,
  kepuasan: 98
};

export const publicAPI = {
  async fetchTestimonials() {
    // Simulasi delay jaringan (misal: fetch dari Supabase `reviews` table)
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_TESTIMONIALS;
  },

  async fetchStats() {
    // Simulasi delay jaringan
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_STATS;
  }
};
