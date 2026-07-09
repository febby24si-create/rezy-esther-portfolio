// ============================================================
// pages/OrderDetail.jsx — Order Workflow Management
//
// Halaman detail order yang menampilkan dan mengelola
// seluruh lifecycle order dari Inspection hingga QC.
//
// WORKFLOW YANG DIHANDLE:
//   Inspection → Estimasi → Waiting Approval → Work Order
//   → QC (Sprint 5) → Payment (Sprint 5)
//
// ARSITEKTUR:
//   - Baca order dari garage_orders (via getAllOrders)
//   - Semua transisi stage via workflowEngine.js
//   - workflowEngine menulis via orderStorage.updateOrder
//   - Komponen ini TIDAK menulis langsung ke sessionStorage
//   - Tiap stage ditampilkan sebagai panel aktif/selesai
//
// POLA KONSISTEN:
//   - AnimatedPage, PageHeader dari project
//   - Framer Motion untuk transisi panel stage
//   - Design token dark green automotive
//   - Lucide React icons (konsisten dengan Sprint 2)
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ClipboardList, Wrench, FileText, CheckCircle2,
  AlertCircle, Clock, ChevronRight, Plus, Minus, Check,
  X, RefreshCw, Car, User, Calendar, DollarSign, Package,
  ThumbsUp, ThumbsDown, RotateCcw, Eye, ShieldCheck,
  AlertTriangle, Hammer,
} from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import PageHeader from '../components/PageHeader'
import { getOrderById } from '../lib/orderStorage'
import {
  WORKFLOW_STAGE, APPROVAL_STATUS,
  INSPECTION_CHECKLIST, INSPECTION_STATUS,
  QC_CHECKLIST,
  startInspection, completeInspection,
  saveEstimation,
  approveEstimation, requestEstimationRevision,
  startQC, completeQC,
  startWork, completeOrder,
} from '../lib/workflowEngine'

// ─── HELPERS ──────────────────────────────────────────────────
const fmt  = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const now  = () => new Date().toISOString()

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1)  return 'baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

const STAGE_META = {
  [WORKFLOW_STAGE.PENDING]:          { label: 'Menunggu',          color: '#94A3B8', icon: Clock },
  [WORKFLOW_STAGE.INSPECTION]:       { label: 'Inspeksi',          color: '#60A5FA', icon: ClipboardList },
  [WORKFLOW_STAGE.ESTIMATION]:       { label: 'Estimasi',          color: '#F59E0B', icon: FileText },
  [WORKFLOW_STAGE.WAITING_APPROVAL]: { label: 'Waiting Approval',  color: '#FB923C', icon: Clock },
  [WORKFLOW_STAGE.WORK_ORDER]:       { label: 'Work Order',        color: '#A78BFA', icon: Hammer },
  [WORKFLOW_STAGE.QC]:               { label: 'Quality Control',   color: '#34D399', icon: ShieldCheck },
  [WORKFLOW_STAGE.READY_PICKUP]:     { label: 'Siap Diambil',      color: '#4ADE80', icon: CheckCircle2 },
  [WORKFLOW_STAGE.COMPLETED]:        { label: 'Selesai',           color: '#3B82F6', icon: CheckCircle2 },
  [WORKFLOW_STAGE.CANCELLED]:        { label: 'Dibatalkan',        color: '#EF4444', icon: X },
}

const STAGE_ORDER = [
  WORKFLOW_STAGE.PENDING,
  WORKFLOW_STAGE.INSPECTION,
  WORKFLOW_STAGE.ESTIMATION,
  WORKFLOW_STAGE.WAITING_APPROVAL,
  WORKFLOW_STAGE.WORK_ORDER,
  WORKFLOW_STAGE.QC,
  WORKFLOW_STAGE.READY_PICKUP,
  WORKFLOW_STAGE.COMPLETED,
]

const INSPECTION_RESULT_CFG = {
  [INSPECTION_STATUS.OK]:        { label: 'OK',       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  [INSPECTION_STATUS.ATTENTION]: { label: 'Perhatian', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  [INSPECTION_STATUS.REPLACE]:   { label: 'Ganti',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  [INSPECTION_STATUS.SKIPPED]:   { label: '—',         color: '#4B5563', bg: 'rgba(75,85,99,0.1)' },
}

// ─── STAGE PROGRESS BAR ───────────────────────────────────────
function StageProgress({ currentStage }) {
  const stages = STAGE_ORDER.slice(0, -1) // exclude COMPLETED for visual
  const currentIdx = stages.indexOf(currentStage)

  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
      {stages.map((stage, idx) => {
        const meta    = STAGE_META[stage]
        const Icon    = meta.icon
        const done    = idx < currentIdx
        const active  = idx === currentIdx
        const pending = idx > currentIdx

        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${active ? 'scale-110' : ''}`}
                style={{
                  background: done ? `${meta.color}20` : active ? `${meta.color}25` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${done || active ? meta.color : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {done
                  ? <Check size={13} style={{ color: meta.color }} />
                  : <Icon size={13} style={{ color: active ? meta.color : '#374151' }} />
                }
              </div>
              <span className="text-[9px] font-medium whitespace-nowrap"
                style={{ color: active ? meta.color : done ? '#6B7280' : '#374151' }}>
                {meta.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className="w-8 h-0.5 mb-4 flex-shrink-0 transition-all duration-700"
                style={{ background: idx < currentIdx ? '#3B82F633' : 'rgba(255,255,255,0.05)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── ORDER SUMMARY CARD ───────────────────────────────────────
function OrderSummary({ order }) {
  const stage    = order.workflowStage || WORKFLOW_STAGE.PENDING
  const stageMeta = STAGE_META[stage] || STAGE_META[WORKFLOW_STAGE.PENDING]
  const Icon      = stageMeta.icon

  return (
    <div className="rounded-2xl p-5 mb-6"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(59,130,246,0.1)' }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-blue-400 font-bold text-sm mb-0.5">{order.id}</p>
          <p className="text-white font-bold text-lg">{order.customer}</p>
          <p className="text-gray-500 text-sm">{order.vehicle}</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
          style={{ background: `${stageMeta.color}15`, color: stageMeta.color, border: `1px solid ${stageMeta.color}30` }}>
          <Icon size={12} />
          {stageMeta.label}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Wrench,   label: 'Layanan',  value: order.service },
          { icon: User,     label: 'Mekanik',  value: order.mechanic || 'Belum assign' },
          { icon: Calendar, label: 'Tanggal',  value: order.date },
          { icon: DollarSign, label: 'Estimasi', value: fmt(order.total) },
        ].map(({ icon: I, label, value }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <I size={11} className="text-blue-400" />
              <p className="text-gray-600 text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-white text-xs font-medium truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STAGE: INSPECTION ────────────────────────────────────────
function InspectionPanel({ order, onUpdate }) {
  const stage = order.workflowStage || WORKFLOW_STAGE.PENDING
  const isActive = stage === WORKFLOW_STAGE.INSPECTION
  const isDone   = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(WORKFLOW_STAGE.INSPECTION)

  const [items, setItems] = useState(() => {
    if (order.inspection?.items) return order.inspection.items
    return INSPECTION_CHECKLIST.map(c => ({ ...c, result: INSPECTION_STATUS.SKIPPED, notes: '' }))
  })
  const [notes,   setNotes]   = useState(order.inspection?.notes || '')
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleStart() {
    setLoading(true)
    const result = await startInspection(order.id, { startedBy: 'Admin' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('Inspeksi dimulai.') }
    else showToast(result.error, 'error')
  }

  async function handleComplete() {
    const unanswered = items.filter(i => i.result === INSPECTION_STATUS.SKIPPED).length
    if (unanswered > 0 && !window.confirm(`${unanswered} item belum dicek. Lanjutkan?`)) return

    setLoading(true)
    const result = await completeInspection(order.id, { items, notes, by: 'Admin' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('Inspeksi selesai! Lanjut ke estimasi.') }
    else showToast(result.error, 'error')
  }

  function setItemResult(id, resultVal) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, result: resultVal } : i))
  }

  const categories = [...new Set(INSPECTION_CHECKLIST.map(c => c.category))]

  if (stage === WORKFLOW_STAGE.PENDING) {
    return (
      <Panel title="Inspeksi Kendaraan" icon={ClipboardList} color="#60A5FA" status="pending">
        <p className="text-gray-500 text-sm mb-4">
          Order baru diterima. Mulai inspeksi kendaraan customer.
        </p>
        <button onClick={handleStart} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)' }}>
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <ClipboardList size={14} />}
          Mulai Inspeksi
        </button>
      </Panel>
    )
  }

  if (!isActive && !isDone) return null

  return (
    <Panel title="Inspeksi Kendaraan" icon={ClipboardList} color="#60A5FA"
      status={isDone ? 'done' : 'active'}
      meta={isDone ? `Selesai oleh ${order.inspection?.completedBy} · ${timeAgo(order.inspection?.completedAt)}` : `Dimulai oleh ${order.inspection?.startedBy}`}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#3B82F6',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist */}
      {categories.map(cat => (
        <div key={cat} className="mb-4">
          <p className="text-gray-600 text-[10px] uppercase tracking-wider font-semibold mb-2">{cat}</p>
          <div className="space-y-1.5">
            {items.filter(i => i.category === cat).map(item => {
              const resCfg = INSPECTION_RESULT_CFG[item.result]
              return (
                <div key={item.id} className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-gray-300 text-xs flex-1">{item.label}</span>
                  {isActive ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {Object.entries(INSPECTION_RESULT_CFG).filter(([k]) => k !== INSPECTION_STATUS.SKIPPED).map(([val, cfg]) => (
                        <button key={val} onClick={() => setItemResult(item.id, val)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: item.result === val ? cfg.bg : 'rgba(255,255,255,0.03)',
                            color: item.result === val ? cfg.color : '#4B5563',
                            border: `1px solid ${item.result === val ? cfg.color + '40' : 'rgba(255,255,255,0.05)'}`,
                          }}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0"
                      style={{ background: resCfg.bg, color: resCfg.color }}>
                      {resCfg.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Catatan */}
      {isActive && (
        <div className="mt-4">
          <p className="text-gray-600 text-xs mb-1.5">Catatan Inspeksi (opsional)</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Temuan penting, rekomendasi tambahan..."
            className="w-full text-sm text-white rounded-xl px-3 py-2 resize-none outline-none"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
      )}
      {isDone && order.inspection?.notes && (
        <div className="mt-2 p-3 rounded-xl text-xs text-gray-400"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {order.inspection.notes}
        </div>
      )}

      {isActive && (
        <button onClick={handleComplete} disabled={loading}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff' }}>
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
          Selesaikan Inspeksi → Buat Estimasi
        </button>
      )}
    </Panel>
  )
}

// ─── STAGE: ESTIMASI ──────────────────────────────────────────
function EstimasiPanel({ order, onUpdate }) {
  const stage   = order.workflowStage || WORKFLOW_STAGE.PENDING
  const isActive = stage === WORKFLOW_STAGE.ESTIMATION
  const isDone   = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(WORKFLOW_STAGE.ESTIMATION)
  const canEdit  = isActive || (stage === WORKFLOW_STAGE.WAITING_APPROVAL && order.approvalStatus === APPROVAL_STATUS.REVISION)

  const blankItem = () => ({ description: '', qty: 1, unit: 'pcs', unitPrice: 0, total: 0 })

  const [items,     setItems]     = useState(() => order.estimasi?.items || [blankItem()])
  const [laborCost, setLaborCost] = useState(order.estimasi?.laborCost || 0)
  const [discount,  setDiscount]  = useState(order.estimasi?.discount  || 0)
  const [notes,     setNotes]     = useState(order.estimasi?.notes     || '')
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function updateItem(idx, field, val) {
    setItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: val }
      if (field === 'qty' || field === 'unitPrice') {
        next[idx].total = (field === 'qty' ? Number(val) : next[idx].qty) *
                          (field === 'unitPrice' ? Number(val) : next[idx].unitPrice)
      }
      return next
    })
  }

  const partsCost  = items.reduce((s, i) => s + (Number(i.total) || 0), 0)
  const subtotal   = partsCost + Number(laborCost || 0)
  const grandTotal = Math.max(0, subtotal - Number(discount || 0))

  async function handleSave() {
    if (items.some(i => !i.description.trim())) {
      showToast('Deskripsi item tidak boleh kosong.', 'error'); return
    }
    setLoading(true)
    const result = await saveEstimation(order.id, { items, laborCost: Number(laborCost), discount: Number(discount), notes, by: 'Admin' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('Estimasi disimpan! Menunggu approval customer.') }
    else showToast(result.error, 'error')
  }

  if (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(WORKFLOW_STAGE.ESTIMATION) &&
      stage !== WORKFLOW_STAGE.ESTIMATION) return null

  return (
    <Panel title="Estimasi Biaya" icon={FileText} color="#F59E0B"
      status={isDone && !canEdit ? 'done' : isActive || canEdit ? 'active' : 'locked'}
      meta={order.estimasi ? `v${order.estimasi.version} · ${timeAgo(order.estimasi.updatedAt)}` : undefined}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#3B82F6',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revisi notification */}
      {order.approvalStatus === APPROVAL_STATUS.REVISION && (
        <div className="mb-4 p-3 rounded-xl flex items-start gap-2.5"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <RotateCcw size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-400 text-xs font-semibold">Customer Minta Revisi</p>
            {order.revisionReason && (
              <p className="text-gray-400 text-xs mt-0.5">{order.revisionReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Parts table */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Parts & Material</p>
          {canEdit && (
            <button onClick={() => setItems(p => [...p, blankItem()])}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Plus size={11} /> Tambah
            </button>
          )}
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Deskripsi', 'Qty', 'Satuan', 'Harga/Unit', 'Total', canEdit ? '' : null]
                  .filter(Boolean)
                  .map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-semibold">{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-3 py-2">
                    {canEdit
                      ? <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="Nama parts..."
                          className="w-full bg-transparent text-white outline-none placeholder-gray-700" />
                      : <span className="text-gray-300">{item.description}</span>
                    }
                  </td>
                  <td className="px-3 py-2 w-16">
                    {canEdit
                      ? <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                          className="w-full bg-transparent text-white outline-none text-center" />
                      : <span className="text-gray-300">{item.qty}</span>
                    }
                  </td>
                  <td className="px-3 py-2 w-16">
                    {canEdit
                      ? <input value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}
                          className="w-full bg-transparent text-gray-400 outline-none" />
                      : <span className="text-gray-500">{item.unit}</span>
                    }
                  </td>
                  <td className="px-3 py-2">
                    {canEdit
                      ? <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-transparent text-white outline-none" />
                      : <span className="text-gray-300">{fmt(item.unitPrice)}</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-blue-400 font-semibold whitespace-nowrap">
                    {fmt(item.total)}
                  </td>
                  {canEdit && (
                    <td className="px-3 py-2">
                      <button onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                        className="text-gray-700 hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Labor + discount + total */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">Biaya Parts</span>
          <span className="text-gray-300 text-sm">{fmt(partsCost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">Biaya Jasa</span>
          {canEdit
            ? <input type="number" min="0" value={laborCost} onChange={e => setLaborCost(e.target.value)}
                className="text-right w-32 bg-transparent text-white text-sm outline-none border-b border-gray-700 focus:border-green-400" />
            : <span className="text-gray-300 text-sm">{fmt(laborCost)}</span>
          }
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">Diskon</span>
          {canEdit
            ? <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
                className="text-right w-32 bg-transparent text-yellow-400 text-sm outline-none border-b border-gray-700 focus:border-yellow-400" />
            : <span className="text-yellow-400 text-sm">- {fmt(discount)}</span>
          }
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-white font-bold text-sm">Total</span>
          <span className="text-blue-400 font-black text-lg">{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* Notes */}
      {canEdit && (
        <div className="mt-3">
          <p className="text-gray-600 text-xs mb-1.5">Catatan untuk Customer (opsional)</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Rekomendasi pekerjaan tambahan, penjelasan biaya..."
            className="w-full text-sm text-white rounded-xl px-3 py-2 resize-none outline-none"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
      )}
      {!canEdit && order.estimasi?.notes && (
        <p className="mt-2 text-gray-500 text-xs p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {order.estimasi.notes}
        </p>
      )}

      {canEdit && (
        <button onClick={handleSave} disabled={loading}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#b45309,#d97706)', color: '#fff' }}>
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
          {order.approvalStatus === APPROVAL_STATUS.REVISION ? 'Kirim Revisi Estimasi' : 'Kirim Estimasi ke Customer'}
        </button>
      )}
    </Panel>
  )
}

// ─── STAGE: APPROVAL ──────────────────────────────────────────
function ApprovalPanel({ order, onUpdate }) {
  const stage    = order.workflowStage || WORKFLOW_STAGE.PENDING
  const isActive = stage === WORKFLOW_STAGE.WAITING_APPROVAL &&
                   order.approvalStatus === APPROVAL_STATUS.PENDING
  const isDone   = order.approvalStatus === APPROVAL_STATUS.APPROVED
  const isRevision = order.approvalStatus === APPROVAL_STATUS.REVISION

  const [reason,  setReason]  = useState('')
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(WORKFLOW_STAGE.WAITING_APPROVAL)) return null

  async function handleApprove() {
    setLoading(true)
    const result = await approveEstimation(order.id, { approvedBy: 'Customer', notes: 'Disetujui via portal' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('Estimasi disetujui! Work Order aktif.') }
    else showToast(result.error, 'error')
  }

  async function handleRevision() {
    if (!reason.trim()) { showToast('Alasan revisi wajib diisi.', 'error'); return }
    setLoading(true)
    const result = await requestEstimationRevision(order.id, { reason, by: 'Customer' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('Revisi diminta.') }
    else showToast(result.error, 'error')
  }

  return (
    <Panel title="Persetujuan Customer" icon={ThumbsUp} color="#FB923C"
      status={isDone ? 'done' : isRevision ? 'revision' : isActive ? 'active' : 'locked'}
      meta={isDone ? `Disetujui oleh ${order.approvedBy} · ${timeAgo(order.approvedAt)}` : undefined}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#3B82F6',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && (
        <div className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />
          <p className="text-blue-400 text-sm font-semibold">Estimasi disetujui · Work Order aktif</p>
        </div>
      )}

      {isRevision && (
        <div className="p-3 rounded-xl"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <p className="text-orange-400 text-xs font-semibold mb-1">Revisi Diminta</p>
          <p className="text-gray-400 text-xs">{order.revisionReason}</p>
        </div>
      )}

      {isActive && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)' }}>
            <Clock size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs">
              Estimasi senilai <strong className="text-white">{fmt(order.estimasi?.grandTotal || order.total)}</strong> sudah
              dikirim ke customer. Menunggu persetujuan.
            </p>
          </div>

          <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Aksi (simulasi approval admin)</p>

          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
              ACC Estimasi
            </button>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-gray-600 text-xs mb-2">Atau minta revisi:</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Alasan revisi..."
              className="w-full text-sm text-white rounded-lg px-3 py-2 resize-none outline-none mb-2"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }} />
            <button onClick={handleRevision} disabled={loading || !reason.trim()}
              className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.25)' }}>
              <RotateCcw size={12} /> Minta Revisi
            </button>
          </div>
        </div>
      )}
    </Panel>
  )
}

// ─── STAGE: WORK ORDER ────────────────────────────────────────
function WorkOrderPanel({ order }) {
  const stage = order.workflowStage || WORKFLOW_STAGE.PENDING
  if (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(WORKFLOW_STAGE.WORK_ORDER)) return null

  const isActive = stage === WORKFLOW_STAGE.WORK_ORDER
  const isDone   = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(WORKFLOW_STAGE.WORK_ORDER)

  return (
    <Panel title="Work Order Aktif" icon={Hammer} color="#A78BFA"
      status={isDone ? 'done' : isActive ? 'active' : 'locked'}>

      <div className="space-y-3">
        {/* WO Summary */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Work Order</p>
            <span className="font-mono text-xs text-gray-500">{order.id}</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Mekanik',  value: order.mechanic || 'Belum assign' },
              { label: 'Layanan',  value: order.service },
              { label: 'Kendaraan', value: order.vehicle },
              { label: 'Target Selesai', value: order.date },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-300 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pekerjaan dari estimasi */}
        {order.estimasi?.items?.length > 0 && (
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-2">Pekerjaan yang Harus Dilakukan</p>
            <div className="space-y-1.5">
              {order.estimasi.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: isDone ? 'rgba(59,130,246,0.15)' : 'rgba(167,139,250,0.15)',
                             border: `1px solid ${isDone ? 'rgba(59,130,246,0.3)' : 'rgba(167,139,250,0.3)'}` }}>
                    {isDone && <Check size={10} className="text-blue-400" />}
                  </div>
                  <span className="text-gray-300 text-xs flex-1">{item.description}</span>
                  <span className="text-gray-500 text-xs">{item.qty} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isActive && (
          <div className="p-3 rounded-xl flex items-start gap-2.5 mt-2"
            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <AlertCircle size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-xs">
              Mekanik sedang mengerjakan kendaraan sesuai WO. QC akan tersedia setelah pengerjaan selesai (Sprint 5).
            </p>
          </div>
        )}
      </div>
    </Panel>
  )
}

// ─── STAGE: QC ────────────────────────────────────────────────
function QCPanel({ order, onUpdate }) {
  const stage    = order.workflowStage || WORKFLOW_STAGE.PENDING
  const isActive = stage === WORKFLOW_STAGE.QC
  const isDone   = stage === WORKFLOW_STAGE.READY_PICKUP || stage === WORKFLOW_STAGE.COMPLETED
  const canStart = stage === WORKFLOW_STAGE.WORK_ORDER

  const [items,   setItems]   = useState(() =>
    order.qc?.items || QC_CHECKLIST.map(c => ({ ...c, passed: false, notes: '' }))
  )
  const [notes,   setNotes]   = useState(order.qc?.notes || '')
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function toggleItem(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, passed: !i.passed } : i))
  }

  async function handleStart() {
    setLoading(true)
    const result = await startQC(order.id, { by: 'Admin' })
    setLoading(false)
    if (result.success) { onUpdate(); showToast('QC dimulai.') }
    else showToast(result.error, 'error')
  }

  async function handleComplete(passed) {
    const failedCount = items.filter(i => !i.passed).length
    if (passed && failedCount > 0 &&
      !window.confirm(`${failedCount} poin QC belum pass. Tetap tandai lulus?`)) return

    setLoading(true)
    const result = await completeQC(order.id, { items, passed, notes, by: 'Admin' })
    setLoading(false)
    if (result.success) {
      onUpdate()
      showToast(passed ? 'QC lulus! Kendaraan siap diambil.' : 'QC gagal. Kembali ke pengerjaan.')
    } else showToast(result.error, 'error')
  }

  const stageIdx = STAGE_ORDER.indexOf(stage)
  if (stageIdx < STAGE_ORDER.indexOf(WORKFLOW_STAGE.WORK_ORDER) && !canStart) return null

  const passedCount = items.filter(i => i.passed).length
  const totalCount  = items.length

  return (
    <Panel title="Quality Control" icon={ShieldCheck} color="#34D399"
      status={isDone ? 'done' : isActive ? 'active' : canStart ? 'pending' : 'locked'}
      meta={isDone ? `QC ${order.qc?.passed ? 'LULUS' : 'GAGAL'} · ${timeAgo(order.qc?.completedAt)}` : undefined}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#3B82F6',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {canStart && (
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">
            Pengerjaan selesai. Mulai quality control sebelum kendaraan diserahkan.
          </p>
          <button onClick={handleStart} disabled={loading}
            className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Mulai QC
          </button>
        </div>
      )}

      {(isActive || isDone) && (
        <>
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 text-xs">
              {passedCount}/{totalCount} poin pass
            </p>
            <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: passedCount === totalCount ? '#3B82F6' : '#34D399' }}
                initial={{ width: 0 }}
                animate={{ width: `${(passedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold"
              style={{ color: passedCount === totalCount ? '#3B82F6' : '#34D399' }}>
              {Math.round((passedCount / totalCount) * 100)}%
            </span>
          </div>

          {/* QC Checklist */}
          <div className="space-y-1.5 mb-4">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: item.passed ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.passed ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)'}`,
                }}
                onClick={() => isActive && toggleItem(item.id)}>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: item.passed ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${item.passed ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                  {item.passed && <Check size={11} className="text-blue-400" />}
                </div>
                <span className="text-xs flex-1" style={{ color: item.passed ? '#D1FAE5' : '#9CA3AF' }}>
                  {item.label}
                </span>
                {item.critical && !item.passed && (
                  <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    WAJIB
                  </span>
                )}
              </div>
            ))}
          </div>

          {isActive && (
            <>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Catatan QC (opsional)..."
                className="w-full text-sm text-white rounded-xl px-3 py-2 resize-none outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div className="flex gap-2">
                <button onClick={() => handleComplete(true)} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff' }}>
                  {loading ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  QC Lulus — Siap Diambil
                </button>
                <button onClick={() => handleComplete(false)} disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <X size={13} /> Gagal
                </button>
              </div>
            </>
          )}

          {isDone && order.qc?.passed && (
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <CheckCircle2 size={15} className="text-blue-400" />
              <p className="text-blue-400 text-xs font-semibold">QC LULUS — Kendaraan siap diserahkan</p>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

// ─── STAGE: PAYMENT ───────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'cash',     label: 'Tunai',          icon: '💵' },
  { value: 'transfer', label: 'Transfer Bank',   icon: '🏦' },
  { value: 'qris',     label: 'QRIS',            icon: '📱' },
  { value: 'debit',    label: 'Kartu Debit',     icon: '💳' },
  { value: 'kredit',   label: 'Kartu Kredit',    icon: '💳' },
]

function PaymentPanel({ order, onUpdate }) {
  const stage    = order.workflowStage || WORKFLOW_STAGE.PENDING
  const isActive = stage === WORKFLOW_STAGE.READY_PICKUP
  const isDone   = stage === WORKFLOW_STAGE.COMPLETED

  const estimatedTotal  = order.estimasi?.grandTotal || order.total || 0
  const [finalTotal,    setFinalTotal]    = useState(estimatedTotal)
  const [method,        setMethod]        = useState('cash')
  const [amountPaid,    setAmountPaid]    = useState(estimatedTotal)
  const [extraDiscount, setExtraDiscount] = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [toast,         setToast]         = useState(null)

  const adjustedTotal = Math.max(0, finalTotal - Number(extraDiscount || 0))
  const change        = Math.max(0, Number(amountPaid || 0) - adjustedTotal)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handlePay() {
    if (adjustedTotal <= 0) { showToast('Total pembayaran tidak valid.', 'error'); return }
    if (method === 'cash' && Number(amountPaid) < adjustedTotal) {
      showToast('Uang yang diterima kurang dari total tagihan.', 'error'); return
    }
    if (!window.confirm(`Konfirmasi pembayaran ${method.toUpperCase()} sebesar Rp ${adjustedTotal.toLocaleString('id-ID')}?`)) return

    setLoading(true)
    const result = await completeOrder(order.id, {
      finalTotal:    adjustedTotal,
      paymentMethod: method,
      amountPaid:    Number(amountPaid),
      discount:      Number(extraDiscount || 0),
      by:            'Admin',
    })
    setLoading(false)
    if (result.success) {
      onUpdate()
      showToast('Pembayaran berhasil! Poin loyalty otomatis ditambahkan.')
    } else {
      showToast(result.error, 'error')
    }
  }

  const stageIdx = STAGE_ORDER.indexOf(stage)
  if (stageIdx < STAGE_ORDER.indexOf(WORKFLOW_STAGE.READY_PICKUP)) return null

  return (
    <Panel title="Pembayaran" icon={DollarSign} color="#4ADE80"
      status={isDone ? 'done' : isActive ? 'active' : 'locked'}
      meta={isDone ? `${order.payment?.paymentMethod?.toUpperCase()} · ${timeAgo(order.payment?.paidAt)}` : undefined}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#4ADE80',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">Bukti Pembayaran</p>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Total Dibayar', value: fmt(order.payment?.finalTotal), highlight: true },
                { label: 'Metode',        value: order.payment?.paymentMethod?.toUpperCase() },
                { label: 'Diskon Kasir',  value: order.payment?.discount > 0 ? fmt(order.payment.discount) : '—' },
                { label: 'Kembalian',     value: order.payment?.change > 0 ? fmt(order.payment.change) : '—' },
                { label: 'Kasir',         value: order.payment?.paidBy },
                { label: 'Waktu',         value: order.payment?.paidAt ? new Date(order.payment.paidAt).toLocaleString('id-ID') : '—' },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={highlight ? 'text-blue-400 font-black text-sm' : 'text-gray-300 font-medium'}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-center gap-2.5"
            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <Package size={13} className="text-blue-400" />
            <p className="text-blue-300 text-xs">Poin loyalty customer sudah diperbarui otomatis.</p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="space-y-4">
          {/* Ringkasan biaya */}
          <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-3">Ringkasan Biaya</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Estimasi Awal</span>
              <span className="text-gray-400">{fmt(estimatedTotal)}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500">Penyesuaian Kasir</span>
              <input type="number" min="0" value={finalTotal}
                onChange={e => { setFinalTotal(Number(e.target.value)); setAmountPaid(Number(e.target.value)) }}
                className="w-32 text-right bg-transparent text-white outline-none border-b border-gray-700 focus:border-green-400 text-xs" />
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500">Diskon Tambahan</span>
              <input type="number" min="0" value={extraDiscount} onChange={e => setExtraDiscount(e.target.value)}
                className="w-32 text-right bg-transparent text-yellow-400 outline-none border-b border-gray-700 focus:border-yellow-400 text-xs" />
            </div>
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-white font-bold text-sm">Total Tagihan</span>
              <span className="text-blue-400 font-black text-lg">{fmt(adjustedTotal)}</span>
            </div>
          </div>

          {/* Metode pembayaran */}
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-2">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)}
                  className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: method === m.value ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${method === m.value ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: method === m.value ? '#4ADE80' : '#6B7280',
                  }}>
                  <span className="text-base">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Uang diterima (hanya untuk cash) */}
          {method === 'cash' && (
            <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Uang Diterima</span>
                <input type="number" min={adjustedTotal} value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                  className="w-36 text-right bg-transparent text-white outline-none border-b border-gray-700 focus:border-green-400 text-sm font-bold" />
              </div>
              {change > 0 && (
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-gray-500">Kembalian</span>
                  <span className="text-yellow-400 font-bold text-sm">{fmt(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Tombol bayar */}
          <button onClick={handlePay} disabled={loading}
            className="w-full py-3 rounded-xl text-base font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#3B82F6)', color: '#fff' }}>
            {loading
              ? <><RefreshCw size={16} className="animate-spin" /> Memproses...</>
              : <><CheckCircle2 size={16} /> Proses Pembayaran {fmt(adjustedTotal)}</>
            }
          </button>
        </div>
      )}
    </Panel>
  )
}

// ─── PANEL WRAPPER ────────────────────────────────────────────
function Panel({ title, icon: Icon, color, status, meta, children }) {
  const statusStyles = {
    done:     { border: `rgba(${color === '#3B82F6' ? '34,197,94' : '255,255,255'},0.08)`, bg: 'rgba(255,255,255,0.01)' },
    active:   { border: `${color}25`,  bg: `${color}06` },
    pending:  { border: 'rgba(255,255,255,0.06)', bg: 'rgba(255,255,255,0.01)' },
    locked:   { border: 'rgba(255,255,255,0.04)', bg: 'rgba(255,255,255,0.005)' },
    revision: { border: 'rgba(251,146,60,0.25)',  bg: 'rgba(251,146,60,0.04)' },
  }
  const s = statusStyles[status] || statusStyles.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 mb-4"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{title}</p>
            {meta && <p className="text-gray-600 text-[10px]">{meta}</p>}
          </div>
        </div>
        {status === 'done' && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Check size={12} className="text-blue-400" />
          </div>
        )}
        {status === 'active' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            AKTIF
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function OrderDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadOrder = useCallback(async () => {
    try {
      const found = await getOrderById(decodeURIComponent(id))
      if (found) { setOrder(found); setLoading(false); setNotFound(false) }
      else       { setNotFound(true); setLoading(false) }
    } catch {
      setNotFound(true); setLoading(false)
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      await loadOrder()
    }
    tick()
    const iv = setInterval(tick, 4000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [loadOrder])

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={24} className="text-blue-400 animate-spin" />
        </div>
      </AnimatedPage>
    )
  }

  if (notFound) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-gray-400">Order tidak ditemukan: {id}</p>
          <button onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-blue-400 hover:text-white transition-colors"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <ArrowLeft size={14} /> Kembali ke Orders
          </button>
        </div>
      </AnimatedPage>
    )
  }

  const stage     = order.workflowStage || WORKFLOW_STAGE.PENDING
  const stageMeta = STAGE_META[stage] || STAGE_META[WORKFLOW_STAGE.PENDING]

  return (
    <AnimatedPage>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Detail Order</h1>
          <p className="text-gray-500 text-xs">{order.id} · {order.customer}</p>
        </div>
      </div>

      {/* Stage progress */}
      <StageProgress currentStage={stage} />

      {/* Order summary */}
      <OrderSummary order={order} />

      {/* Workflow panels */}
      <InspectionPanel order={order} onUpdate={loadOrder} />
      <EstimasiPanel   order={order} onUpdate={loadOrder} />
      <ApprovalPanel   order={order} onUpdate={loadOrder} />
      <WorkOrderPanel  order={order} />
      <QCPanel         order={order} onUpdate={loadOrder} />
      <PaymentPanel    order={order} onUpdate={loadOrder} />

      {/* Stage history */}
      {order.stageHistory?.length > 0 && (
        <div className="mt-6 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-3">Riwayat Stage</p>
          <div className="space-y-2">
            {[...order.stageHistory].reverse().map((h, idx) => {
              const m = STAGE_META[h.stage] || { label: h.stage, color: '#6B7280' }
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <span style={{ color: m.color }}>{m.label}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-600">{h.by}</span>
                  {h.note && <span className="text-gray-700">· {h.note}</span>}
                  <span className="ml-auto text-gray-700">{timeAgo(h.at)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}