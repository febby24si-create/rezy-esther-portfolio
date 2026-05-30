/**
 * Components.jsx — Halaman showcase semua reusable component
 * Route: /components
 */
import { useState } from 'react'
import {
  MdBuild, MdPeople, MdDirectionsCar, MdBarChart,
  MdShield, MdSearch, MdAdd, MdDelete, MdEdit,
  MdStar, MdCheckCircle, MdEngineering, MdPhone,
  MdEmail, MdCalendarToday,
} from 'react-icons/md'

import PageHeader      from '../components/PageHeader'
import Button          from '../components/Button'
import Badge           from '../components/Badge'
import Avatar          from '../components/Avatar'
import Card            from '../components/Card'
import ProductCard     from '../components/ProductCard'
import Table, { TableRow, Td } from '../components/Table'
import InputField      from '../components/InputField'
import TextArea        from '../components/TextArea'
import SelectField     from '../components/SelectField'
import Alert           from '../components/Alert'
import Modal           from '../components/Modal'
import Spinner         from '../components/Spinner'
import HeroSection     from '../components/HeroSection'
import FeatureSection  from '../components/FeatureSection'
import ProductSection  from '../components/ProductSection'
import Footer          from '../components/Footer'

// ─── Data Demo ───────────────────────────────────────────────────────────────

const heroStats = [
  { label: 'Total Order',   value: '1.2k', icon: MdBuild,       color: '34,197,94'  },
  { label: 'Pelanggan',     value: '348',  icon: MdPeople,      color: '59,130,246' },
  { label: 'Mekanik Aktif', value: '12',   icon: MdEngineering, color: '234,179,8'  },
  { label: 'Revenue',       value: '98jt', icon: MdBarChart,    color: '168,85,247' },
]

const features = [
  {
    icon: MdBuild,
    title: 'Manajemen Order',
    description: 'Kelola semua order servis dengan mudah, dari penerimaan hingga selesai.',
    color: '34,197,94',
    tag: 'Core',
  },
  {
    icon: MdPeople,
    title: 'Data Pelanggan',
    description: 'Database pelanggan lengkap dengan riwayat servis dan preferensi kendaraan.',
    color: '59,130,246',
  },
  {
    icon: MdDirectionsCar,
    title: 'Inventaris Kendaraan',
    description: 'Rekam semua kendaraan beserta kondisi dan riwayat perawatan secara detail.',
    color: '234,179,8',
  },
  {
    icon: MdEngineering,
    title: 'Jadwal Mekanik',
    description: 'Atur penugasan mekanik secara efisien berdasarkan keahlian dan ketersediaan.',
    color: '168,85,247',
  },
  {
    icon: MdBarChart,
    title: 'Laporan & Analitik',
    description: 'Insight revenue, performa mekanik, dan tren layanan dalam grafik interaktif.',
    color: '249,115,22',
    tag: 'Pro',
  },
  {
    icon: MdShield,
    title: 'Keamanan Data',
    description: 'Sistem autentikasi berlapis dan enkripsi data pelanggan secara penuh.',
    color: '20,184,166',
  },
]

const services = [
  {
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80',
    title: 'Tune Up Mesin',
    category: 'Mesin',
    price: 'Rp 350.000',
    description: 'Servis lengkap tune up mesin agar performa kendaraan tetap optimal dan hemat BBM.',
    badge: 'Populer',
    badgeVariant: 'success',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    title: 'Ganti Oli & Filter',
    category: 'Oli',
    price: 'Rp 180.000',
    description: 'Penggantian oli mesin dan filter oli dengan produk berkualitas untuk ketahanan mesin.',
    badgeVariant: 'info',
  },
  {
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80',
    title: 'Servis Rem',
    category: 'Keselamatan',
    price: 'Rp 250.000',
    description: 'Pemeriksaan dan penggantian kampas rem serta minyak rem untuk keselamatan berkendara.',
    badge: 'Penting',
    badgeVariant: 'warning',
  },
]

const tableHeaders = ['No', 'Nama Mekanik', 'Spesialisasi', 'Status', 'Rating', 'Aksi']

const mechanics = [
  { id: 1, name: 'Budi Santoso',  spec: 'Mesin & Transmisi', status: 'Aktif',    rating: 4.9 },
  { id: 2, name: 'Dani Pratama',  spec: 'Kelistrikan',       status: 'Sibuk',    rating: 4.7 },
  { id: 3, name: 'Rizky Aditya',  spec: 'Body & Cat',        status: 'Aktif',    rating: 4.8 },
  { id: 4, name: 'Hendra Wijaya', spec: 'Kaki-kaki',         status: 'Off Duty', rating: 4.5 },
]

const statusVariant = { Aktif: 'success', Sibuk: 'warning', 'Off Duty': 'default' }
const statusStatus  = { Aktif: 'online',  Sibuk: 'busy',    'Off Duty': 'offline' }

const avatarPeople = [
  { name: 'Budi Santoso',  status: 'online'  },
  { name: 'Dani Pratama',  status: 'busy'    },
  { name: 'Rizky Aditya',  status: 'online'  },
  { name: 'Hendra Wijaya', status: 'offline' },
  { name: 'Siti Rahayu',   status: 'away'    },
]

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ id, label, children }) {
  return (
    <section id={id} className="space-y-5">
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: 'linear-gradient(180deg, #22C55E, #16A34A)' }}
        />
        <h2 className="font-display font-bold text-white text-xl tracking-wide">{label}</h2>
      </div>
      {children}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Components() {
  const [inputVal,    setInputVal]    = useState('')
  const [textareaVal, setTextareaVal] = useState('')
  const [selectVal,   setSelectVal]   = useState('')
  const [inputErr,    setInputErr]    = useState('')

  const [alerts, setAlerts] = useState({
    success: true, danger: true, warning: true, info: true,
  })

  const [modal,    setModal]    = useState({ open: false, type: '' })
  const [spinning, setSpinning] = useState(false)

  const dismissAlert = (key) => setAlerts(a => ({ ...a, [key]: false }))
  const resetAlerts  = () => setAlerts({ success: true, danger: true, warning: true, info: true })

  const simulateLoad = () => {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 2000)
  }

  const closeModal = () => setModal({ open: false, type: '' })

  return (
    <div className="page-animate space-y-14 pb-0">

      <PageHeader title="Component Library" breadcrumb={['Components']}>
        <Badge variant="success" dot>v1.0 — Pertemuan 10</Badge>
      </PageHeader>

      {/* ═══ 1. SECTION COMPONENTS ═══ */}
      <Section id="section" label="Section Components">
        <HeroSection
          title="Kelola Bengkel"
          titleAccent="Lebih Efisien"
          subtitle="Platform Manajemen Bengkel Modern"
          description="Pantau order servis, kelola pelanggan, track mekanik, dan analisis laporan — semua dalam satu dashboard terintegrasi."
          stats={heroStats}
        />

        <FeatureSection
          title="Semua yang kamu butuhkan"
          subtitle="Fitur lengkap untuk manajemen bengkel profesional"
          features={features}
        />

        <ProductSection
          title="Layanan Bengkel"
          subtitle="Pilih paket servis terbaik untuk kendaraan Anda"
          products={services}
          columns={3}
        />
      </Section>

      {/* ═══ 2. BASIC COMPONENTS ═══ */}
      <Section id="basic" label="Basic Components">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Button */}
          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Button Variants</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <Button variant="primary"   size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="danger"    size="sm">Danger</Button>
              <Button variant="warning"   size="sm">Warning</Button>
              <Button variant="outline"   size="sm">Outline</Button>
              <Button variant="ghost"     size="sm">Ghost</Button>
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Sizes</p>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <Button size="xs">XSmall</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Dengan Icon</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <Button size="sm" icon={MdAdd}    variant="primary">Tambah</Button>
              <Button size="sm" icon={MdEdit}   variant="secondary">Edit</Button>
              <Button size="sm" icon={MdDelete} variant="danger">Hapus</Button>
              <Button size="sm" icon={MdSearch} variant="outline">Cari</Button>
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">State</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" loading>Loading...</Button>
              <Button size="sm" disabled>Disabled</Button>
            </div>
          </Card>

          {/* Badge */}
          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Badge Variants</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant="success">Selesai</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Batal</Badge>
              <Badge variant="info">Baru</Badge>
              <Badge variant="default">Draft</Badge>
              <Badge variant="purple">Premium</Badge>
              <Badge variant="orange">Hot</Badge>
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Badge + Dot</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant="success" dot>Online</Badge>
              <Badge variant="danger"  dot>Offline</Badge>
              <Badge variant="warning" dot>Sibuk</Badge>
              <Badge variant="info"    dot>Standby</Badge>
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </Card>

          {/* Avatar */}
          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Avatar — Initials & Status</p>
            <div className="flex items-center gap-3 flex-wrap mb-5">
              {avatarPeople.map(({ name, status }) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <Avatar name={name} status={status} size="md" />
                  <span className="text-xs text-gray-600">{name.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Sizes</p>
            <div className="flex items-end gap-3 mb-5">
              {['xs','sm','md','lg','xl'].map(s => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <Avatar name="Budi Santoso" size={s} status="online" />
                  <span className="text-xs text-gray-600">{s}</span>
                </div>
              ))}
            </div>

            <hr className="section-divider" />
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Avatar Stack</p>
            <div className="flex -space-x-2">
              {avatarPeople.map(({ name }) => (
                <Avatar key={name} name={name} size="md" className="border-2 border-[#041C15]" />
              ))}
              <div
                className="w-10 h-10 rounded-xl border-2 border-[#041C15] flex items-center justify-center text-xs font-bold text-gray-400"
                style={{ background: 'rgba(11,59,46,0.8)' }}
              >
                +8
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══ 3. DATA DISPLAY ═══ */}
      <Section id="data" label="Data Display Components">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">Card Default</p>
            <p className="text-gray-400 text-sm">Glass-morphism card standar dengan border subtle dan backdrop blur.</p>
          </Card>
          <Card hover>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">Card Hover</p>
            <p className="text-gray-400 text-sm">Hover card ini untuk melihat efek elevasi dan glow hijau.</p>
            <div className="mt-3"><Badge variant="success" size="sm" dot>Hover me</Badge></div>
          </Card>
          <Card neon>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">Card Neon</p>
            <p className="text-gray-400 text-sm">Card dengan neon border — cocok untuk highlight konten penting.</p>
            <div className="mt-3"><Badge variant="warning" size="sm">Featured</Badge></div>
          </Card>
        </div>

        <Table headers={tableHeaders}>
          {mechanics.map((m, i) => (
            <TableRow key={m.id}>
              <Td>{i + 1}</Td>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" status={statusStatus[m.status]} />
                  <span className="text-white font-medium">{m.name}</span>
                </div>
              </Td>
              <Td><span className="text-gray-400">{m.spec}</span></Td>
              <Td><Badge variant={statusVariant[m.status] ?? 'default'} dot>{m.status}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1">
                  <MdStar size={14} className="text-yellow-400" />
                  <span className="text-white font-semibold">{m.rating}</span>
                </div>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button variant="secondary" size="xs" icon={MdEdit}>Edit</Button>
                  <Button variant="danger"    size="xs" icon={MdDelete}>Hapus</Button>
                </div>
              </Td>
            </TableRow>
          ))}
        </Table>
      </Section>

      {/* ═══ 4. FORM COMPONENTS ═══ */}
      <Section id="form" label="Form Components">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-5">Input Fields</p>
            <div className="space-y-4">
              <InputField
                label="Nama Pelanggan"
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value)
                  setInputErr(e.target.value.length < 3 && e.target.value ? 'Nama terlalu pendek' : '')
                }}
                icon={MdPeople}
                error={inputErr}
                required
                hint="Masukkan nama sesuai KTP"
              />
              <InputField
                label="No. Telepon"
                id="phone"
                type="tel"
                placeholder="+62 812-xxxx-xxxx"
                icon={MdPhone}
              />
              <InputField
                label="Email"
                id="email"
                type="email"
                placeholder="user@email.com"
                icon={MdEmail}
              />
              <InputField
                label="Input Disabled"
                id="disabled-input"
                placeholder="Tidak dapat diedit"
                disabled
                icon={MdCalendarToday}
              />
            </div>
          </Card>

          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-5">TextArea & SelectField</p>
            <div className="space-y-4">
              <TextArea
                label="Keluhan Kendaraan"
                id="keluhan"
                placeholder="Jelaskan masalah yang dialami kendaraan Anda..."
                value={textareaVal}
                onChange={e => setTextareaVal(e.target.value)}
                rows={4}
                maxLength={300}
                required
              />
              <SelectField
                label="Jenis Layanan"
                id="layanan"
                value={selectVal}
                onChange={e => setSelectVal(e.target.value)}
                placeholder="Pilih jenis servis..."
                options={[
                  { value: 'tune-up', label: 'Tune Up Mesin'         },
                  { value: 'oli',     label: 'Ganti Oli & Filter'    },
                  { value: 'rem',     label: 'Servis Rem'            },
                  { value: 'ac',      label: 'Servis AC'             },
                  { value: 'ban',     label: 'Rotasi & Balancing Ban' },
                ]}
              />
              <SelectField
                label="Prioritas"
                id="prioritas"
                placeholder="Pilih prioritas..."
                options={['Normal', 'Urgent', 'Kritis']}
                error="Wajib dipilih sebelum submit"
              />
              <Button variant="primary" size="md" className="w-full justify-center" icon={MdCheckCircle}>
                Submit Form
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══ 5. FEEDBACK COMPONENTS ═══ */}
      <Section id="feedback" label="Feedback Components">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Alert Variants</p>
            <div className="space-y-3">
              {alerts.success && (
                <Alert variant="success" title="Order Berhasil Dibuat" onClose={() => dismissAlert('success')}>
                  Order #ORD-2024-001 berhasil disimpan dan siap dikerjakan mekanik.
                </Alert>
              )}
              {alerts.danger && (
                <Alert variant="danger" title="Gagal Menyimpan" onClose={() => dismissAlert('danger')}>
                  Terjadi kesalahan koneksi. Silakan coba lagi dalam beberapa saat.
                </Alert>
              )}
              {alerts.warning && (
                <Alert variant="warning" title="Stok Oli Menipis" onClose={() => dismissAlert('warning')}>
                  Stok oli mesin 10W-30 tersisa 3 liter. Segera lakukan pemesanan ulang.
                </Alert>
              )}
              {alerts.info && (
                <Alert variant="info" title="Pembaruan Sistem" onClose={() => dismissAlert('info')}>
                  Versi terbaru v2.4.1 tersedia. Pembaruan akan diterapkan saat sistem idle.
                </Alert>
              )}
              {Object.values(alerts).every(v => !v) && (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-sm mb-3">Semua alert sudah ditutup.</p>
                  <Button variant="outline" size="sm" onClick={resetAlerts}>Reset Alert</Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Modal</p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="primary"   size="sm" onClick={() => setModal({ open: true, type: 'info'    })}>Modal Info</Button>
              <Button variant="danger"    size="sm" onClick={() => setModal({ open: true, type: 'confirm' })}>Modal Konfirmasi</Button>
              <Button variant="secondary" size="sm" onClick={() => setModal({ open: true, type: 'form'    })}>Modal Form</Button>
            </div>

            <hr className="section-divider" />

            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Loading Spinner</p>
            <div className="flex flex-wrap items-end gap-6 mb-5">
              {['xs','sm','md','lg'].map(s => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Spinner size={s} />
                  <span className="text-xs text-gray-600">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Spinner size="sm" variant="green" label="Memuat data..." />
              <Button variant="outline" size="sm" loading={spinning} onClick={simulateLoad}>
                {spinning ? 'Loading...' : 'Simulasi Loading'}
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <Footer />

      {/* ═══ MODALS ═══ */}

      {/* Modal Info */}
      <Modal
        isOpen={modal.open && modal.type === 'info'}
        onClose={closeModal}
        title="Detail Order #ORD-2024-001"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>Tutup</Button>
            <Button variant="primary"   size="sm" icon={MdEdit}>Edit Order</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="success" title="Order Selesai">
            Kendaraan sudah siap diambil oleh pelanggan.
          </Alert>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Pelanggan', 'Budi Santoso'],
              ['Kendaraan', 'Toyota Avanza 2020'],
              ['Layanan',   'Tune Up Mesin'],
              ['Mekanik',   'Dani Pratama'],
              ['Total',     'Rp 350.000'],
              ['Tanggal',   '29 Mei 2025'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(11,59,46,0.3)' }}>
                <p className="text-xs text-gray-600 mb-0.5">{label}</p>
                <p className="text-white text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi */}
      <Modal
        isOpen={modal.open && modal.type === 'confirm'}
        onClose={closeModal}
        title="Konfirmasi Hapus"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>Batal</Button>
            <Button variant="danger"    size="sm" icon={MdDelete} onClick={closeModal}>Ya, Hapus</Button>
          </>
        }
      >
        <Alert variant="warning" title="Tindakan tidak dapat dibatalkan">
          Data mekanik <strong className="text-white">Budi Santoso</strong> akan dihapus secara permanen dari sistem.
        </Alert>
      </Modal>

      {/* Modal Form */}
      <Modal
        isOpen={modal.open && modal.type === 'form'}
        onClose={closeModal}
        title="Tambah Mekanik Baru"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>Batal</Button>
            <Button variant="primary"   size="sm" icon={MdCheckCircle} onClick={closeModal}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <InputField label="Nama Lengkap" id="m-nama"  placeholder="Nama mekanik" icon={MdPeople} required />
          <InputField label="No. Telepon"  id="m-phone" placeholder="+62..." type="tel" icon={MdPhone} />
          <SelectField
            label="Spesialisasi"
            id="m-spec"
            placeholder="Pilih keahlian utama..."
            options={['Mesin & Transmisi','Kelistrikan','Body & Cat','Kaki-kaki','AC & Pendingin']}
          />
          <TextArea label="Catatan" id="m-notes" placeholder="Catatan tambahan..." rows={3} />
        </div>
      </Modal>
    </div>
  )
}