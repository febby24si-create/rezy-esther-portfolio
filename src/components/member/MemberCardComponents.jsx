// ============================================================
// MemberCardComponents.jsx  (redesigned — v2)
// Shared components untuk kartu member digital.
// Di-reuse oleh:
//   - /member/kartu  (KartuMember.jsx)
//   - /           (LandingPage.jsx — preview section Membership)
// ============================================================

import { CARD_THEME, TIER_ORDER } from '../../lib/memberCardTheme'

// ─── Decorative SVG Pattern per tier ────────────────────────
export function CardPattern({ pattern, accent }) {
  const id = `${pattern}-${accent.replace('#', '')}`;

  if (pattern === 'vip')
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={`pat-${id}`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 14 L14 0 L28 14 L14 28 Z" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.35" />
            <circle cx="14" cy="14" r="1.2" fill={accent} opacity="0.25" />
          </pattern>
          <radialGradient id={`glow-${id}`} cx="80%" cy="20%" r="55%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.14" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="380" height="240" fill={`url(#pat-${id})`} />
        <rect width="380" height="240" fill={`url(#glow-${id})`} />
      </svg>
    );

  if (pattern === 'gold')
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={`pat-${id}`} x="0" y="0" width="22" height="19" patternUnits="userSpaceOnUse">
            <polygon points="11,0 22,5.5 22,13.5 11,19 0,13.5 0,5.5" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.28" />
          </pattern>
          <radialGradient id={`glow-${id}`} cx="80%" cy="20%" r="55%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="380" height="240" fill={`url(#pat-${id})`} />
        <rect width="380" height="240" fill={`url(#glow-${id})`} />
      </svg>
    );

  if (pattern === 'silver')
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={`pat-${id}`} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M18 0 L0 18 M0 0 L18 18" stroke={accent} strokeWidth="0.4" opacity="0.22" />
            <rect x="7" y="7" width="4" height="4" fill={accent} opacity="0.15" />
          </pattern>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="380" height="240" fill={`url(#pat-${id})`} />
        <rect width="380" height="240" fill={`url(#glow-${id})`} />
      </svg>
    );

  // Bronze — dots
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={`pat-${id}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.2" fill={accent} opacity="0.28" />
        </pattern>
        <radialGradient id={`glow-${id}`} cx="80%" cy="20%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="380" height="240" fill={`url(#pat-${id})`} />
      <rect width="380" height="240" fill={`url(#glow-${id})`} />
    </svg>
  );
}

// ─── Dekoratif simbol tengah kartu (per tier) ───────────────
export function CardSymbol({ symbol, accent }) {
  const commonStyle = { opacity: 0.6 };

  if (symbol === 'diamond')
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" style={commonStyle}>
        <path d="M32 6 L56 32 L32 58 L8 32 Z" stroke={accent} strokeWidth="0.8" strokeOpacity="0.35" />
        <path d="M32 14 L50 32 L32 50 L14 32 Z" fill={accent} fillOpacity="0.06" stroke={accent} strokeWidth="0.6" strokeOpacity="0.4" />
        <circle cx="32" cy="32" r="8" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.55" />
        <circle cx="32" cy="32" r="3" fill={accent} fillOpacity="0.45" />
        <line x1="32" y1="6" x2="32" y2="24" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="32" y1="40" x2="32" y2="58" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="8" y1="32" x2="24" y2="32" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="40" y1="32" x2="56" y2="32" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
      </svg>
    );

  if (symbol === 'hexagon')
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" style={commonStyle}>
        <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" stroke={accent} strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
        <polygon points="32,12 48,21 48,43 32,52 16,43 16,21" stroke={accent} strokeWidth="0.7" strokeOpacity="0.45" fill={accent} fillOpacity="0.06" />
        <polygon points="32,22 40,27 40,37 32,42 24,37 24,27" fill={accent} fillOpacity="0.20" />
        <circle cx="32" cy="32" r="4" fill={accent} fillOpacity="0.4" />
      </svg>
    );

  if (symbol === 'circle')
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" style={commonStyle}>
        <circle cx="32" cy="32" r="26" stroke={accent} strokeWidth="0.7" strokeOpacity="0.35" />
        <circle cx="32" cy="32" r="18" stroke={accent} strokeWidth="0.7" strokeOpacity="0.45" />
        <circle cx="32" cy="32" r="8" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="0.7" strokeOpacity="0.55" />
        <line x1="6" y1="32" x2="58" y2="32" stroke={accent} strokeWidth="0.5" strokeOpacity="0.20" />
        <line x1="32" y1="6" x2="32" y2="58" stroke={accent} strokeWidth="0.5" strokeOpacity="0.20" />
        <circle cx="32" cy="32" r="2.5" fill={accent} fillOpacity="0.55" />
      </svg>
    );

  // Shield (Bronze)
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" style={commonStyle}>
      <path d="M32 4 L56 14 L56 36 Q56 52 32 60 Q8 52 8 36 L8 14 Z" stroke={accent} strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      <path d="M32 12 L48 20 L48 36 Q48 48 32 55 Q16 48 16 36 L16 20 Z" stroke={accent} strokeWidth="0.6" strokeOpacity="0.45" fill={accent} fillOpacity="0.07" />
      <line x1="26" y1="32" x2="38" y2="32" stroke={accent} strokeWidth="0.8" strokeOpacity="0.55" />
      <line x1="32" y1="26" x2="32" y2="38" stroke={accent} strokeWidth="0.8" strokeOpacity="0.55" />
      <circle cx="32" cy="32" r="3" fill={accent} fillOpacity="0.25" />
    </svg>
  );
}

// ─── Chip EMV ────────────────────────────────────────────────
export function ChipIcon({ color }) {
  const id = `chip-${color.replace('#', '')}`;
  return (
    <svg width="44" height="33" viewBox="0 0 44 33" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="42" height="31" rx="4.5" fill={color} fillOpacity="0.42" stroke={color} strokeWidth="0.8" strokeOpacity="0.55" />
      <line x1="14" y1="1" x2="14" y2="32" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" />
      <line x1="30" y1="1" x2="30" y2="32" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" />
      <line x1="1" y1="11" x2="43" y2="11" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" />
      <line x1="1" y1="22" x2="43" y2="22" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" />
      <rect x="14" y="11" width="16" height="11" rx="1.5" fill={color} fillOpacity="0.18" />
      <circle cx="22" cy="16.5" r="3" fill="none" stroke={color} strokeWidth="0.6" strokeOpacity="0.50" />
      <circle cx="22" cy="16.5" r="1" fill={color} fillOpacity="0.55" />
    </svg>
  );
}

// ─── Corner Brackets ─────────────────────────────────────────
function CornerBrackets({ accent }) {
  const color = `${accent}45`;
  return (
    <>
      {/* top-left */}
      <div className="absolute top-3 left-3 w-5 h-5 pointer-events-none"
        style={{ borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}`, borderRadius: '2px 0 0 0' }} />
      {/* top-right */}
      <div className="absolute top-3 right-3 w-5 h-5 pointer-events-none"
        style={{ borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}`, borderRadius: '0 2px 0 0' }} />
      {/* bottom-left */}
      <div className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none"
        style={{ borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}`, borderRadius: '0 0 0 2px' }} />
      {/* bottom-right */}
      <div className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none"
        style={{ borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}`, borderRadius: '0 0 2px 0' }} />
    </>
  );
}

// ─── Card Front ──────────────────────────────────────────────
// Props:
//   theme        — satu entry dari CARD_THEME
//   customer     — objek customer (opsional; jika null tampilkan placeholder)
//   membershipId — string (opsional)
//   memberSince  — string (opsional)
//   totalPoints  — number (opsional)
export function CardFront({ customer, theme, membershipId, memberSince, totalPoints }) {
  const formatCardNumber = (id) => {
    if (!id) return '•••• •••• •••• ••••';
    const clean = id.replace(/-/g, '').toUpperCase();
    const padded = clean.padEnd(16, '•');
    return padded.match(/.{1,4}/g).join(' ');
  };

  const cardNumber = formatCardNumber(membershipId);

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden select-none transition-transform duration-300 hover:scale-[1.015]"
      style={{
        background: theme.gradient,
        border: theme.border,
        boxShadow: theme.shadow,
      }}
    >
      {/* Background pattern */}
      <CardPattern pattern={theme.pattern} accent={theme.accent} />

      {/* Corner brackets */}
      <CornerBrackets accent={theme.accent} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-5">

        {/* ── Row 1: Wordmark + Tier badge ── */}
        <div className="flex items-start justify-between mb-3">
          {/* Wordmark kiri */}
          <div>
            <p
              className="font-serif font-bold text-sm tracking-[0.18em] uppercase leading-none"
              style={{ color: theme.accent, opacity: 0.9 }}
            >
              Esther Garage
            </p>
            <p
              className="text-[7.5px] tracking-[0.2em] uppercase mt-0.5"
              style={{ color: theme.accent, opacity: 0.4, letterSpacing: '0.18em' }}
            >
              Member Card · {theme.sublabel}
            </p>
          </div>

          {/* Tier badge kanan */}
          <div
            className="px-3 py-1 rounded-full text-[9.5px] font-bold tracking-[0.18em] uppercase"
            style={{
              background: theme.badgeBg,
              border: `0.8px solid ${theme.accent}38`,
              color: theme.accentLight,
            }}
          >
            {theme.icon} {theme.tierLabel}
          </div>
        </div>

        {/* ── Row 2: Chip + Dekoratif simbol ── */}
        <div className="flex items-center justify-between mb-3">
          <ChipIcon color={theme.chipColor} />
          {/* Simbol dekoratif tengah */}
          <div className="flex-1 flex justify-center">
            <CardSymbol symbol={theme.symbol} accent={theme.accent} />
          </div>
          {/* Spacer kanan biar simbol tetap tengah */}
          <div style={{ width: 44 }} />
        </div>

        {/* ── Row 3: Card number ── */}
        <div className="mb-3">
          <p
            className="font-mono font-semibold"
            style={{
              fontSize: '13px',
              letterSpacing: '0.26em',
              color: theme.textColor,
              opacity: 0.88,
            }}
          >
            {cardNumber}
          </p>
        </div>

        {/* ── Row 4: Nama + Poin ── */}
        <div className="flex items-end justify-between mt-auto">
          {/* Kiri: nama member */}
          <div>
            <p
              className="text-[7.5px] uppercase tracking-[0.18em] mb-0.5"
              style={{ color: theme.accent, opacity: 0.4 }}
            >
              Nama Member
            </p>
            <p
              className="text-white font-semibold text-[13px] tracking-wider uppercase leading-none"
              style={{ opacity: 0.88 }}
            >
              {customer?.name || 'Nama Member'}
            </p>
            <p
              className="text-[7.5px] mt-1 tracking-wider"
              style={{ color: theme.accentLight, opacity: 0.45 }}
            >
              Bergabung {memberSince || '—'}
            </p>
          </div>

          {/* Kanan: poin */}
          <div className="text-right">
            <p
              className="text-[7.5px] uppercase tracking-[0.18em] mb-0.5"
              style={{ color: theme.accent, opacity: 0.4 }}
            >
              Poin
            </p>
            <p
              className="font-bold"
              style={{
                fontSize: '22px',
                color: theme.accentLight,
                lineHeight: 1,
                opacity: 0.9,
              }}
            >
              {(totalPoints || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom strip accent */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.accent}80 30%, ${theme.accentLight}99 50%, ${theme.accent}80 70%, transparent 100%)`,
        }}
      />

      {/* Shimmer animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 30%, ${theme.accentGlow} 48%, transparent 66%)`,
          animation: 'card-shimmer 5s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes card-shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(120%) skewX(-12deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}