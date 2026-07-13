/**
 * @file fileToBase64.ts
 * @description Utility reusable untuk konversi File menjadi base64 string.
 *
 * @module Helpers/fileToBase64
 */

/** Ekstensi gambar yang diizinkan */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg']

/** Maksimal ukuran file (dalam bytes) - default 2MB */
export const MAX_FILE_SIZE = 2 * 1024 * 1024

/**
 * Mengkonversi File menjadi base64 string (termasuk prefix data URI).
 *
 * @param file - File yang akan dikonversi
 * @returns Promise<string> - Base64 string dari file
 *
 * @example
 * const base64 = await fileToBase64(file)
 * // "data:image/png;base64,iVBORw0KGgo..."
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Validasi apakah file adalah gambar dengan ekstensi yang diizinkan.
 *
 * @param file - File yang akan divalidasi
 * @returns Object berisi isValid dan pesan error jika ada
 */
export const validateImageFile = (
  file: File,
  maxSize: number = MAX_FILE_SIZE,
): { isValid: boolean; error?: string } => {
  // Cek ekstensi file
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Format file tidak didukung. Gunakan: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    }
  }

  // Cek MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipe file tidak didukung. Gunakan format gambar yang valid.`,
    }
  }

  // Cek ukuran file
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`,
    }
  }

  return { isValid: true }
}

/**
 * Mengkonversi File gambar menjadi base64 dengan validasi.
 * Menggabungkan validasi dan konversi dalam satu fungsi.
 *
 * @param file - File gambar yang akan dikonversi
 * @param maxSize - Maksimal ukuran file (opsional)
 * @returns Promise<{ base64: string } | { error: string }>
 *
 * @example
 * const result = await convertImageToBase64(file)
 * if ('error' in result) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.base64)
 * }
 */
export const convertImageToBase64 = async (
  file: File,
  maxSize?: number,
): Promise<{ base64: string } | { error: string }> => {
  const validation = validateImageFile(file, maxSize)
  if (!validation.isValid) {
    return { error: validation.error! }
  }

  try {
    const base64 = await fileToBase64(file)
    return { base64 }
  } catch {
    return { error: 'Gagal mengkonversi file. Silakan coba lagi.' }
  }
}
