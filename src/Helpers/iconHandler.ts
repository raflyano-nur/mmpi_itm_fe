import * as HiIcons from 'react-icons/hi2'

/**
 * Mengubah string dalam format kebab-case menjadi komponen Hero Icon yang sesuai.
 *
 * @param {string} iconName - Nama ikon dalam format kebab-case, contoh: "document-chart-bar"
 * @returns {React.ComponentType | null} - Komponen ikon dari react-icons/hi, atau null jika tidak ditemukan.
 */
export const getHeroIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    return null
  }

  // 1. Ubah kebab-case menjadi PascalCase: "document-chart-bar" -> "DocumentChartBar"
  const formattedName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  // 2. Tambahkan prefix "Hi" sesuai dengan konvensi react-icons/hi
  const componentName = `Hi${formattedName}`

  // 3. Ambil komponen dari modul react-icons/hi
  return HiIcons[componentName] || null
}

/**
 * Mendapatkan daftar semua nama ikon Hero yang tersedia (opsional).
 *
 * @returns {string[]} - Array berisi semua nama ikon (dengan prefix Hi).
 */
export const getAllHeroIconNames = () => {
  return Object.keys(HiIcons).filter((name) => name.startsWith('Hi'))
}
