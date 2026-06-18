// ============================================================
// guestData.js — Data terpusat untuk seluruh Guest Area CRM
// ============================================================

// ─── PROFIL BENGKEL ─────────────────────────────────────────
export const bengkelProfile = {
  name: 'Esther Garage',
  tagline: 'Bengkel Modern, Servis Terpercaya',
  founded: '2015',
  address: 'Jl. Raya Bukittinggi No. 88, Bukittinggi Sumatera Barat 25113',
  phone: '+62 887-082-30676',
  whatsapp: '+62 887-082-30676',
  email: 'febby24si@mahasiswa.pcr.ac.id',
  openHours: 'Senin–Sabtu 08.00–18.00',
  description:
    'Esther Garage hadir sejak 2015 sebagai bengkel terpercaya di Sumatera Barat. Kami menggabungkan teknologi diagnostik modern dengan mekanik bersertifikat untuk memberikan layanan terbaik bagi kendaraan Anda.',
  stats: { customers: 12500, serviceDone: 48000, mechanics: 24, satisfaction: 98 },
  visi: 'Menjadi bengkel otomotif terpercaya dan berteknologi tinggi di Indonesia dengan standar layanan kelas dunia.',
  misi: [
    'Memberikan layanan servis berkualitas tinggi dengan harga transparan.',
    'Menggunakan teknologi diagnostik terkini untuk hasil akurat.',
    'Membangun kepercayaan pelanggan melalui kejujuran dan profesionalisme.',
    'Mengembangkan mekanik bersertifikat internasional.',
    'Menjaga lingkungan bengkel yang bersih, aman, dan nyaman.',
  ],
  certifications: ['ISO 9001:2015', 'AHM Authorized', 'TAM Certified', 'Snap-on Certified', 'Bosch Service Partner'],
  milestones: [
    { year: '2015', event: 'Berdiri di Bukittinggi dengan 3 mekanik dan 2 bay servis' },
    { year: '2017', event: 'Ekspansi — 10 bay servis dan bergabung dengan jaringan TAM' },
    { year: '2019', event: 'Peluncuran sistem CRM dan loyalitas pelanggan digital' },
    { year: '2021', event: 'Raih penghargaan "Best Workshop Sumatera Barat"' },
    { year: '2023', event: 'Launching booking online & tracking service real-time' },
    { year: '2025', event: 'Lebih dari 12.500 pelanggan aktif' },
  ],
}

// ─── MEKANIK ────────────────────────────────────────────────
export const mechanics = [
  { id: 1, name: 'Ahmad Supriyadi', role: 'Kepala Mekanik', exp: '12 Tahun', specialty: 'Mesin & Transmisi', cert: 'TAM Expert', rating: 4.9 },
  { id: 2, name: 'Eka Fitriani', role: 'Senior Mekanik', exp: '8 Tahun', specialty: 'Kelistrikan & AC', cert: 'Bosch Certified', rating: 4.8 },
  { id: 3, name: 'Budi Hartanto', role: 'Mekanik', exp: '5 Tahun', specialty: 'Spooring & Balancing', cert: 'Hunter Certified', rating: 4.7 },
  { id: 4, name: 'Dedi Kurniawan', role: 'Mekanik', exp: '6 Tahun', specialty: 'Body & Rem', cert: 'AHM Certified', rating: 4.8 },
]

// ─── LAYANAN ─────────────────────────────────────────────────
export const layanan = [
  {
    id: 'L01', name: 'Service Berkala', icon: '🔧', category: 'Perawatan',
    desc: 'Perawatan rutin kendaraan meliputi penggantian oli, filter, dan pemeriksaan komponen vital sesuai jadwal pabrikan.',
    hargaMulai: 250000, hargaMaks: 750000, durasi: '2–3 Jam', populer: true,
    highlights: ['Ganti Oli Mesin', 'Filter Udara', 'Cek 30 Titik', 'Laporan Digital'],
  },
  {
    id: 'L02', name: 'Tune Up', icon: '⚙️', category: 'Performa',
    desc: 'Optimasi mesin untuk performa maksimal, termasuk penyetelan busi, karburator/injeksi, dan timing mesin.',
    hargaMulai: 350000, hargaMaks: 850000, durasi: '3–4 Jam', populer: true,
    highlights: ['Ganti Busi', 'Bersih Throttle Body', 'Reset ECU', 'Uji Emisi'],
  },
  {
    id: 'L03', name: 'Ganti Oli', icon: '🛢️', category: 'Perawatan',
    desc: 'Penggantian oli mesin, oli transmisi, atau oli gardan dengan produk original bergaransi.',
    hargaMulai: 120000, hargaMaks: 350000, durasi: '30–60 Menit', populer: true,
    highlights: ['Oli Original', 'Filter Oli Baru', 'Cek Kebocoran', 'Reminder Otomatis'],
  },
  {
    id: 'L04', name: 'Spooring', icon: '🎯', category: 'Ban & Kaki',
    desc: 'Pengaturan sudut roda dengan teknologi 3D alignment untuk stabilitas dan kenyamanan berkendara optimal.',
    hargaMulai: 150000, hargaMaks: 300000, durasi: '1–2 Jam', populer: false,
    highlights: ['3D Alignment', 'Laporan Digital', 'Garansi 3 Bulan', 'Cek Kaki-kaki'],
  },
  {
    id: 'L05', name: 'Balancing', icon: '⚖️', category: 'Ban & Kaki',
    desc: 'Penyeimbangan roda dan ban untuk menghilangkan getaran, mengurangi keausan ban, dan hemat BBM.',
    hargaMulai: 100000, hargaMaks: 200000, durasi: '1 Jam', populer: false,
    highlights: ['Mesin Balancing Modern', 'Cek Tekanan Ban', 'Rotasi Ban', 'Garansi 3 Bulan'],
  },
  {
    id: 'L06', name: 'Service AC', icon: '❄️', category: 'Kenyamanan',
    desc: 'Perawatan dan perbaikan AC kendaraan mulai dari pengisian freon, kebersihan evaporator hingga penggantian kompressor.',
    hargaMulai: 200000, hargaMaks: 1500000, durasi: '2–5 Jam', populer: true,
    highlights: ['Isi Freon R134a', 'Cuci Evaporator', 'Cek Kompresor', 'Filter Kabin Baru'],
  },
  {
    id: 'L07', name: 'Service Mesin', icon: '🔩', category: 'Performa',
    desc: 'Perbaikan dan overhaul mesin meliputi diagnosa elektronik, perbaikan kebocoran, dan penggantian komponen bermasalah.',
    hargaMulai: 500000, hargaMaks: 5000000, durasi: '1–3 Hari', populer: false,
    highlights: ['Diagnosa OBD2', 'Overhaul Mesin', 'Ganti Gasket', 'Garansi 3 Bulan'],
  },
  {
    id: 'L08', name: 'Service Kelistrikan', icon: '⚡', category: 'Elektronik',
    desc: 'Diagnosa dan perbaikan sistem kelistrikan kendaraan mulai dari aki, alternator, wiring, hingga sistem sensor ECU.',
    hargaMulai: 150000, hargaMaks: 2000000, durasi: '2–8 Jam', populer: false,
    highlights: ['Cek Aki & Alternator', 'Diagnosa Sensor', 'Perbaikan Wiring', 'Reset Lampu Check Engine'],
  },
]

export const promos = [
  {
    id: 'P01',
    title: 'Paket Servis Berkala Hemat',
    type: 'promo',
    badge: 'HOT',
    badgeColor: 'red',
    desc: 'Servis berkala lengkap + ganti oli + pengecekan 21 titik kendaraan.',
    diskon: 30,
    minTransaction: 300000,
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    terms: 'Minimal transaksi Rp300.000. Tidak dapat digabung promo lain.',
    active: true,
    code: 'HEMAT30',
    image:
      'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },

  {
    id: 'P02',
    title: 'Diskon Service AC',
    type: 'promo',
    badge: 'NEW',
    badgeColor: 'blue',
    desc: 'Cuci evaporator dan isi freon dengan harga spesial.',
    diskon: 25,
    minTransaction: 200000,
    validUntil: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    terms: 'Berlaku untuk paket service AC lengkap.',
    active: true,
    code: 'AC25',
    image:
      'https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },

  {
    id: 'P03',
    title: 'Voucher Ulang Tahun',
    type: 'birthday',
    badge: '🎂',
    badgeColor: 'purple',
    desc: 'Diskon spesial 20% untuk semua layanan di bulan ulang tahun.',
    diskon: 20,
    minTransaction: 0,
    validUntil: 'Bulan Ulang Tahun',
    terms: 'Berlaku satu kali selama bulan ulang tahun.',
    active: true,
    code: 'BDAY20',
    image:
      'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },

  {
    id: 'P04',
    title: 'Reward Loyal Customer',
    type: 'loyalty',
    badge: '⭐',
    badgeColor: 'yellow',
    desc: 'Servis ke-10 gratis untuk pelanggan setia Esther Garage.',
    diskon: 100,
    minTransaction: 0,
    validUntil: 'Tidak Ada Batas',
    terms: 'Minimal telah melakukan 10 transaksi.',
    active: true,
    code: 'LOYAL10',
    image:
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },

  {
    id: 'P05',
    title: 'Voucher Member Baru',
    type: 'member',
    badge: 'WELCOME',
    badgeColor: 'green',
    desc: 'Diskon 15% untuk servis pertama setelah registrasi member.',
    diskon: 15,
    minTransaction: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    terms: 'Berlaku satu kali dalam 30 hari pertama.',
    active: true,
    code: 'WELCOME15',
    image:
      'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },

  {
    id: 'P06',
    title: 'Spooring + Balancing',
    type: 'promo',
    badge: 'BUNDLING',
    badgeColor: 'orange',
    desc: 'Paket spooring dan balancing 4 roda dengan harga spesial.',
    diskon: 40,
    minTransaction: 0,
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    terms: 'Tidak termasuk penggantian sparepart.',
    active: true,
    code: 'BUNDLE40',
    image:
      'https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&cs=tinysrgb&w=1200'
  }
]

// ─── VOUCHER SAYA ────────────────────────────────────────────
export const myVouchers = [
  { id: 'VC-2401', code: 'BDAY-BUDI-2024', title: 'Voucher Ulang Tahun', diskon: 20, status: 'active', validUntil: '2025-07-31', type: 'birthday' },
  { id: 'VC-2402', code: 'AFTER-SVC-001', title: 'Voucher Setelah Service', diskon: 10, status: 'active', validUntil: '2025-08-15', type: 'aftersvc' },
  { id: 'VC-2403', code: 'LOYAL-GOLD-01', title: 'Reward Pelanggan Gold', diskon: 100, status: 'active', validUntil: '2025-09-01', type: 'loyalty' },
  { id: 'VC-2404', code: 'MEMBER-BARU', title: 'Welcome Member', diskon: 15, status: 'used', validUntil: '2024-12-31', usedAt: '2024-11-20', type: 'member' },
  { id: 'VC-2405', code: 'PROMO-ACX10', title: 'Diskon Service AC', diskon: 25, status: 'expired', validUntil: '2024-10-31', type: 'promo' },
]

// ─── LOYALTY POINT ───────────────────────────────────────────
export const loyaltyData = {
  currentPoints: 3250, tier: 'Gold', nextTier: 'Platinum',
  pointsToNextTier: 750, tierProgress: 81,
  history: [
    { id: 'LP-001', type: 'in', desc: 'Service Berkala — #ORD-A1B2C3D4', points: 450, date: '2025-05-10', ref: '#ORD-A1B2C3D4' },
    { id: 'LP-002', type: 'in', desc: 'Bonus Loyal Customer', points: 200, date: '2025-04-28', ref: 'SYSTEM' },
    { id: 'LP-003', type: 'out', desc: 'Redeem Voucher Service', points: -300, date: '2025-04-15', ref: 'VC-2402' },
    { id: 'LP-004', type: 'in', desc: 'Ganti Oli — #ORD-E5F6G7H8', points: 120, date: '2025-03-20', ref: '#ORD-E5F6G7H8' },
    { id: 'LP-005', type: 'in', desc: 'Tune Up — #ORD-I9J0K1L2', points: 350, date: '2025-02-14', ref: '#ORD-I9J0K1L2' },
    { id: 'LP-006', type: 'out', desc: 'Redeem Free Service', points: -500, date: '2025-01-30', ref: 'VC-2403' },
    { id: 'LP-007', type: 'in', desc: 'Service AC — #ORD-M3N4O5P6', points: 280, date: '2024-12-05', ref: '#ORD-M3N4O5P6' },
  ],
  rewards: [
    { id: 'R01', name: 'Diskon 10% Service', points: 500, category: 'Voucher', available: true },
    { id: 'R02', name: 'Ganti Oli Gratis', points: 1000, category: 'Service', available: true },
    { id: 'R03', name: 'Service Berkala Gratis', points: 2500, category: 'Service', available: true },
    { id: 'R04', name: 'Voucher Rp100.000', points: 800, category: 'Voucher', available: true },
    { id: 'R05', name: 'Merchandise Esther Garage', points: 1500, category: 'Merchandise', available: false },
  ],
}

// ─── RIWAYAT SERVICE ─────────────────────────────────────────
export const serviceHistory = [
  {
    id: '#ORD-A1B2C3D4', vehicle: 'Toyota Avanza', plate: 'B 1234 ABC',
    date: '2025-05-10', mechanic: 'Ahmad Supriyadi', service: 'Service Berkala',
    status: 'Selesai', total: 450000, duration: '2.5 Jam',
    parts: [
      { name: 'Oli Mesin Shell 4T', qty: 4, price: 65000 },
      { name: 'Filter Oli', qty: 1, price: 45000 },
      { name: 'Filter Udara', qty: 1, price: 85000 },
    ],
    jasa: [{ name: 'Jasa Service Berkala', price: 100000 }],
    notes: 'Kondisi kendaraan baik. Disarankan ganti busi pada service berikutnya (±5000 km lagi).',
    pointsEarned: 450,
  },
  {
    id: '#ORD-E5F6G7H8', vehicle: 'Honda Beat', plate: 'D 5678 XYZ',
    date: '2025-03-20', mechanic: 'Eka Fitriani', service: 'Ganti Oli',
    status: 'Selesai', total: 120000, duration: '45 Menit',
    parts: [{ name: 'Oli Mesin AHM 10W-30', qty: 1, price: 75000 }],
    jasa: [{ name: 'Jasa Ganti Oli', price: 35000 }],
    notes: 'Oli diganti sesuai rekomendasi. Kondisi mesin baik.', pointsEarned: 120,
  },
  {
    id: '#ORD-I9J0K1L2', vehicle: 'Suzuki Ertiga', plate: 'F 9012 PQR',
    date: '2025-02-14', mechanic: 'Budi Hartanto', service: 'Tune Up',
    status: 'Selesai', total: 350000, duration: '3 Jam',
    parts: [
      { name: 'Busi NGK Iridium', qty: 4, price: 55000 },
      { name: 'Cairan Throttle Body Cleaner', qty: 1, price: 45000 },
    ],
    jasa: [{ name: 'Jasa Tune Up', price: 125000 }],
    notes: 'Setelah tune up performa mesin meningkat signifikan. Reset ECU dilakukan.', pointsEarned: 350,
  },
  {
    id: '#ORD-M3N4O5P6', vehicle: 'Yamaha NMAX', plate: 'G 3456 STU',
    date: '2024-12-05', mechanic: 'Dedi Kurniawan', service: 'Service Rem',
    status: 'Selesai', total: 180000, duration: '1.5 Jam',
    parts: [{ name: 'Kampas Rem Depan', qty: 1, price: 95000 }],
    jasa: [{ name: 'Jasa Service Rem', price: 75000 }],
    notes: 'Kampas rem diganti karena sudah tipis. Rem belakang masih layak pakai.', pointsEarned: 180,
  },
]

// ─── KENDARAAN CUSTOMER ──────────────────────────────────────
export const myVehicles = [
  { id: 'V01', brand: 'Toyota', model: 'Avanza', year: 2020, plate: 'B 1234 ABC', color: 'Silver', lastService: '2025-05-10', nextService: '2025-11-10', km: 48500, type: 'mobil' },
  { id: 'V02', brand: 'Honda', model: 'Beat', year: 2022, plate: 'D 5678 XYZ', color: 'Merah', lastService: '2025-03-20', nextService: '2025-09-20', km: 15200, type: 'motor' },
  { id: 'V03', brand: 'Suzuki', model: 'Ertiga', year: 2019, plate: 'F 9012 PQR', color: 'Putih', lastService: '2025-02-14', nextService: '2025-08-14', km: 72300, type: 'mobil' },
]

// ─── BOOKING ─────────────────────────────────────────────────
export const availableTimeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

// ─── TRACKING AKTIF ──────────────────────────────────────────
export const activeTracking = {
  orderId: '#ORD-LIVE001', vehicle: 'Toyota Avanza — B 1234 ABC',
  service: 'Service Berkala + Tune Up', mechanic: 'Ahmad Supriyadi',
  estimatedFinish: '14:30', currentStep: 2,
  steps: [
    { id: 0, label: 'Booking Diterima', time: '08:15', done: true, note: 'Booking dikonfirmasi oleh resepsionis.' },
    { id: 1, label: 'Kendaraan Masuk Bay', time: '09:00', done: true, note: 'Kendaraan sudah ada di bay no. 3.' },
    { id: 2, label: 'Sedang Dikerjakan', time: '09:10', done: true, note: 'Ahmad sedang mengerjakan service berkala.', active: true },
    { id: 3, label: 'Menunggu Sparepart', time: '—', done: false, note: '' },
    { id: 4, label: 'Quality Check', time: '—', done: false, note: '' },
    { id: 5, label: 'Selesai & Siap Ambil', time: '—', done: false, note: '' },
  ],
}

// ─── CRM NOTIFICATIONS ───────────────────────────────────────
export const crmNotifications = [
  { id: 'N01', type: 'reminder', icon: '🔔', title: 'Reminder Service Berkala', desc: 'Toyota Avanza Anda sudah 6 bulan sejak service terakhir. Jadwalkan sekarang!', time: '2 jam lalu', action: 'Booking Sekarang', actionPath: '/member/booking', priority: 'high' },
  { id: 'N02', type: 'promo', icon: '🎁', title: 'Voucher Ulang Tahun Menanti!', desc: 'Selamat ulang tahun! Klaim voucher diskon 20% khusus untuk Anda.', time: '1 hari lalu', action: 'Klaim Voucher', actionPath: '/member/voucher', priority: 'high' },
  { id: 'N03', type: 'point', icon: '⭐', title: 'Point Loyalty Bertambah', desc: 'Anda mendapat 450 poin dari service terakhir. Total poin: 3.250.', time: '5 hari lalu', action: 'Lihat Point', actionPath: '/member/loyalty', priority: 'medium' },
  { id: 'N04', type: 'reminder', icon: '📋', title: 'Reminder STNK Kendaraan', desc: 'STNK Toyota Avanza (B 1234 ABC) akan habis masa berlakunya 30 hari lagi.', time: '1 minggu lalu', action: 'Lihat Detail', actionPath: '/member/dashboard', priority: 'medium' },
  { id: 'N05', type: 'followup', icon: '💬', title: 'Terima Kasih Sudah Servis!', desc: 'Bagaimana kondisi kendaraan Anda setelah service kemarin? Beri rating mekanik kami.', time: '2 minggu lalu', action: 'Beri Rating', actionPath: '/member/riwayat', priority: 'low' },
  { id: 'N06', type: 'promo', icon: '🏷️', title: 'Promo Spesial Akhir Bulan', desc: 'Diskon 30% untuk Service Berkala. Berlaku hingga akhir bulan ini!', time: '3 minggu lalu', action: 'Lihat Promo', actionPath: '/guest/promo', priority: 'low' },
]

// ─── TESTIMONI ───────────────────────────────────────────────
export const testimonials = [
  { id: 1, name: 'Budi Santoso', vehicle: 'Toyota Avanza', rating: 5, text: 'Servis cepat dan transparan. Mekaniknya profesional, hasil diagnosa akurat. Sudah langganan 3 tahun dan tidak kecewa!', tier: 'Gold', date: 'Mei 2025' },
  { id: 2, name: 'Siti Rahayu', vehicle: 'Honda Jazz', rating: 5, text: 'Booking online sangat mudah, estimasi waktu tepat. Fasilitas ruang tunggu nyaman. Esther Garage memang beda!', tier: 'Platinum', date: 'April 2025' },
  { id: 3, name: 'Agus Purnomo', vehicle: 'Suzuki Ertiga', rating: 4, text: 'Harga transparan, tidak ada biaya tersembunyi. Program loyalitas poinnya membantu hemat biaya servis.', tier: 'Silver', date: 'Maret 2025' },
  { id: 4, name: 'Dewi Anggraini', vehicle: 'Yamaha NMAX', rating: 5, text: 'Service AC cepat selesai dalam 2 jam. Sistem tracking real-time sangat membantu, bisa pantau dari kantor!', tier: 'Gold', date: 'Maret 2025' },
  { id: 5, name: 'Riko Firmansyah', vehicle: 'Mitsubishi Xpander', rating: 5, text: 'WhatsApp reminder service sangat berguna. Mekanik handal, kendaraan seperti baru setelah tune up.', tier: 'Platinum', date: 'Februari 2025' },
]

// ─── CUSTOMER JOURNEY ────────────────────────────────────────
export const customerJourney = [
  { step: 1, label: 'Daftar Member', desc: 'Buat akun gratis dan dapatkan voucher welcome 15%', icon: '👤', color: 'blue' },
  { step: 2, label: 'Booking Service', desc: 'Pilih layanan, tanggal, dan jam servis secara online', icon: '📅', color: 'indigo' },
  { step: 3, label: 'Servis Dikerjakan', desc: 'Pantau progress real-time via tracking status', icon: '🔧', color: 'violet' },
  { step: 4, label: 'Terima Voucher', desc: 'Voucher diskon otomatis terkirim setelah servis', icon: '🎁', color: 'purple' },
  { step: 5, label: 'Kumpulkan Point', desc: 'Setiap servis menghasilkan poin loyalitas', icon: '⭐', color: 'amber' },
  { step: 6, label: 'Dapat Reminder', desc: 'Pengingat otomatis via WhatsApp & email', icon: '🔔', color: 'orange' },
  { step: 7, label: 'Jadi Loyal Customer', desc: 'Nikmati reward eksklusif dan prioritas servis', icon: '👑', color: 'green' },
]