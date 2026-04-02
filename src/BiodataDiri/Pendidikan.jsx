// src/components/Pendidikan.jsx
// Menampilkan riwayat pendidikan dalam format timeline vertikal

const Pendidikan = ({ riwayat }) => {
  return (
    <div className="card pendidikan-card">
      <div className="card-title">Pendidikan</div>

      <div className="timeline">
        {riwayat.map((item, i) => (
          <div className="timeline-item" key={i}>
            {/* Titik penanda */}
            <div className={`timeline-dot ${i === 0 ? 'active' : ''}`} />

            {/* Konten */}
            <div className="timeline-body">
              <div className="timeline-period">{item.periode}</div>
              <div className="timeline-school">{item.institusi}</div>
              <div className="timeline-major">{item.jurusan}</div>
              {item.ipk && (
                <span className="timeline-gpa">IPK {item.ipk}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pendidikan;