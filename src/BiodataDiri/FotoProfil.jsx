// src/components/FotoProfil.jsx
// Menampilkan foto profil, nama singkat, statistik, dan status ketersediaan

const FotoProfil = ({ nama, role, foto, stats, available }) => {
  return (
    <div className="card foto-profil-card">
      <div className="card-title">Profil</div>

      {/* ── Foto ── */}
      <div className="foto-wrapper">
        {foto ? (
          <img src={foto} alt={`Foto ${nama}`} />
        ) : (
          <div className="foto-placeholder">🧑‍💻</div>
        )}
        <span className="foto-badge">Chaoyue</span>
      </div>

      {/* ── Identitas Singkat ── */}
      <div className="foto-name-quick">{nama}</div>
      <div className="foto-role">{role}</div>

      {/* ── Divider ── */}
      <div className="foto-divider" />

      {/* ── Statistik ── */}
      <div className="foto-stats">
        {stats.map((s, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-number">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="foto-divider" />

      {/* ── Status ── */}
      <div className="foto-availability">
        <span className="dot-available" />
        <span>{available}</span>
      </div>
    </div>
  );
};

export default FotoProfil;