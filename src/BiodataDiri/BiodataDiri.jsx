// components/BiodataDiri.jsx
// Parent component — merakit semua child component dengan data biodata

import FotoProfil  from './FotoProfil';
import Nama        from './Nama';
import TentangSaya from './TentangSaya';
import Pendidikan  from './Pendidikan';
import Skill       from './Skill';
import Kontak      from './Kontak';
import './custom.css';

const biodata = {
  // ── FotoProfil ──
  foto: "/ree.jpeg", 
  
  stats: [
    { value: '3+',  label: 'Tahun' },
    { value: '20+', label: 'Proyek' },
    { value: '8',   label: 'Klien' },
  ],

  // ── Nama ──
  namaDepan: 'Febby',
  namaBelakang: 'Fahrezy',
  // gelar: 'S.T. — Sarjana Ilmu Komputer',
  meta: [
    { icon: '📍', value: 'Bukittingi, Sumatera Barat' },
    { icon: '🎂', value: '18 Tahun' },
    { icon: '💼', value: 'Mahasiswa' },
    { icon: '🌐', value: 'Bahasa: ID,EN,JP,KR,CH' },
  ],

  // ── TentangSaya ──
  paragraphs: [
    `Halo! Saya adalah seorang <span class="tentang-highlight">Mahasiswa & Web Developer</span>
    yang memiliki minat besar dalam pengembangan aplikasi web. Saya telah mengerjakan
    berbagai proyek selama perkuliahan yang membantu saya memahami alur pengembangan sistem secara nyata.`,

    `Saya memiliki kemampuan di bidang <span class="tentang-highlight">Laravel, CodeIgniter 3</span>,
    serta pengelolaan database. Saya terbiasa membuat fitur seperti CRUD, autentikasi,
    dan sistem manajemen data sederhana hingga menengah.`,

    `Saya terus berusaha mengembangkan kemampuan saya dengan belajar teknologi baru
    dan membangun proyek secara mandiri. Bagi saya, proses belajar dan praktik langsung
    adalah kunci untuk menjadi developer yang lebih baik.`
  ],
  quote: 'Hidup segan mati ndak mau',

  // ── Pendidikan ──
  pendidikan: [
    {
      periode:   '2024 – Sekarang',
      institusi: 'Politeknik Caltex Riau',
      jurusan:   'Sistem Informasi — D4',
      ipk:       '-',
    },
    {
      periode:   '2021 – 2023',
      institusi: 'SMKN 1 Tilatang Kamang',
      jurusan:   'Teknik Komputer Jaringan — SMK',
      ipk:       null,
    },
  ],

  // ── Skill ──
  skillGroups: [
    {
      category: 'Frontend',
      items: [
        { name: 'React.js',    level: 'expert'   },
        { name: 'Next.js',     level: 'expert'   },
        { name: 'TypeScript',  level: 'advanced' },
        { name: 'Tailwind CSS',level: 'advanced' },
        { name: 'Vite',        level: 'advanced' },
      ],
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js',     level: 'expert'   },
        { name: 'Express',     level: 'expert'   },
        { name: 'PostgreSQL',  level: 'advanced' },
        { name: 'MongoDB',     level: 'mid'      },
        { name: 'REST API',    level: 'expert'   },
      ],
    },
    {
      category: 'Tools & DevOps',
      items: [
        { name: 'Git & GitHub', level: 'expert'   },
        { name: 'Docker',       level: 'mid'      },
        { name: 'Figma',        level: 'advanced' },
        { name: 'Linux',        level: 'mid'      },
        { name: 'Vercel',       level: 'advanced' },
      ],
    },
  ],
  proficiency: [
    { name: 'React.js',   pct: 92 },
    { name: 'Node.js',    pct: 85 },
    { name: 'TypeScript', pct: 78 },
    { name: 'PostgreSQL', pct: 72 },
  ],

  // ── Kontak ──
  kontak: [
    {
      type:  'email',
      icon:  '✉️',
      label: 'Email',
      value: 'febby24si@mahasiswa.pcr.ac.id',
      href:  'mailto:febby24si@mahasiswa.pcr.ac.id',
    },
    {
      type:  'phone',
      icon:  '📱',
      label: 'WhatsApp',
      value: '+62 887-0823-0676',
      href:  'https://wa.me/6288708230676',
    },
    {
      type:  'linkedin',
      icon:  '💼',
      label: 'LinkedIn',
      value: 'linkedin.com/in/Febby-Fahrezy',
      href:  'www.linkedin.com/in/febby-fahrezy-ab3566304',
    },
    {
      type:  'github',
      icon:  '🐙',
      label: 'GitHub',
      value: 'github.com/febby-24si-create',
      href:  'https://github.com/febby24si-create',
    }, 
    {
      type:  'location',
      icon:  '📍',
      label: 'Lokasi',
      value: 'Bukittinggi, Sumatera Barat',
      href:  null,
    },
    // {
    //   type:  'website',
    //   icon:  '🌐',
    //   label: 'Website',
    //   value: 'fauzandev.id',
    //   href:  'https://example.com',
    // },
  ],
};

// ─────────────────────────────────────────
// PARENT COMPONENT
// ─────────────────────────────────────────
const BiodataDiri = () => {
  return (
    <>
      {/* ── Header Halaman ── */}
      <header className="page-header">
        <span className="label">Portofolio · 2026</span>
        <h1>
          Developer <em>Profile</em>
        </h1>
        <div className="divider" />
      </header>

      {/* ── Grid Utama ── */}
      <main className="biodata-container">

        {/* 1. Foto Profil (sidebar kiri) */}
        <FotoProfil
          nama={`${biodata.namaDepan} ${biodata.namaBelakang}`}
          role={biodata.meta[2].value}
          foto={biodata.foto}
          stats={biodata.stats}
          available={biodata.available}
        />

        {/* 2. Nama */}
        <Nama
          namaDepan={biodata.namaDepan}
          namaBelakang={biodata.namaBelakang}
          gelar={biodata.gelar}
          meta={biodata.meta}
        />

        {/* 3. Tentang Saya */}
        <TentangSaya
          paragraphs={biodata.paragraphs}
          quote={biodata.quote}
        />

        {/* 4. Pendidikan */}
        <Pendidikan riwayat={biodata.pendidikan} />

        {/* 5. Skill */}
        <Skill
          groups={biodata.skillGroups}
          proficiency={biodata.proficiency}
        />

        {/* 6. Kontak */}
        <Kontak items={biodata.kontak} />

      </main>
    </>
  );
};

export default BiodataDiri;