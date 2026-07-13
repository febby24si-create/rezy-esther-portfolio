import { useEffect, useState, useRef } from 'react'

/**
 * useScrollSpy — deteksi section yang sedang aktif di viewport
 * memakai SATU IntersectionObserver bersama (bukan window.onscroll,
 * dan bukan satu observer per-section seperti implementasi awal).
 *
 * @param {string[]} sectionIds - urutan id section top -> bottom
 * @param {object} options
 * @param {number} options.offsetPx - tinggi elemen fixed di atas
 *   (mis. navbar) yang perlu "dipotong" dari area deteksi, supaya
 *   section tidak dianggap aktif saat masih tertutup navbar.
 * @returns {string} id section yang sedang aktif (default: sectionIds[0])
 */
export function useScrollSpy(sectionIds, { offsetPx = 80 } = {}) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null)
  // Simpan rasio-intersect tiap section supaya saat beberapa section
  // sama-sama "intersecting" (transisi antar section), yang dipilih
  // adalah yang porsinya paling besar di viewport — bukan sekadar
  // section pertama yang match.
  const ratios = useRef({})

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0
        }
        // Pilih section dengan rasio tampil terbesar saat ini.
        let bestId = null
        let bestRatio = 0
        for (const id of sectionIds) {
          const r = ratios.current[id] || 0
          if (r > bestRatio) {
            bestRatio = r
            bestId = id
          }
        }
        if (bestId) setActiveId(bestId)
      },
      {
        // Potong area atas sebesar tinggi navbar supaya section yang
        // "aktif" benar-benar section yang terlihat di bawah navbar,
        // bukan yang masih separuh ketutup.
        rootMargin: `-${offsetPx}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sectionIds, offsetPx])

  return activeId
}