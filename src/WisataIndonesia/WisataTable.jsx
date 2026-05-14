import React from 'react';

const formatHarga = (harga, gratis) => {
  if (gratis) return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Gratis</span>;
  return 'Rp ' + harga.toLocaleString('id-ID');
};

const Badge = ({ label, color = 'gray' }) => {
  const colors = {
    gray:    'bg-gray-100 text-gray-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue:    'bg-blue-50 text-blue-700',
    amber:   'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
};

const Tick = ({ ok }) => (
  ok
    ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">✓</span>
    : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">—</span>
);

const WisataTable = ({ data }) => {
  if (!data.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-base">Tidak ada destinasi ditemukan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Foto</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nama Destinasi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Kategori</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Provinsi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Kota</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tiket Dewasa</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tiket Anak</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Jam Operasional</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Parkir</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">ATM</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pengunjung/Tahun</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <img
                  src={d.gambar}
                  alt={d.nama}
                  className="w-12 h-9 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=60&q=60';
                  }}
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{d.nama}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge label={d.kategori} color="blue" />
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{d.provinsi}</td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{d.lokasi.kota}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-800">{d.rating.toFixed(1)}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                {formatHarga(d.tiket.harga_dewasa, d.tiket.gratis)}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                {formatHarga(d.tiket.harga_anak, d.tiket.gratis)}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{d.jam_operasional}</td>
              <td className="px-4 py-3 text-center"><Tick ok={d.fasilitas.parkir} /></td>
              <td className="px-4 py-3 text-center"><Tick ok={d.fasilitas.atm} /></td>
              <td className="px-4 py-3 text-right text-gray-700 text-xs whitespace-nowrap">
                {d.pengunjung_per_tahun.toLocaleString('id-ID')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge label={d.status} color="emerald" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-right">
        Geser ke kanan untuk melihat semua kolom pada layar kecil
      </div>
    </div>
  );
};

export default WisataTable;