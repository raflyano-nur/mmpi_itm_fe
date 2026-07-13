/**
 * @file apiErrorParser.ts
 * @description Utility reusable untuk parsing error response dari API.
 *
 * Mendukung format error validasi Laravel:
 * {
 *   "status": "error",
 *   "title": "Validasi Gagal",
 *   "message": "Data yang dikirim tidak valid.",
 *   "errors": {
 *     "field_name": ["Error message 1", "Error message 2"]
 *   }
 * }
 *
 * @module Helpers/ApiErrorParser
 */

/**
 * Interface untuk error response dari API (format Laravel).
 */
export interface ApiErrorResponse {
  status?: string
  title?: string
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Parse field-level validation errors dari API response.
 * Mengambil pesan error pertama dari setiap field.
 *
 * @param error - Error object dari RTK Query catch
 * @returns Record<string, string> - Map field ke pesan error pertama
 *
 * @example
 * try {
 *   await postDevice(data).unwrap()
 * } catch (error) {
 *   const fieldErrors = parseFieldErrors(error)
 *   // { devices_name: "The devices name field is required." }
 *   setErrors(fieldErrors)
 * }
 */
export const parseFieldErrors = (error: any): Record<string, string> => {
  const apiError = error?.data as ApiErrorResponse | undefined
  const fieldErrors: Record<string, string> = {}

  if (apiError?.errors) {
    for (const [field, messages] of Object.entries(apiError.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0]
      }
    }
  }

  return fieldErrors
}

/**
 * Ambil pesan error umum dari API response.
 * Fallback ke pesan default jika tidak ada.
 *
 * @param error - Error object dari RTK Query catch
 * @param fallback - Pesan default jika tidak ada pesan dari API
 * @returns string - Pesan error
 *
 * @example
 * try {
 *   await deleteDevice({ id }).unwrap()
 * } catch (error) {
 *   const message = getErrorMessage(error, 'Gagal menghapus data.')
 *   showNotification({ title: 'Error!', description: message, type: 'error' })
 * }
 */
export const getErrorMessage = (error: any, fallback = 'Terjadi kesalahan.'): string => {
  return error?.data?.message || error?.message || fallback
}

/**
 * Cek apakah error merupakan validation error (memiliki field errors).
 *
 * @param error - Error object dari RTK Query catch
 * @returns boolean
 */
export const isValidationError = (error: any): boolean => {
  const apiError = error?.data as ApiErrorResponse | undefined
  return !!apiError?.errors && Object.keys(apiError.errors).length > 0
}
