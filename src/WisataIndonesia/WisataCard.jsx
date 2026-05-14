import React from 'react';

const formatHarga = (harga) => {
  if (harga === 0) return 'Gratis';
  return 'Rp ' + harga.toLocaleString('id-ID');
};

const formatPengunjung = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'jt';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'rb';
  return n.toLocaleString('id-ID');
};

const WisataCard = ({ destinasi }) => {
  const { nama, kategori, provinsi, rating, gambar, deskripsi, lokasi, tiket, jam_operasional, pengunjung_per_tahun } = destinasi;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Gambar */}
      <div className="relative overflow-hidden h-48">
        <img
          src={gambar}
          alt={nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80';
          }}
        />
        {/* Badge kategori di atas gambar */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {kategori}
        </span>
        {/* Badge gratis */}
        {tiket.gratis && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Gratis
          </span>
        )}
      </div>

      {/* Konten */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">{nama}</h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{lokasi.kota}, {provinsi}</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{deskripsi}</p>

        {/* Fasilitas */}
        <div className="flex items-center gap-2 mb-3">
          {destinasi.fasilitas.parkir && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">P Parkir</span>
          )}
          {destinasi.fasilitas.atm && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">ATM</span>
          )}
          {destinasi.fasilitas.toilet && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Toilet</span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
          </div>

          {/* Harga */}
          <span className={`text-sm font-semibold ${tiket.gratis ? 'text-emerald-600' : 'text-gray-700'}`}>
            {formatHarga(tiket.harga_dewasa)}
          </span>
        </div>

        {/* Info bawah */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>🕐 {jam_operasional}</span>
          <span>👥 {formatPengunjung(pengunjung_per_tahun)}/thn</span>
        </div>
      </div>
    </div>
  );
};

export default WisataCard;