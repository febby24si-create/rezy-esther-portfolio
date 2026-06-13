// ============================================================
// vehicleCatalog.js
// Katalog kendaraan untuk fitur pencarian / autocomplete
// di halaman BookingService dan form tambah kendaraan.
// Setiap entry memiliki foto default dari Unsplash.
// ============================================================

export const vehicleCatalog = [
  // ── Toyota ────────────────────────────────────────────────
  { brand: 'Toyota', model: 'Avanza',         years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Innova',          years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1552519507-88aa2dfa4ad8?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Rush',            years: [2020,2021,2022,2023,2024],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Fortuner',        years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1532581291344-42522b495c3c?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Yaris',           years: [2019,2020,2021,2022,2023],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Agya',            years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1619767886558-ef5f734c8eb5?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Corolla Altis',   years: [2020,2021,2022,2023],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Camry',           years: [2021,2022,2023,2024],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Hilux',           years: [2020,2021,2022,2023,2024],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1533559662493-6c9bc2059848?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Raize',           years: [2021,2022,2023,2024],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Toyota', model: 'Veloz',           years: [2022,2023,2024],                type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop' },

  // ── Honda Mobil ───────────────────────────────────────────
  { brand: 'Honda', model: 'Brio',            years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'Jazz',            years: [2019,2020,2021],                type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'HRV',             years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'CRV',             years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'Mobilio',         years: [2019,2020,2021,2022],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b68b3b5?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'City Hatchback',  years: [2021,2022,2023,2024],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop' },

  // ── Honda Motor ───────────────────────────────────────────
  { brand: 'Honda', model: 'Beat',            years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'Vario 125',       years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'Vario 150',       years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'PCX',             years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'Scoopy',          years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'CB150R',          years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },
  { brand: 'Honda', model: 'CBR250RR',        years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },

  // ── Yamaha ────────────────────────────────────────────────
  { brand: 'Yamaha', model: 'NMAX',           years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'Aerox',          years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'Lexi',           years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'Mio',            years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'Fino',           years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'Jupiter MX',     years: [2019,2020,2021,2022],           type: 'Motor', photo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'MT-15',          years: [2020,2021,2022,2023,2024],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },
  { brand: 'Yamaha', model: 'R15',            years: [2019,2020,2021,2022,2023,2024], type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },

  // ── Suzuki ────────────────────────────────────────────────
  { brand: 'Suzuki', model: 'Ertiga',         years: [2019,2020,2021,2022,2023,2024], type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'Swift',          years: [2019,2020,2021,2022,2023],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'Ignis',          years: [2019,2020,2021,2022,2023],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'Karimun Wagon',  years: [2019,2020,2021,2022],           type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'XL7',            years: [2020,2021,2022,2023,2024],      type: 'Mobil',  photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'Address',        years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'Satria F150',    years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },
  { brand: 'Suzuki', model: 'GSX-R150',       years: [2019,2020,2021,2022,2023],      type: 'Motor', photo: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop' },

  // ── Mitsubishi ────────────────────────────────────────────
  { brand: 'Mitsubishi', model: 'Xpander',         years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop' },
  { brand: 'Mitsubishi', model: 'Pajero Sport',     years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1511919884226-fd94a4d4af6d?w=600&auto=format&fit=crop' },
  { brand: 'Mitsubishi', model: 'Outlander Sport',  years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop' },
  { brand: 'Mitsubishi', model: 'Triton',            years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop' },
  { brand: 'Mitsubishi', model: 'Eclipse Cross',     years: [2021,2022,2023,2024],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop' },

  // ── Daihatsu ──────────────────────────────────────────────
  { brand: 'Daihatsu', model: 'Xenia',       years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop' },
  { brand: 'Daihatsu', model: 'Terios',      years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Daihatsu', model: 'Ayla',        years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1619767886558-ef5f734c8eb5?w=600&auto=format&fit=crop' },
  { brand: 'Daihatsu', model: 'Sigra',       years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop' },
  { brand: 'Daihatsu', model: 'Rocky',       years: [2021,2022,2023,2024],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Daihatsu', model: 'Gran Max',    years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b68b3b5?w=600&auto=format&fit=crop' },

  // ── Nissan ────────────────────────────────────────────────
  { brand: 'Nissan', model: 'Livina',         years: [2019,2020,2021,2022],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop' },
  { brand: 'Nissan', model: 'Grand Livina',   years: [2019,2020,2021],                type: 'Mobil', photo: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&auto=format&fit=crop' },
  { brand: 'Nissan', model: 'Juke',           years: [2019,2020,2021,2022],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1535747790212-3068e65e1ca0?w=600&auto=format&fit=crop' },
  { brand: 'Nissan', model: 'X-Trail',        years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1535747790212-3068e65e1ca0?w=600&auto=format&fit=crop' },
  { brand: 'Nissan', model: 'Terra',          years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1511919884226-fd94a4d4af6d?w=600&auto=format&fit=crop' },

  // ── Wuling ────────────────────────────────────────────────
  { brand: 'Wuling', model: 'Confero',       years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop' },
  { brand: 'Wuling', model: 'Almaz',         years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop' },
  { brand: 'Wuling', model: 'Air EV',        years: [2022,2023,2024],                type: 'Mobil', photo: 'https://images.unsplash.com/photo-1619767886558-ef5f734c8eb5?w=600&auto=format&fit=crop' },

  // ── Mazda ─────────────────────────────────────────────────
  { brand: 'Mazda', model: 'CX-5',           years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Mazda', model: 'CX-3',           years: [2019,2020,2021,2022],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'Mazda', model: 'Mazda2',         years: [2019,2020,2021,2022,2023],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop' },

  // ── KIA ───────────────────────────────────────────────────
  { brand: 'KIA', model: 'Sonet',             years: [2021,2022,2023,2024],           type: 'Mobil', photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop' },
  { brand: 'KIA', model: 'Seltos',            years: [2020,2021,2022,2023,2024],      type: 'Mobil', photo: 'https://images.unsplash.com/photo-1535747790212-3068e65e1ca0?w=600&auto=format&fit=crop' },

  // ── Hyundai ───────────────────────────────────────────────
  { brand: 'Hyundai', model: 'Creta',        years: [2022,2023,2024],                type: 'Mobil', photo: 'https://images.unsplash.com/photo-1535747790212-3068e65e1ca0?w=600&auto=format&fit=crop' },
  { brand: 'Hyundai', model: 'Tucson',       years: [2019,2020,2021,2022,2023,2024], type: 'Mobil', photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop' },
  { brand: 'Hyundai', model: 'Ioniq 5',      years: [2022,2023,2024],                type: 'Mobil', photo: 'https://images.unsplash.com/photo-1619767886558-ef5f734c8eb5?w=600&auto=format&fit=crop' },
]

// Daftar brand unik untuk filter
export const catalogBrands = [...new Set(vehicleCatalog.map(v => v.brand))].sort()

// Fungsi search katalog
export function searchCatalog(query) {
  if (!query || query.trim().length < 1) return []
  const q = query.toLowerCase().trim()
  return vehicleCatalog.filter(v =>
    v.brand.toLowerCase().includes(q) ||
    v.model.toLowerCase().includes(q) ||
    `${v.brand} ${v.model}`.toLowerCase().includes(q)
  ).slice(0, 8)
}
