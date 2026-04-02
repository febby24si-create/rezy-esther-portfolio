// src/components/TentangSaya.jsx
// Menampilkan deskripsi diri dan kutipan favorit

const TentangSaya = ({ paragraphs, quote }) => {
  return (
    <div className="card tentang-card">
      <div className="card-title">Tentang Saya</div>

      {/* ── Paragraf Deskripsi ── */}
      <div className="tentang-text">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>

      {/* ── Kutipan ── */}
      {quote && (
        <blockquote className="tentang-quote">
          "{quote}"
        </blockquote>
      )}
    </div>
  );
};

export default TentangSaya;