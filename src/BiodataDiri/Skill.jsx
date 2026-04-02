// src/components/Skill.jsx
// Menampilkan skill dengan logo SVG custom + progress bar profisiensi

// ── Logo SVG per teknologi ─────────────────────────────
const logos = {
  HTML5: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#1a1008"/>
      <path d="M6 4l2.8 31.4L20 39l11.2-3.6L34 4H6z" fill="#E44D26"/>
      <path d="M20 36.5V6.5h11.6l-2.4 26.6L20 36.5z" fill="#F16529"/>
      <path d="M20 16.5H13.6l-.4-4.5H20v-4.4H8.7l1.1 12H20v-3.1z" fill="#EBEBEB"/>
      <path d="M20 27.3l-.1.1-5.3-1.4-.3-3.8H10l.6 7.2 9.3 2.6h.1V27.3z" fill="#EBEBEB"/>
      <path d="M20 16.5v3.1h5.9l-.6 6.6L20 27.4v4.8l9.3-2.6.1-.9 1.3-14.7H20z" fill="white"/>
    </svg>
  ),
  CSS3: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0d1226"/>
      <path d="M6 4l2.8 31.4L20 39l11.2-3.6L34 4H6z" fill="#264DE4"/>
      <path d="M20 36.5V6.5h11.6l-2.4 26.6L20 36.5z" fill="#2965F1"/>
      <path d="M20 16.5H13.6l-.4-4.5H20v-4.4H8.7l1.1 12H20v-3.1z" fill="#EBEBEB"/>
      <path d="M20 27.3l-.1.1-5.3-1.4-.3-3.8H10l.6 7.2 9.3 2.6h.1V27.3z" fill="#EBEBEB"/>
      <path d="M20 16.5v3.1h5.9l-.6 6.6L20 27.4v4.8l9.3-2.6.1-.9 1.3-14.7H20z" fill="white"/>
    </svg>
  ),
  JavaScript: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#F7DF1E"/>
      <path d="M23.8 28.6c.7 1.1 1.5 2 3.2 2 1.3 0 2.2-.7 2.2-1.6 0-1.1-.9-1.5-2.4-2.1l-.8-.4c-2.4-1-4-2.3-4-5 0-2.5 1.9-4.4 4.8-4.4 2.1 0 3.6.7 4.7 2.6l-2.5 1.6c-.6-1-1.1-1.4-2.1-1.4-1 0-1.6.6-1.6 1.4 0 1 .6 1.4 2 2l.8.4c2.8 1.2 4.4 2.4 4.4 5.2 0 3-2.4 4.7-5.5 4.7-3.1 0-5.1-1.5-6-3.5l2.8-1.5zM11.3 28.9c.5.9 1 1.6 2 1.6.9 0 1.5-.4 1.5-1.8V17.6h3.2v11.2c0 3-1.7 4.3-4.3 4.3-2.3 0-3.7-1.2-4.3-2.7l1.9-1.5z" fill="#323330"/>
    </svg>
  ),
  Laravel: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#1a0809"/>
      <path d="M33.2 11.6c.1.2.1.4 0 .5l-4.7 8.1c-.1.2-.3.3-.5.3H23l-4.4 7.6c-.1.2-.3.3-.5.3H9.6c-.2 0-.4-.1-.5-.3-.1-.2-.1-.4 0-.5l2-3.5c.1-.2.3-.3.5-.3h3.1l2.2-3.8H13c-.2 0-.4-.1-.5-.3-.1-.2-.1-.4 0-.5l4.7-8.1c.1-.2.3-.3.5-.3h4.8l1.2-2.1c.1-.2.3-.3.5-.3h8.4c.2 0 .4.1.5.3l.1.9z" fill="#FF2D20"/>
      <path d="M23.8 20.2l4.4-7.6h-7.6l-4.4 7.6h7.6z" fill="#FF2D20" opacity="0.5"/>
      <path d="M18 28.1l4.4-7.6h-7.6l-4.4 7.6H18z" fill="#FF2D20" opacity="0.7"/>
    </svg>
  ),
  "CodeIgniter 3": (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0f1218"/>
      <path d="M20 5c0 0-1.5 4.5-3.5 7.5-1.5 2.2-3.5 3-3.5 5.5 0 2.5 1.5 4.2 3 5-0.5-1.5-0.2-3.2 1-4.2 1.8-1.5 2.8-3 2.8-5 0 0 1.8 2 2 4.5 0.2 1.8-0.5 3.2 0.2 5 0.8 2 2.8 3 2.8 5.5 0 2.8-2.8 5-2.8 5s4-1.5 5.5-5c1.2-2.8 0.8-5-0.8-7.5 0 0-0.2 2-1.5 3-0.8-3.8 2-8-5.2-19.3z" fill="#EF4123"/>
      <path d="M20 14c0 0-0.8 2.2-2 3.8-0.8 1.2-1.8 1.5-1.8 2.8 0 1.2 0.8 2.2 1.5 2.5-0.2-0.8-0.1-1.6 0.5-2.2 0.9-0.8 1.4-1.5 1.4-2.5 0 0 0.9 1 1 2.2 0.1 0.9-0.2 1.6 0.1 2.5 0.4 1 1.4 1.5 1.4 2.8 0 1.5-1.4 2.5-1.4 2.5s2-0.8 2.8-2.5c0.6-1.4 0.4-2.5-0.4-3.8 0 0-0.1 1-0.8 1.5-0.4-1.9 1-4-2.3-9.6z" fill="#FF8C00"/>
      <text x="20" y="38" textAnchor="middle" fontFamily="monospace" fontSize="5"
            fontWeight="bold" fill="#EF4123">CI3</text>
    </svg>
  ),
    React: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0f1218"/>
        
        <ellipse cx="20" cy="20" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none"/>
        <ellipse cx="20" cy="20" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(60 20 20)"/>
        <ellipse cx="20" cy="20" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(120 20 20)"/>
        
        <circle cx="20" cy="20" r="2.5" fill="#61DAFB"/>
        
        <text x="20" y="38" textAnchor="middle" fontFamily="monospace" fontSize="5"
            fontWeight="bold" fill="#61DAFB">React</text>
    </svg>
    ),
};

// ── Data Skill ─────────────────────────────────────────
const skillData = [
  { name: 'HTML5',         level: 'Expert',        pct: 95 },
  { name: 'CSS3',          level: 'Expert',        pct: 90 },
  { name: 'JavaScript',    level: 'Advanced',      pct: 40 },
  { name: 'Laravel',       level: 'Advanced',      pct: 80 },
  { name: 'CodeIgniter 3', level: 'Intermediate',  pct: 60 },
  { name: 'React', level: 'Intermediate',  pct: 10 },
];

// ── Component ──────────────────────────────────────────
const Skill = () => {
  return (
    <div className="card skill-card">
      <div className="card-title">Keahlian</div>

      {/* ── Logo Grid ── */}
      <div className="skill-group-title">Stack yang dikuasai</div>
      <div className="tech-grid">
        {skillData.map((s) => (
          <div className="tech-card" key={s.name}>
            <div className="tech-logo-wrap">
              {logos[s.name]}
            </div>
            <span className="tech-name">{s.name}</span>
            <span className="tech-level">{s.level}</span>
          </div>
        ))}
      </div>

      {/* ── Progress Bars ── */}
      <div className="skill-group-title" style={{ marginTop: '1.6rem' }}>
        Profisiensi
      </div>
      <div className="skill-bars">
        {skillData.map((s) => (
          <div className="skill-bar-item" key={s.name}>
            <div className="skill-bar-header">
              <span className="skill-bar-name">{s.name}</span>
              <span className="skill-bar-pct">{s.pct}%</span>
            </div>
            <div className="skill-bar-track">
              <div
                className="skill-bar-fill"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skill;