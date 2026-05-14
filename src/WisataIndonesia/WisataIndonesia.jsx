import React, { useState, useMemo } from 'react';
import wisataData from './wisataData.json';
import WisataCard from './WisataCard';
import WisataTable from './WisataTable';
import WisataFilter from './WisataFilter';
import './tailwind.css'

const WisataIndonesia = () => {
  const [mode, setMode] = useState('guest'); // 'guest' | 'admin'
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTiket, setFilterTiket] = useState('');

  const filteredData = useMemo(() => {
    return wisataData.data.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.nama.toLowerCase().includes(q) ||
        d.provinsi.toLowerCase().includes(q) ||
        d.lokasi.kota.toLowerCase().includes(q);

      const matchKategori = !filterKategori || d.kategori === filterKategori;

      const matchTiket =
        !filterTiket ||
        (filterTiket === 'gratis' ? d.tiket.gratis : !d.tiket.gratis);

      return matchSearch && matchKategori && matchTiket;
    });
  }, [search, filterKategori, filterTiket]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600 tracking-tight">Nusantara</span>
              <span className="text-2xl font-light text-gray-400">Wisata</span>
            </div>

            {/* Tab Switch */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setMode('guest')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'guest'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tampilan Guest
              </button>
              <button
                onClick={() => setMode('admin')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'admin'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tampilan Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero singkat */}
        {mode === 'guest' && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Destinasi Wisata <span className="text-emerald-600">Indonesia</span>
            </h1>
            <p className="text-sm text-gray-500">
              Temukan 20 destinasi unggulan dari Sabang sampai Merauke
            </p>
          </div>
        )}

        {mode === 'admin' && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">Panel Admin — Data Destinasi</h1>
            <p className="text-sm text-gray-500">Kelola dan pantau seluruh data destinasi wisata</p>
          </div>
        )}

        {/* Filter */}
        <WisataFilter
          search={search}
          onSearch={setSearch}
          filterKategori={filterKategori}
          onFilterKategori={setFilterKategori}
          filterTiket={filterTiket}
          onFilterTiket={setFilterTiket}
          totalData={filteredData.length}
        />

        {/* Konten utama */}
        {mode === 'guest' ? (
          filteredData.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium mb-1">Tidak ada destinasi ditemukan</p>
              <p className="text-sm">Coba ubah kata kunci atau filter pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredData.map((d) => (
                <WisataCard key={d.id} destinasi={d} />
              ))}
            </div>
          )
        ) : (
          <WisataTable data={filteredData} />
        )}
      </main>
    </div>
  );
};

export default WisataIndonesia;