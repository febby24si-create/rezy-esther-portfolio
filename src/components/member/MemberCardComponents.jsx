// ============================================================
// MemberCardComponents.jsx
// Shared components untuk kartu member digital.
// Di-reuse oleh:
//   - /member/kartu  (KartuMember.jsx)
//   - /           (LandingPage.jsx — preview section Membership)
// ============================================================

// ─── Card Theme Config ──────────────────────────────────────
// Urutan tier: Platinum (display VIP) → Gold → Silver → Bronze
export const CARD_THEME = {
  Platinum: {
    label:      'VIP',
    sublabel:   '贵宾卡',
    tierLabel:  'VIP',
    gradient:   'linear-gradient(135deg, #0a0a0a 0%, #1a1400 35%, #2d1f00 65%, #0a0a0a 100%)',
    shimmer:    'linear-gradient(105deg, transparent 30%, rgba(212,175,55,0.18) 50%, transparent 70%)',
    accent:     '#D4AF37',
    accentLight:'#F5D76E',
    accentGlow: 'rgba(212,175,55,0.35)',
    textColor:  '#F5D76E',
    border:     '1.5px solid rgba(212,175,55,0.55)',
    badgeBg:    'rgba(212,175,55,0.12)',
    icon:       '👑',
    chipColor:  '#C9A84C',
    pattern:    'vip',
    backBg:     'linear-gradient(135deg, #0f0d00 0%, #1a1600 60%, #0a0a00 100%)',
    stripColor: '#C9A84C',
    benefits:   ['Diskon 15% setiap servis', 'Layanan antar-jemput kendaraan', 'Voucher eksklusif VIP', 'Dedicated service advisor', 'Prioritas booking & antrian'],
    desc:       'Pengalaman premium tertinggi dengan semua keistimewaan eksklusif Esther Garage.',
    minPoin:    '≥ 3.000 poin',
  },
  Gold: {
    label:      'Gold',
    sublabel:   '黄金卡',
    tierLabel:  'Gold',
    gradient:   'linear-gradient(135deg, #1a1200 0%, #2d2000 40%, #3d2d00 65%, #1a1200 100%)',
    shimmer:    'linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.18) 50%, transparent 70%)',
    accent:     '#FBBF24',
    accentLight:'#FDE68A',
    accentGlow: 'rgba(251,191,36,0.30)',
    textColor:  '#FDE68A',
    border:     '1.5px solid rgba(251,191,36,0.45)',
    badgeBg:    'rgba(251,191,36,0.10)',
    icon:       '🥇',
    chipColor:  '#FBBF24',
    pattern:    'gold',
    backBg:     'linear-gradient(135deg, #120e00 0%, #1e1800 60%, #120e00 100%)',
    stripColor: '#FBBF24',
    benefits:   ['Diskon 10% setiap servis', 'Prioritas booking jadwal', 'Early access promo spesial', 'Voucher bulanan eksklusif', 'Prioritas antrian servis'],
    desc:       'Nikmati diskon lebih besar dan akses fitur eksklusif member Gold.',
    minPoin:    '≥ 1.500 poin',
  },
  Silver: {
    label:      'Silver',
    sublabel:   '白银卡',
    tierLabel:  'Silver',
    gradient:   'linear-gradient(135deg, #0d1117 0%, #161c24 40%, #1e2634 65%, #0d1117 100%)',
    shimmer:    'linear-gradient(105deg, transparent 30%, rgba(148,163,184,0.18) 50%, transparent 70%)',
    accent:     '#94A3B8',
    accentLight:'#CBD5E1',
    accentGlow: 'rgba(148,163,184,0.25)',
    textColor:  '#CBD5E1',
    border:     '1.5px solid rgba(148,163,184,0.40)',
    badgeBg:    'rgba(148,163,184,0.08)',
    icon:       '🥈',
    chipColor:  '#94A3B8',
    pattern:    'silver',
    backBg:     'linear-gradient(135deg, #0a0d12 0%, #111820 60%, #0a0d12 100%)',
    stripColor: '#94A3B8',
    benefits:   ['Diskon 5% setiap servis', 'Voucher bulanan eksklusif', 'Prioritas antrian servis', 'Booking online 24/7', 'Notifikasi jadwal service'],
    desc:       'Akses fitur member dengan bonus voucher dan prioritas antrian.',
    minPoin:    '≥ 500 poin',
  },
  Bronze: {
    label:      'Member',
    sublabel:   '会员卡',
    tierLabel:  'Bronze',
    gradient:   'linear-gradient(135deg, #0f0a06 0%, #1a1008 40%, #261808 65%, #0f0a06 100%)',
    shimmer:    'linear-gradient(105deg, transparent 30%, rgba(180,120,60,0.15) 50%, transparent 70%)',
    accent:     '#C97D3A',
    accentLight:'#E09A5A',
    accentGlow: 'rgba(201,125,58,0.25)',
    textColor:  '#E09A5A',
    border:     '1.5px solid rgba(201,125,58,0.38)',
    badgeBg:    'rgba(201,125,58,0.08)',
    icon:       '🥉',
    chipColor:  '#C97D3A',
    pattern:    'bronze',
    backBg:     'linear-gradient(135deg, #0a0704 0%, #140c05 60%, #0a0704 100%)',
    stripColor: '#C97D3A',
    benefits:   ['Promo umum & diskon seasonal', 'Voucher setelah setiap servis', 'Booking online 24/7', 'Notifikasi jadwal service'],
    desc:       'Mulai perjalanan membership dan kumpulkan poin dari setiap servis.',
    minPoin:    'Daftar Gratis',
  },
}

// Urutan tampil: tertinggi ke terendah
export const TIER_ORDER = ['Platinum', 'Gold', 'Silver', 'Bronze']

// ─── Decorative Pattern SVG per tier ────────────────────────
export function CardPattern({ pattern, accent }) {
  if (pattern === 'vip') return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`vip-lattice-${accent.replace('#','')}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke={accent} strokeWidth="0.8"/>
          <circle cx="20" cy="20" r="2" fill={accent} opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="380" height="240" fill={`url(#vip-lattice-${accent.replace('#','')})`}/>
      <ellipse cx="340" cy="60" rx="80" ry="80" fill={accent} opacity="0.06"/>
      <ellipse cx="60" cy="180" rx="60" ry="60" fill={accent} opacity="0.04"/>
    </svg>
  )

  if (pattern === 'gold') return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`gold-hex-${accent.replace('#','')}`} x="0" y="0" width="30" height="26" patternUnits="userSpaceOnUse">
          <polygon points="15,0 30,7.5 30,18.5 15,26 0,18.5 0,7.5" fill="none" stroke={accent} strokeWidth="0.6"/>
        </pattern>
      </defs>
      <rect width="380" height="240" fill={`url(#gold-hex-${accent.replace('#','')})`}/>
      <circle cx="310" cy="50" r="70" fill={accent} opacity="0.05"/>
    </svg>
  )

  if (pattern === 'silver') return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`silver-grid-${accent.replace('#','')}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 L0 24 M0 0 L24 24" stroke={accent} strokeWidth="0.5"/>
          <rect x="10" y="10" width="4" height="4" fill={accent} opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="380" height="240" fill={`url(#silver-grid-${accent.replace('#','')})`}/>
    </svg>
  )

  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`bronze-dots-${accent.replace('#','')}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill={accent}/>
        </pattern>
      </defs>
      <rect width="380" height="240" fill={`url(#bronze-dots-${accent.replace('#','')})`}/>
    </svg>
  )
}

// ─── Chip EMV SVG ────────────────────────────────────────────
export function ChipIcon({ color }) {
  return (
    <svg width="44" height="34" viewBox="0 0 44 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="42" height="32" rx="5" fill={`url(#chip-grad-${color.replace('#','')})`} stroke={color} strokeWidth="0.8" opacity="0.8"/>
      <defs>
        <linearGradient id={`chip-grad-${color.replace('#','')}`} x1="0" y1="0" x2="44" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.8"/>
        </linearGradient>
      </defs>
      <line x1="15" y1="1" x2="15" y2="33" stroke={color} strokeWidth="0.6" opacity="0.5"/>
      <line x1="29" y1="1" x2="29" y2="33" stroke={color} strokeWidth="0.6" opacity="0.5"/>
      <line x1="1" y1="11" x2="43" y2="11" stroke={color} strokeWidth="0.6" opacity="0.5"/>
      <line x1="1" y1="23" x2="43" y2="23" stroke={color} strokeWidth="0.6" opacity="0.5"/>
      <rect x="15" y="11" width="14" height="12" rx="1" fill={color} opacity="0.3"/>
    </svg>
  )
}

// ─── Card Front ──────────────────────────────────────────────
// Props:
//   theme        — satu entry dari CARD_THEME
//   customer     — objek customer (opsional; jika null tampilkan placeholder)
//   membershipId — string (opsional)
//   memberSince  — string (opsional)
//   totalPoints  — number (opsional)
//   scale        — number css transform scale, default 1 (dipakai untuk preview kecil)
export function CardFront({ customer, theme, membershipId, memberSince, totalPoints }) {
  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden select-none"
      style={{
        background: theme.gradient,
        border: theme.border,
        boxShadow: `0 20px 60px ${theme.accentGlow}, 0 4px 20px rgba(0,0,0,0.8)`,
      }}
    >
      <CardPattern pattern={theme.pattern} accent={theme.accent} />

      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: theme.shimmer }} />

      {/* Top glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 65%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Row 1: Logo + Level */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}40` }}
            >
              <span className="text-sm">🚗</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm tracking-tight leading-none">Esther Garage</p>
              <p
                className="text-[9px] font-semibold tracking-widest uppercase leading-none mt-0.5"
                style={{ color: `${theme.accentLight}80` }}
              >
                Member Card
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-xl tracking-wide" style={{ color: theme.textColor }}>{theme.label}</p>
            <p className="text-[10px] font-medium tracking-widest" style={{ color: `${theme.accentLight}70` }}>{theme.sublabel}</p>
          </div>
        </div>

        {/* Row 2: Chip */}
        <div className="mb-4">
          <ChipIcon color={theme.chipColor} />
        </div>

        {/* Row 3: Card number */}
        <div className="mb-4">
          <p
            className="font-mono text-base tracking-[0.25em] font-bold"
            style={{ color: theme.textColor, textShadow: `0 0 12px ${theme.accentGlow}` }}
          >
            {membershipId
              ? membershipId.replace(/-/g, ' ').toUpperCase().padEnd(16, '·')
              : '•••• •••• •••• ••••'}
          </p>
        </div>

        {/* Row 4: Name + points */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: `${theme.accentLight}60` }}>
              Nama Member
            </p>
            <p className="text-white font-bold text-sm tracking-wide uppercase">
              {customer?.name || 'NAMA MEMBER'}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: `${theme.accentLight}70` }}>
              Berlaku sejak: {memberSince || '—'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-0.5">
              <span className="text-base">{theme.icon}</span>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: `${theme.accentLight}60` }}>
                Total Poin
              </p>
            </div>
            <p className="font-extrabold text-lg" style={{ color: theme.accentLight }}>
              {(totalPoints || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
      />
    </div>
  )
}
