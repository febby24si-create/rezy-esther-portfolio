// src/components/Kontak.jsx
// Menampilkan informasi kontak dalam grid dengan ikon dan link

const Kontak = ({ items }) => {
  return (
    <div className="card kontak-card">
      <div className="card-title">Kontak & Tautan</div>

      <div className="kontak-grid">
        {items.map((item, i) => {
          const Tag = item.href ? 'a' : 'div';
          return (
            <Tag
              key={i}
              className="kontak-item"
              href={item.href || undefined}
              target={item.href ? '_blank' : undefined}
              rel={item.href ? 'noopener noreferrer' : undefined}
            >
              {/* Ikon */}
              <div className={`kontak-icon ${item.type}`}>
                {item.icon}
              </div>

              {/* Teks */}
              <div className="kontak-text">
                <span className="kontak-label">{item.label}</span>
                <span className="kontak-value">{item.value}</span>
              </div>
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export default Kontak;