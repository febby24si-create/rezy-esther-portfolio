// ============================================================
// AddressModal.jsx
// Modal untuk Tambah / Edit saved address dengan MapPicker
// ============================================================
import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdLocationOn, MdSave } from 'react-icons/md'
import { ADDRESS_TYPES } from '../../lib/deliveryEngine'

const MapPicker = lazy(() => import('../map/MapPicker'))

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
const inputFocusStyle = { border: '1px solid rgba(34,197,94,0.35)' }

function FormInput({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function AddressModal({ open, address, onSave, onClose }) {
  const isEdit = !!address?.id

  const [form, setForm] = useState({
    type: 'rumah',
    label: '',
    recipient_name: '',
    phone: '',
    full_address: '',
    notes: '',
    latitude: null,
    longitude: null,
    province: '',
    city: '',
    district: '',
    postal_code: '',
    is_default: false,
  })
  const [mapLocation, setMapLocation] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    if (open && address) {
      setForm({
        type: address.type || 'rumah',
        label: address.label || '',
        recipient_name: address.recipient_name || '',
        phone: address.phone || '',
        full_address: address.full_address || '',
        notes: address.notes || '',
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        postal_code: address.postal_code || '',
        is_default: address.is_default || false,
      })
      if (address.latitude && address.longitude) {
        setMapLocation({ lat: address.latitude, lng: address.longitude })
      }
    } else if (open && !address) {
      setForm({ type: 'rumah', label: '', recipient_name: '', phone: '', full_address: '', notes: '', latitude: null, longitude: null, province: '', city: '', district: '', postal_code: '', is_default: false })
      setMapLocation(null)
    }
    setErrors({})
  }, [open, address])

  const handleMapChange = (loc) => {
    setMapLocation({ lat: loc.lat, lng: loc.lng })
    setForm(f => ({
      ...f,
      latitude: loc.lat,
      longitude: loc.lng,
      full_address: loc.fullAddress || f.full_address,
      province: loc.province || f.province,
      city: loc.city || f.city,
      district: loc.district || f.district,
      postal_code: loc.postalCode || f.postal_code,
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.recipient_name.trim()) e.recipient_name = 'Nama penerima wajib diisi'
    if (!form.phone.trim()) e.phone = 'Nomor HP wajib diisi'
    if (!form.full_address.trim()) e.full_address = 'Pilih lokasi di peta atau isi alamat'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave?.({ ...form, label: form.label || ADDRESS_TYPES[form.type]?.label })
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70"
            style={{ backdropFilter: 'blur(6px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div className="w-full sm:max-w-2xl max-h-screen sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
              style={{ background: 'rgba(4,14,9,0.98)', border: '1px solid rgba(34,197,94,0.15)', backdropFilter: 'blur(24px)' }}>

              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
                style={{ background: 'rgba(4,14,9,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h2 className="text-white font-extrabold text-lg">{isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Pin lokasi di peta atau isi manual</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all">
                  <MdClose size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Tipe Alamat */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium">Tipe Alamat</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(ADDRESS_TYPES).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setForm(f => ({ ...f, type: key }))}
                        className="py-2.5 rounded-xl text-sm transition-all flex flex-col items-center gap-1"
                        style={{
                          background: form.type === key ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
                          border: form.type === key ? `1.5px solid ${cfg.color}50` : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="text-xs font-semibold" style={{ color: form.type === key ? cfg.color : '#6B7280' }}>{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label Kustom */}
                <FormInput label="Nama Alamat (Opsional)">
                  <input
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    onFocus={() => setFocusedField('label')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={`Contoh: Rumah Mama, Kantor Lama...`}
                    className={inputCls}
                    style={focusedField === 'label' ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
                  />
                </FormInput>

                {/* Map */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium flex items-center gap-1.5">
                    <MdLocationOn size={14} className="text-green-400" />
                    Pilih Lokasi di Peta
                  </label>
                  <Suspense fallback={
                    <div className="h-[300px] rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-gray-500 text-sm">Memuat peta...</p>
                    </div>
                  }>
                    <MapPicker value={mapLocation} onChange={handleMapChange} height={300} />
                  </Suspense>
                </div>

                {/* Auto-filled dari geocoding */}
                {form.full_address && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                  >
                    <p className="text-green-400 text-xs font-semibold mb-1">📍 Lokasi Terdeteksi</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{form.full_address}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[form.district, form.city, form.province, form.postal_code].filter(Boolean).map((v, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[10px] text-gray-400" style={{ background: 'rgba(255,255,255,0.06)' }}>{v}</span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Alamat manual override */}
                <FormInput label="Alamat Lengkap" required>
                  <textarea
                    value={form.full_address}
                    onChange={e => setForm(f => ({ ...f, full_address: e.target.value }))}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    rows={2}
                    placeholder="Otomatis terisi dari peta, atau ketik manual..."
                    className={`${inputCls} resize-none`}
                    style={focusedField === 'address' ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
                  />
                  {errors.full_address && <p className="text-red-400 text-xs mt-1">{errors.full_address}</p>}
                </FormInput>

                {/* Penerima & HP */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormInput label="Nama Penerima" required>
                    <input
                      value={form.recipient_name}
                      onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Nama lengkap"
                      className={inputCls}
                      style={focusedField === 'name' ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
                    />
                    {errors.recipient_name && <p className="text-red-400 text-xs mt-1">{errors.recipient_name}</p>}
                  </FormInput>
                  <FormInput label="Nomor HP" required>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="08xxxxxxxxxx"
                      className={inputCls}
                      style={focusedField === 'phone' ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </FormInput>
                </div>

                {/* Catatan */}
                <FormInput label="Catatan (Opsional)">
                  <input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    onFocus={() => setFocusedField('notes')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Contoh: Depan warung merah, masuk gang kiri"
                    className={inputCls}
                    style={focusedField === 'notes' ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
                  />
                </FormInput>

                {/* Default */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
                    className={`w-11 h-6 rounded-full transition-all relative ${form.is_default ? 'bg-green-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_default ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Jadikan alamat default</span>
                </label>

                {/* Save button */}
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
                >
                  {saving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <><MdSave size={16} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Alamat'}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
