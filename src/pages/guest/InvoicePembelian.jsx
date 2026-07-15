// ============================================================
// InvoicePembelian.jsx — UPGRADED PREMIUM
// - Layout invoice profesional
// - Logo Esther Garage
// - QR code order
// - Download PDF (jsPDF + html2canvas)
// - Tombol Cetak
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowBack, MdDownload, MdPrint, MdVerified } from 'react-icons/md'
import { QRCodeSVG } from 'qrcode.react'
import { shopAPI } from '../../services/shopAPI'
import { formatRupiah } from '../../lib/formatRupiah'
import PageSkeleton from '../../components/ui/PageSkeleton'

function InvoiceBody({ order, items, invoiceRef }) {
  const subtotal = items.reduce((s, it) => s + (it.subtotal || it.qty * it.price), 0)
  const deliveryFee = order.delivery_fee || 0
  const total = subtotal + deliveryFee
  const invoiceNum = order.invoice_number || `INV-${order.order_number}`

  const statusColor = order.status === 'Selesai' ? '#22C55E'
    : order.status === 'Dibatalkan' ? '#EF4444'
    : '#F59E0B'

  return (
    <div
      ref={invoiceRef}
      id="invoice-content"
      className="rounded-2xl overflow-hidden"
      style={{ background: '#ffffff', color: '#111827', fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Header banner */}
      <div style={{ background: 'linear-gradient(135deg,#052E16,#14532D)', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, background: '#22C55E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>EG</span>
              </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Esther Garage</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Jl. Ahmad Yani, Bukittinggi, Sumatera Barat</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>📞 +62 812-XXXX-XXXX · 🌐 esthergarage.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Invoice</p>
            <p style={{ color: '#4ADE80', fontWeight: 900, fontSize: 18, fontFamily: 'monospace' }}>{invoiceNum}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
              {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <span style={{
              display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 999,
              background: `${statusColor}22`, color: statusColor, fontSize: 11, fontWeight: 700,
              border: `1px solid ${statusColor}44`
            }}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Customer info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Kepada</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{order.recipient_name}</p>
            {order.address && <p style={{ fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 1.5 }}>{order.address}</p>}
            {order.phone && <p style={{ fontSize: 13, color: '#4B5563' }}>{order.phone}</p>}
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pembayaran</p>
            <p style={{ fontSize: 13, color: '#4B5563' }}>Metode: <strong>{order.payment_method || 'Cash'}</strong></p>
            {order.notes && <p style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>Catatan: {order.notes}</p>}
          </div>
        </div>

        {/* Products table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#F0FDF4', borderRadius: 8 }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Produk</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Harga</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px', fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{item.product_name}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: '#4B5563' }}>{item.qty}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, color: '#4B5563' }}>{formatRupiah(item.price)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{formatRupiah(item.subtotal || item.qty * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Subtotal</span>
              <span style={{ fontSize: 13, color: '#1F2937' }}>{formatRupiah(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Ongkos Kirim</span>
              <span style={{ fontSize: 13, color: '#1F2937' }}>{deliveryFee > 0 ? formatRupiah(deliveryFee) : 'Gratis'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>TOTAL</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#16A34A' }}>{formatRupiah(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20, borderTop: '1px dashed #D1FAE5' }}>
          <div>
            <p style={{ fontSize: 12, color: '#6B7280' }}>Terima kasih telah berbelanja di Esther Garage! 🙏</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Invoice ini digenerate secara otomatis dan sah tanpa tanda tangan.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <QRCodeSVG value={order.order_number || 'EG-ORDER'} size={64} level="M" />
            <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>Scan untuk detail order</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePembelian() {
  const { id } = useParams()
  const navigate = useNavigate()
  const invoiceRef = useRef(null)

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([shopAPI.fetchOrderById(id), shopAPI.fetchItemsByOrder(id)])
      .then(([ord, its]) => { setOrder(ord); setItems(its || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    if (!invoiceRef.current || !order) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice-${order.order_number}.pdf`)
    } catch (err) {
      console.error('Download PDF gagal:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!invoiceRef.current) return
    const content = invoiceRef.current.innerHTML
    const printWin = window.open('', '_blank', 'width=800,height=600')
    printWin.document.write(`
      <html><head><title>Invoice</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
      <style>body{margin:0;font-family:'Inter',sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{body{margin:0}}</style>
      </head><body>${content}</body></html>`)
    printWin.document.close()
    printWin.onload = () => { printWin.print(); printWin.close() }
  }

  if (loading) return <div className="p-6"><PageSkeleton variant="card" count={1} /></div>
  if (!order) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Order tidak ditemukan.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-green-400 text-sm">Kembali</button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <MdArrowBack size={18} /> Kembali
        </button>
        <div className="flex gap-2">
          <motion.button onClick={handlePrint} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <MdPrint size={16} /> Cetak
          </motion.button>
          <motion.button onClick={handleDownload} disabled={downloading} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
            {downloading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : <><MdDownload size={16} /> PDF</>}
          </motion.button>
        </div>
      </div>

      {/* Invoice */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <InvoiceBody order={order} items={items} invoiceRef={invoiceRef} />
      </motion.div>
    </div>
  )
}