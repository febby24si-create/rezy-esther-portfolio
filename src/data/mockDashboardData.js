// ============================================================
// mockDashboardData.js
// Comprehensive mock data for CRM Command Center Dashboard
// Esther Garage — Automotive Workshop CRM
// ============================================================

// ─── KPI Overview ─────────────────────────────────────────────
export const kpiData = [
  {
    id: 'total_members',
    label: 'Total Members',
    value: 1248,
    icon: '👥',
    trend: 12.5,
    positive: true,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    sparkline: [42, 58, 45, 72, 68, 84, 96, 88, 102, 110, 118, 124],
  },
  {
    id: 'active_members',
    label: 'Active Members',
    value: 892,
    icon: '✅',
    trend: 8.3,
    positive: true,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    sparkline: [65, 72, 70, 78, 82, 80, 88, 85, 90, 92, 89, 92],
  },
  {
    id: 'new_members',
    label: 'New This Month',
    value: 48,
    icon: '🌟',
    trend: 14.2,
    positive: true,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    sparkline: [12, 18, 15, 22, 20, 28, 25, 32, 30, 38, 42, 48],
  },
  {
    id: 'total_bookings',
    label: 'Total Bookings',
    value: 342,
    icon: '📅',
    trend: -3.1,
    positive: false,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    sparkline: [28, 32, 30, 35, 33, 38, 36, 34, 40, 38, 35, 32],
  },
  {
    id: 'completed_services',
    label: 'Completed Services',
    value: 286,
    icon: '✅',
    trend: 6.8,
    positive: true,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.12)',
    sparkline: [20, 24, 22, 28, 26, 30, 28, 32, 30, 34, 36, 38],
  },
  {
    id: 'vehicles_registered',
    label: 'Vehicles Registered',
    value: 756,
    icon: '🚗',
    trend: 4.5,
    positive: true,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    sparkline: [50, 55, 52, 58, 60, 62, 65, 68, 70, 72, 74, 76],
  },
  {
    id: 'monthly_revenue',
    label: 'Monthly Revenue',
    value: 286500000,
    icon: '💰',
    trend: 9.2,
    positive: true,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    prefix: 'Rp',
    format: (v) => `Rp ${(v / 1000000).toFixed(1)}jt`,
    sparkline: [185, 210, 195, 230, 245, 220, 260, 250, 275, 268, 280, 286],
  },
  {
    id: 'total_revenue',
    label: 'Total Revenue',
    value: 3420000000,
    icon: '💎',
    trend: 18.6,
    positive: true,
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.12)',
    prefix: 'Rp',
    format: (v) => `Rp ${(v / 1000000).toFixed(0)}jt`,
    sparkline: [210, 240, 235, 260, 255, 280, 275, 290, 310, 320, 335, 342],
  },
  {
    id: 'pending_payments',
    label: 'Pending Payments',
    value: 23,
    icon: '⏳',
    trend: -12.8,
    positive: true,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    sparkline: [35, 32, 30, 28, 25, 22, 24, 20, 18, 22, 20, 23],
  },
  {
    id: 'active_promotions',
    label: 'Active Promotions',
    value: 6,
    icon: '🎯',
    trend: 20.0,
    positive: true,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.12)',
    sparkline: [2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6],
  },
  {
    id: 'loyalty_members',
    label: 'Loyalty Members',
    value: 643,
    icon: '⭐',
    trend: 15.4,
    positive: true,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.12)',
    sparkline: [38, 42, 40, 48, 45, 52, 50, 55, 58, 60, 62, 64],
  },
  {
    id: 'satisfaction',
    label: 'Satisfaction',
    value: 96,
    icon: '😊',
    trend: 2.1,
    positive: true,
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.12)',
    suffix: '%',
    sparkline: [88, 90, 89, 91, 92, 93, 92, 94, 95, 95, 96, 96],
  },
]

// ─── Monthly Revenue (12 months) ──────────────────────────────
export const monthlyRevenue = [
  { month: 'Jan', revenue: 185000000, bookings: 28, target: 200000000 },
  { month: 'Feb', revenue: 210000000, bookings: 32, target: 200000000 },
  { month: 'Mar', revenue: 195000000, bookings: 30, target: 220000000 },
  { month: 'Apr', revenue: 230000000, bookings: 35, target: 220000000 },
  { month: 'May', revenue: 245000000, bookings: 33, target: 240000000 },
  { month: 'Jun', revenue: 220000000, bookings: 38, target: 240000000 },
  { month: 'Jul', revenue: 260000000, bookings: 36, target: 250000000 },
  { month: 'Aug', revenue: 250000000, bookings: 34, target: 250000000 },
  { month: 'Sep', revenue: 275000000, bookings: 40, target: 260000000 },
  { month: 'Oct', revenue: 268000000, bookings: 38, target: 260000000 },
  { month: 'Nov', revenue: 280000000, bookings: 35, target: 270000000 },
  { month: 'Dec', revenue: 286500000, bookings: 32, target: 280000000 },
]

// ─── Service Categories ───────────────────────────────────────
export const serviceCategories = [
  { name: 'Oil Change', value: 85, color: '#3B82F6' },
  { name: 'Engine Tune Up', value: 62, color: '#10B981' },
  { name: 'AC Service', value: 45, color: '#F59E0B' },
  { name: 'Brake Repair', value: 38, color: '#EF4444' },
  { name: 'Tire Rotation', value: 30, color: '#8B5CF6' },
  { name: 'Body Paint', value: 18, color: '#EC4899' },
  { name: 'Others', value: 28, color: '#6B7280' },
]

// ─── Revenue vs Expenses ──────────────────────────────────────
export const revenueExpenses = [
  { month: 'Jan', revenue: 185, expenses: 120, profit: 65 },
  { month: 'Feb', revenue: 210, expenses: 135, profit: 75 },
  { month: 'Mar', revenue: 195, expenses: 128, profit: 67 },
  { month: 'Apr', revenue: 230, expenses: 142, profit: 88 },
  { month: 'May', revenue: 245, expenses: 150, profit: 95 },
  { month: 'Jun', revenue: 220, expenses: 140, profit: 80 },
  { month: 'Jul', revenue: 260, expenses: 155, profit: 105 },
  { month: 'Aug', revenue: 250, expenses: 148, profit: 102 },
  { month: 'Sep', revenue: 275, expenses: 162, profit: 113 },
  { month: 'Oct', revenue: 268, expenses: 158, profit: 110 },
  { month: 'Nov', revenue: 280, expenses: 165, profit: 115 },
  { month: 'Dec', revenue: 286, expenses: 170, profit: 116 },
]

// ─── Top Selling Services ─────────────────────────────────────
export const topServices = [
  { name: 'Ganti Oli Mesin', count: 128, revenue: 38400000, growth: 12 },
  { name: 'Tune Up Mesin', count: 96, revenue: 67200000, growth: 8 },
  { name: 'Service AC', count: 78, revenue: 39000000, growth: -2 },
  { name: 'Ganti Kampas Rem', count: 65, revenue: 26000000, growth: 15 },
  { name: 'Rotasi Ban', count: 52, revenue: 13000000, growth: 5 },
]

// ─── Customer Growth ─────────────────────────────────────────
export const customerGrowth = [
  { month: 'Jan', total: 920, new: 38 },
  { month: 'Feb', total: 955, new: 35 },
  { month: 'Mar', total: 988, new: 33 },
  { month: 'Apr', total: 1025, new: 37 },
  { month: 'May', total: 1062, new: 37 },
  { month: 'Jun', total: 1098, new: 36 },
  { month: 'Jul', total: 1140, new: 42 },
  { month: 'Aug', total: 1175, new: 35 },
  { month: 'Sep', total: 1212, new: 37 },
  { month: 'Oct', total: 1248, new: 36 },
  { month: 'Nov', total: 1288, new: 40 },
  { month: 'Dec', total: 1324, new: 36 },
]

// ─── Daily Booking Activity (last 14 days) ───────────────────
export const dailyBookings = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (13 - i))
  return {
    date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    bookings: Math.floor(Math.random() * 12) + 3,
    completed: Math.floor(Math.random() * 10) + 2,
  }
})

// ─── Recent Members ──────────────────────────────────────────
export const recentMembers = [
  { id: 'C001', name: 'Andi Pratama', vehicle: 'Toyota Avanza', phone: '0812-3456-7890', tier: 'Gold', lastVisit: '2024-12-20', status: 'active', avatar: null },
  { id: 'C002', name: 'Siti Rahmawati', vehicle: 'Honda Civic', phone: '0856-7890-1234', tier: 'Platinum', lastVisit: '2024-12-19', status: 'active', avatar: null },
  { id: 'C003', name: 'Budi Santoso', vehicle: 'Mitsubishi Xpander', phone: '0813-4567-8901', tier: 'Silver', lastVisit: '2024-12-18', status: 'active', avatar: null },
  { id: 'C004', name: 'Dewi Lestari', vehicle: 'Daihatsu Sigra', phone: '0878-9012-3456', tier: 'Bronze', lastVisit: '2024-12-17', status: 'active', avatar: null },
  { id: 'C005', name: 'Ahmad Fauzi', vehicle: 'Toyota Fortuner', phone: '0821-2345-6789', tier: 'Gold', lastVisit: '2024-12-16', status: 'active', avatar: null },
  { id: 'C006', name: 'Rina Marlina', vehicle: 'Honda HR-V', phone: '0857-8901-2345', tier: 'Platinum', lastVisit: '2024-12-15', status: 'active', avatar: null },
  { id: 'C007', name: 'Denny Kurniawan', vehicle: 'Suzuki Ertiga', phone: '0811-2233-4455', tier: 'Silver', lastVisit: '2024-12-14', status: 'active', avatar: null },
  { id: 'C008', name: 'Fitri Handayani', vehicle: 'Toyota Camry', phone: '0899-8877-6655', tier: 'Gold', lastVisit: '2024-12-13', status: 'active', avatar: null },
]

// ─── Top Customers ───────────────────────────────────────────
export const topCustomers = [
  { name: 'Siti Rahmawati', spent: 28500000, orders: 24, tier: 'Platinum', ltv: 42500000, since: '2022-03' },
  { name: 'Rina Marlina', spent: 22100000, orders: 18, tier: 'Platinum', ltv: 33800000, since: '2022-06' },
  { name: 'Andi Pratama', spent: 18500000, orders: 15, tier: 'Gold', ltv: 26500000, since: '2021-11' },
  { name: 'Ahmad Fauzi', spent: 16800000, orders: 12, tier: 'Gold', ltv: 22000000, since: '2023-01' },
  { name: 'Fitri Handayani', spent: 14200000, orders: 10, tier: 'Gold', ltv: 18500000, since: '2023-04' },
]

// ─── Customer Activity Feed ─────────────────────────────────
export const activityFeed = [
  { id: 1, type: 'register', icon: '🎉', text: 'New member registered', name: 'Rizky Pratama', time: '2 min ago' },
  { id: 2, type: 'booking', icon: '📅', text: 'Booking confirmed', name: 'Toyota Avanza - B 1234 CD', time: '15 min ago' },
  { id: 3, type: 'service', icon: '✅', text: 'Service completed', name: 'Honda Civic - oil change', time: '45 min ago' },
  { id: 4, type: 'voucher', icon: '🎫', text: 'Voucher redeemed', name: 'Diskon 15% Service', time: '1 hour ago' },
  { id: 5, type: 'points', icon: '⭐', text: 'Loyalty points earned', name: '+150 points — Siti R.', time: '2 hours ago' },
  { id: 6, type: 'register', icon: '🎉', text: 'New member registered', name: 'Dimas Ardiansyah', time: '3 hours ago' },
  { id: 7, type: 'booking', icon: '📅', text: 'Booking rescheduled', name: 'Mitsubishi Xpander', time: '4 hours ago' },
  { id: 8, type: 'service', icon: '✅', text: 'Service completed', name: 'Daihatsu Sigra - AC service', time: '5 hours ago' },
]

// ─── Mechanic Status ─────────────────────────────────────────
export const mechanicStatus = [
  { name: 'Andi Saputra', status: 'available', specialty: 'Engine Specialist', jobsToday: 3, rating: 4.9, image: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Rina Wati', status: 'busy', specialty: 'Diagnostic Expert', jobsToday: 5, rating: 4.8, image: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Dedi Kurniawan', status: 'busy', specialty: 'Body & Paint', jobsToday: 4, rating: 4.7, image: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Siti Rahma', status: 'available', specialty: 'Service Advisor', jobsToday: 2, rating: 4.9, image: 'https://i.pravatar.cc/150?img=10' },
  { name: 'Hendra Gunawan', status: 'leave', specialty: 'Transmission', jobsToday: 0, rating: 4.6, image: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Maya Sari', status: 'available', specialty: 'AC Specialist', jobsToday: 1, rating: 4.8, image: 'https://i.pravatar.cc/150?img=9' },
]

// ─── Today's Schedule ─────────────────────────────────────────
export const todaySchedule = [
  { time: '08:00', customer: 'Budi Santoso', service: 'Ganti Oli', vehicle: 'Mitsubishi Xpander', mechanic: 'Andi Saputra', status: 'completed' },
  { time: '09:00', customer: 'Dewi Lestari', service: 'Service AC', vehicle: 'Daihatsu Sigra', mechanic: 'Maya Sari', status: 'completed' },
  { time: '10:00', customer: 'Ahmad Fauzi', service: 'Tune Up', vehicle: 'Toyota Fortuner', mechanic: 'Rina Wati', status: 'in-progress' },
  { time: '11:00', customer: 'Rina Marlina', service: 'Ganti Rem', vehicle: 'Honda HR-V', mechanic: 'Dedi Kurniawan', status: 'in-progress' },
  { time: '13:00', customer: 'Fitri Handayani', service: 'Rotasi Ban', vehicle: 'Toyota Camry', mechanic: 'Andi Saputra', status: 'scheduled' },
  { time: '14:00', customer: 'Denny K', service: 'Service AC', vehicle: 'Suzuki Ertiga', mechanic: 'Maya Sari', status: 'scheduled' },
]

// ─── Current Queue ───────────────────────────────────────────
export const currentQueue = [
  { position: 1, customer: 'Ahmad Fauzi', service: 'Tune Up Mesin', waitTime: '45 min', vehicle: 'Toyota Fortuner', priority: 'high' },
  { position: 2, customer: 'Rina Marlina', service: 'Ganti Kampas Rem', waitTime: '1h 15min', vehicle: 'Honda HR-V', priority: 'normal' },
  { position: 3, customer: 'Fitri Handayani', service: 'Rotasi Ban', waitTime: '2h', vehicle: 'Toyota Camry', priority: 'normal' },
  { position: 4, customer: 'Denny K', service: 'Service AC', waitTime: '3h', vehicle: 'Suzuki Ertiga', priority: 'low' },
  { position: 5, customer: 'Mega Suri', service: 'Ganti Oli', waitTime: '3h 30min', vehicle: 'Honda Brio', priority: 'normal' },
  { position: 6, customer: 'Irfan Hakim', service: 'Tune Up', waitTime: '4h', vehicle: 'Toyota Innova', priority: 'high' },
]

// ─── Vehicle Progress ────────────────────────────────────────
export const vehicleProgress = [
  { plate: 'B 1234 CD', customer: 'Ahmad Fauzi', service: 'Tune Up Mesin', stage: 'repair', progress: 65, mechanic: 'Rina Wati' },
  { plate: 'B 5678 EF', customer: 'Rina Marlina', service: 'Ganti Kampas Rem', stage: 'repair', progress: 40, mechanic: 'Dedi Kurniawan' },
  { plate: 'B 9012 GH', customer: 'Budi Santoso', service: 'Ganti Oli', stage: 'qc', progress: 95, mechanic: 'Andi Saputra' },
  { plate: 'B 3456 IJ', customer: 'Dewi Lestari', service: 'Service AC', stage: 'done', progress: 100, mechanic: 'Maya Sari' },
]

// ─── Pending Approvals ───────────────────────────────────────
export const pendingApprovals = [
  { id: 'APV-001', type: 'claim', title: 'Klaim Garansi Mesin', customer: 'Hendra Gunawan', amount: 2500000, date: '2024-12-20', urgent: true },
  { id: 'APV-002', type: 'estimate', title: 'Estimasi Biaya Body Repair', customer: 'Sari Dewi', amount: 8500000, date: '2024-12-20', urgent: false },
  { id: 'APV-003', type: 'refund', title: 'Refund Deposit Booking', customer: 'Tono Wijaya', amount: 500000, date: '2024-12-19', urgent: false },
  { id: 'APV-004', type: 'purchase', title: 'Pembelian Spare Part', customer: '-', amount: 3200000, date: '2024-12-19', urgent: true },
  { id: 'APV-005', type: 'discount', title: 'Diskon Khusus Member', customer: 'Rina Marlina', amount: 350000, date: '2024-12-18', urgent: false },
]

// ─── Business Performance ────────────────────────────────────
export const businessPerformance = {
  revenueToday: 8650000,
  revenueWeek: 58200000,
  revenueMonth: 286500000,
  revenueYear: 3420000000,
  avgServiceCost: 385000,
  avgBookingValue: 425000,
  conversionRate: 78.5,
  repeatCustomerRate: 62.3,
  cancellationRate: 4.2,
  customerSatisfaction: 96.8,
}

// ─── Inventory Summary ───────────────────────────────────────
export const inventorySummary = {
  totalItems: 245,
  totalValue: 186500000,
  lowStock: [
    { name: 'Oli Mesin 5W-30', sku: 'OLI-001', stock: 3, minStock: 10, unit: 'liter' },
    { name: 'Filter Oli Toyota', sku: 'FIL-001', stock: 2, minStock: 8, unit: 'pcs' },
    { name: 'Kampas Rem Depan', sku: 'REM-001', stock: 4, minStock: 6, unit: 'set' },
    { name: 'Busi Iridium', sku: 'BUS-001', stock: 5, minStock: 12, unit: 'pcs' },
    { name: 'Filter AC', sku: 'FIL-002', stock: 1, minStock: 5, unit: 'pcs' },
  ],
  recentlyAdded: [
    { name: 'Oli Mesin 10W-40', date: '2024-12-19', qty: 24 },
    { name: 'Coolant Toyota', date: '2024-12-18', qty: 12 },
    { name: 'Lampu LED H7', date: '2024-12-17', qty: 20 },
    { name: 'Wiper Blade 24\"', date: '2024-12-16', qty: 30 },
  ],
  mostUsed: [
    { name: 'Oli Mesin 5W-30', used: 128 },
    { name: 'Filter Oli', used: 96 },
    { name: 'Busi Standar', used: 78 },
    { name: 'Kampas Rem', used: 65 },
  ],
}

// ─── Promotions & CRM ────────────────────────────────────────
export const promotions = {
  active: [
    { name: 'Diskon 15% Service Akhir Tahun', code: 'TAHUNBARU15', discount: 15, used: 42, quota: 100, validUntil: '2024-12-31', type: 'seasonal' },
    { name: 'Voucher Welcome Member', code: 'WELCOME20', discount: 20, used: 78, quota: 200, validUntil: '2025-01-31', type: 'member' },
    { name: 'Gratis Service AC', code: 'ACFREE', discount: 100, used: 15, quota: 30, validUntil: '2024-12-25', type: 'promo' },
    { name: 'Diskon Kopi + Service', code: 'COFFEE10', discount: 10, used: 33, quota: 50, validUntil: '2024-12-30', type: 'partnership' },
    { name: 'Voucher Ulang Tahun', code: 'BDAY2024', discount: 25, used: 12, quota: 20, validUntil: '2024-12-31', type: 'birthday' },
    { name: 'Diskon Ban Michelin', code: 'TIRE20', discount: 20, used: 8, quota: 25, validUntil: '2025-01-15', type: 'brand' },
  ],
  expired: [
    { name: 'Promo Ganti Oli Gratis', code: 'OLIGRATIS', discount: 100, used: 45, quota: 50, validUntil: '2024-11-30' },
    { name: 'Diskon 10% November', code: 'NOV10', discount: 10, used: 88, quota: 100, validUntil: '2024-11-30' },
    { name: 'Voucher Black Friday', code: 'BF2024', discount: 30, used: 22, quota: 30, validUntil: '2024-11-29' },
  ],
  voucherUsage: [
    { month: 'Jul', issued: 45, redeemed: 32 },
    { month: 'Aug', issued: 52, redeemed: 38 },
    { month: 'Sep', issued: 48, redeemed: 35 },
    { month: 'Oct', issued: 55, redeemed: 40 },
    { month: 'Nov', issued: 62, redeemed: 45 },
    { month: 'Dec', issued: 48, redeemed: 42 },
  ],
  loyaltyRedemption: [
    { month: 'Jul', redeemed: 18 },
    { month: 'Aug', redeemed: 22 },
    { month: 'Sep', redeemed: 25 },
    { month: 'Oct', redeemed: 20 },
    { month: 'Nov', redeemed: 28 },
    { month: 'Dec', redeemed: 32 },
  ],
  upcomingBirthdays: [
    { name: 'Andi Pratama', date: '2024-12-25', tier: 'Gold', points: 1850 },
    { name: 'Siti Rahmawati', date: '2024-12-28', tier: 'Platinum', points: 3200 },
    { name: 'Budi Santoso', date: '2025-01-02', tier: 'Silver', points: 850 },
    { name: 'Rina Marlina', date: '2025-01-05', tier: 'Platinum', points: 2800 },
  ],
}

// ─── Notifications ──────────────────────────────────────────
export const notifications = [
  { id: 'N1', type: 'booking', icon: '📅', title: 'Booking Baru', message: 'Toyota Avanza — Ganti Oli, pukul 10:00', time: '2 min ago', unread: true, color: '#3B82F6' },
  { id: 'N2', type: 'member', icon: '🎉', title: 'Member Baru', message: 'Rizky Pratama mendaftar membership', time: '5 min ago', unread: true, color: '#10B981' },
  { id: 'N3', type: 'inventory', icon: '📦', title: 'Stok Menipis', message: 'Oli Mesin 5W-30 tersisa 3 liter', time: '15 min ago', unread: true, color: '#F59E0B' },
  { id: 'N4', type: 'service', icon: '✅', title: 'Servis Selesai', message: 'Honda Civic — Service AC selesai', time: '30 min ago', unread: false, color: '#22C55E' },
  { id: 'N5', type: 'feedback', icon: '💬', title: 'Feedback Customer', message: '⭐ 5/5 — Andi P: \"Pelayanan cepat & ramah!\"', time: '1 hour ago', unread: false, color: '#8B5CF6' },
  { id: 'N6', type: 'payment', icon: '💳', title: 'Pembayaran Masuk', message: 'Ahmad Fauzi — Rp 450.000 (Tune Up)', time: '1 hour ago', unread: false, color: '#06B6D4' },
  { id: 'N7', type: 'reminder', icon: '⏰', title: 'Reminder Servis', message: '3 kendaraan perlu servis besok', time: '2 hours ago', unread: false, color: '#F97316' },
  { id: 'N8', type: 'voucher', icon: '🎫', title: 'Voucher Digunakan', message: 'Diskon 15% — Siti R. (Rp 67.500 off)', time: '3 hours ago', unread: false, color: '#EC4899' },
]

// ─── Calendar Events (Current Month) ─────────────────────────
export const calendarEvents = [
  { date: '2024-12-20', events: [
    { title: 'Servis Toyota Avanza', time: '08:00 - 10:00', type: 'service' },
    { title: 'Meeting Tim Mekanik', time: '13:00 - 14:00', type: 'meeting' },
  ]},
  { date: '2024-12-21', events: [
    { title: 'Servis Honda Civic', time: '09:00 - 11:00', type: 'service' },
    { title: 'Stock Opname', time: '15:00 - 17:00', type: 'inventory' },
  ]},
  { date: '2024-12-22', events: [
    { title: 'Servis Mitsubishi Xpander', time: '08:00 - 09:30', type: 'service' },
    { title: 'Evaluasi Bulanan', time: '14:00 - 15:30', type: 'meeting' },
  ]},
  { date: '2024-12-23', events: [
    { title: 'Servis Toyota Fortuner', time: '10:00 - 12:00', type: 'service' },
  ]},
  { date: '2024-12-24', events: [
    { title: 'Servis Honda HR-V', time: '08:00 - 10:00', type: 'service' },
    { title: 'Servis Daihatsu Sigra', time: '11:00 - 12:00', type: 'service' },
    { title: 'Review Performance', time: '15:00 - 16:00', type: 'meeting' },
  ]},
]

// ─── System Health ───────────────────────────────────────────
export const systemHealth = {
  status: 'operational',
  uptime: '99.97%',
  lastBackup: '2024-12-20 03:00 AM',
  activeUsers: 3,
  apiLatency: '45ms',
  storageUsed: '2.4 GB / 10 GB',
  services: [
    { name: 'Supabase Database', status: 'operational', latency: '12ms' },
    { name: 'Authentication', status: 'operational', latency: '8ms' },
    { name: 'API Gateway', status: 'operational', latency: '45ms' },
    { name: 'Storage', status: 'operational', latency: '22ms' },
    { name: 'Email Service', status: 'degraded', latency: '320ms' },
  ],
  recentLogs: [
    { time: '10:23:45', level: 'info', message: 'User login: admin@esthergarage.com' },
    { time: '10:15:22', level: 'info', message: 'New booking created: #BK-20241220-004' },
    { time: '09:58:11', level: 'warn', message: 'Low stock alert: Oli Mesin 5W-30 (3 left)' },
    { time: '09:30:05', level: 'info', message: 'Service completed: #ORD-A1B2C3D4' },
    { time: '09:12:33', level: 'error', message: 'Email delivery failed: timeout' },
    { time: '08:45:00', level: 'info', message: 'Backup completed successfully' },
    { time: '08:00:12', level: 'info', message: 'System started - all services OK' },
  ],
}

// ─── Revenue by Service (monthly, for stacked bar) ───────────
export const revenueByService = [
  { month: 'Jan', oil: 42, tuneup: 38, ac: 25, brake: 20, tire: 15, body: 8, other: 12 },
  { month: 'Feb', oil: 48, tuneup: 42, ac: 28, brake: 22, tire: 18, body: 10, other: 14 },
  { month: 'Mar', oil: 45, tuneup: 40, ac: 26, brake: 21, tire: 16, body: 9, other: 13 },
  { month: 'Apr', oil: 52, tuneup: 45, ac: 30, brake: 24, tire: 20, body: 12, other: 15 },
  { month: 'May', oil: 56, tuneup: 48, ac: 32, brake: 26, tire: 22, body: 14, other: 16 },
  { month: 'Jun', oil: 50, tuneup: 44, ac: 29, brake: 23, tire: 19, body: 11, other: 14 },
  { month: 'Jul', oil: 58, tuneup: 50, ac: 34, brake: 28, tire: 24, body: 15, other: 18 },
  { month: 'Aug', oil: 55, tuneup: 48, ac: 32, brake: 26, tire: 22, body: 13, other: 16 },
  { month: 'Sep', oil: 62, tuneup: 52, ac: 36, brake: 30, tire: 25, body: 16, other: 20 },
  { month: 'Oct', oil: 60, tuneup: 50, ac: 35, brake: 28, tire: 24, body: 15, other: 18 },
  { month: 'Nov', oil: 64, tuneup: 54, ac: 38, brake: 32, tire: 26, body: 18, other: 22 },
  { month: 'Dec', oil: 65, tuneup: 55, ac: 40, brake: 33, tire: 28, body: 20, other: 24 },
]

// ─── Mechanic Performance (monthly jobs per mechanic) ────────
export const mechanicPerformance = [
  { name: 'Andi S.', jobs: 42, revenue: 16800000, rating: 4.9, jobsChange: 8 },
  { name: 'Rina W.', jobs: 38, revenue: 15200000, rating: 4.8, jobsChange: 5 },
  { name: 'Dedi K.', jobs: 35, revenue: 14000000, rating: 4.7, jobsChange: -2 },
  { name: 'Maya S.', jobs: 28, revenue: 11200000, rating: 4.8, jobsChange: 12 },
  { name: 'Siti R.', jobs: 25, revenue: 10000000, rating: 4.9, jobsChange: 4 },
  { name: 'Hendra G.', jobs: 18, revenue: 7200000, rating: 4.6, jobsChange: -5 },
]
