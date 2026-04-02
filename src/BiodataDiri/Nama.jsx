// src/components/Nama.jsx
// Menampilkan nama lengkap, gelar, dan informasi meta (lokasi, usia, email)

const Nama = ({ namaDepan, namaBelakang, gelar, meta }) => {
  return (
    <div className="card nama-card">
      <div className="card-title">Identitas</div>

      <h1 className="nama-display">
        {namaDepan}
        <span>{namaBelakang}</span>
      </h1>

      {gelar && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: 'var(--text-muted)', marginTop: '0.4rem',
                    letterSpacing: '0.08em' }}>
          {gelar}
        </p>
      )}

      <div className="nama-meta">
        {meta.map((item, i) => (
          <span className="nama-meta-item" key={i}>
            <span className="icon">{item.icon}</span>
            {item.value}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Nama;