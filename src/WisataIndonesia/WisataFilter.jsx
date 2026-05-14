import React from 'react';

const KATEGORI_OPTIONS = [
  'Pantai',
  'Sejarah & Budaya',
  'Bahari',
  'Danau',
  'Alam & Satwa',
  'Gunung & Trekking',
  'Taman & Rekreasi',
  'Budaya & Petualangan',
];

const WisataFilter = ({ search, onSearch, filterKategori, onFilterKategori, filterTiket, onFilterTiket, totalData }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, kota, atau provinsi..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Filter Kategori */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Kategori</label>
          <select
            value={filterKategori}
            onChange={(e) => onFilterKategori(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-gray-50 text-gray-700 min-w-[160px]"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Filter Tiket */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Tiket</label>
          <select
            value={filterTiket}
            onChange={(e) => onFilterTiket(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-gray-50 text-gray-700 min-w-[140px]"
          >
            <option value="">Semua Tiket</option>
            <option value="gratis">Gratis</option>
            <option value="berbayar">Berbayar</option>
          </select>
        </div>

        {/* Counter */}
        <span className="ml-auto sm:ml-0 shrink-0 inline-flex items-center justify-center bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap">
          {totalData} destinasi
        </span>
      </div>
    </div>
  );
};

export default WisataFilter;