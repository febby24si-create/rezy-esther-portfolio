// ============================================================
// lib/imageCompress.js
// Kompres & resize gambar di browser sebelum disimpan sebagai
// base64 data URL. Foto dari HP biasanya 2–8 MB — kalau langsung
// disimpan sebagai base64 ke kolom Supabase, gampang kena limit
// ukuran request (413 Payload Too Large) atau bikin request
// gagal tanpa pesan yang jelas. Fungsi ini resize ke lebar
// maksimum + kompres ke JPEG supaya ukurannya jauh lebih kecil
// (biasanya < 150-300 KB) sebelum dikirim ke database.
// ============================================================

export function compressImage(file, { maxWidth = 800, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
    reader.onload = (ev) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat gambar'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const targetW = Math.round(img.width * scale)
        const targetH = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, targetW, targetH)

        // Konversi ke JPEG (lebih kecil dari PNG untuk foto produk/orang/kendaraan)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}