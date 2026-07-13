// ============================================================
// lib/formatRupiah.js
// Format angka ke mata uang Rupiah — dipisah dari ProductCard.jsx
// agar tidak melanggar react-refresh/only-export-components.
// ============================================================

export function formatRupiah(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}
