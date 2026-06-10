/**
 * randomAvatar.js
 * Returns a deterministic random avatar URL based on a seed string (name/id).
 * Uses i.pravatar.cc for realistic human portrait photos.
 */

// Pravatar supports 1–70 numeric IDs
const PRAVATAR_COUNT = 70

// Mechanic seeds → male-looking IDs (odd numbers tend to vary, all are real photos)
const MECHANIC_IDS  = [10, 12, 14, 15, 17, 20, 22, 24, 25, 30, 33, 35, 38, 40, 42, 44, 47, 50, 52, 54]
// Customer seeds → mix of IDs
const CUSTOMER_IDS  = [1, 3, 5, 7, 9, 11, 13, 16, 19, 21, 23, 26, 28, 31, 34, 36, 39, 41, 43, 45, 48, 51, 53, 55, 57, 60, 62, 65, 68, 70]

/** Simple deterministic hash from a string → number */
function hashString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Returns a seeded avatar URL for a mechanic.
 * @param {string} seed - name or id string used as seed
 * @param {number} [size=150] - image size in px
 */
export function getMechanicAvatar(seed = '', size = 150) {
  const id = MECHANIC_IDS[hashString(seed) % MECHANIC_IDS.length]
  return `https://i.pravatar.cc/${size}?img=${id}`
}

/**
 * Returns a seeded avatar URL for a customer/pelanggan.
 * @param {string} seed - name or id string used as seed
 * @param {number} [size=150] - image size in px
 */
export function getCustomerAvatar(seed = '', size = 150) {
  const id = CUSTOMER_IDS[hashString(seed) % CUSTOMER_IDS.length]
  return `https://i.pravatar.cc/${size}?img=${id}`
}
