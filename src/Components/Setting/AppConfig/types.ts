/**
 * @file types.ts
 * @description Type definitions untuk modul App Config.
 *
 * @module Setting/AppConfig/Types
 */

/**
 * Form data untuk update app config.
 * Setiap key sesuai dengan field dari API response.
 */
export interface AppConfigFormData {
  BOYOLALI_BASE_URL: string
  API_TOKEN_BOYOLALI: string
  logo: string
  items_per_page: string
}

export const APP_CONFIG_FORM_INITIAL: AppConfigFormData = {
  BOYOLALI_BASE_URL: '',
  API_TOKEN_BOYOLALI: '',
  logo: '',
  items_per_page: '',
}

/**
 * Konfigurasi field form untuk render dinamis.
 */
export interface AppConfigFieldConfig {
  key: keyof AppConfigFormData
  label: string
  type: 'text' | 'number' | 'password' | 'textarea' | 'image'
  placeholder: string
  description?: string
  colSpan?: number
}

export const APP_CONFIG_FIELDS: AppConfigFieldConfig[] = [
  // ── Integrasi ──
  {
    key: 'BOYOLALI_BASE_URL',
    label: 'Boyolali Base URL',
    type: 'text',
    placeholder: 'https://api.boyolali.go.id',
    description: 'Base URL untuk integrasi API Boyolali',
    colSpan: 2,
  },
  {
    key: 'API_TOKEN_BOYOLALI',
    label: 'API Token Boyolali',
    type: 'password',
    placeholder: 'Token rahasia untuk autentikasi API',
    description: 'Token autentikasi untuk mengakses API Boyolali',
    colSpan: 2,
  },
  // ── Tampilan ──
  {
    key: 'items_per_page',
    label: 'Items Per Halaman',
    type: 'number',
    placeholder: 'Contoh: 10',
    description: 'Jumlah data default per halaman pada tabel',
    colSpan: 2,
  },
]

/**
 * Helper: convert API response (flat object) ke AppConfigFormData
 */
export function configArrayToFormData(data: Record<string, string | null>): AppConfigFormData {
  const result = { ...APP_CONFIG_FORM_INITIAL }
  Object.entries(data).forEach(([key, value]) => {
    if (key in result) {
      ;(result as any)[key] = value ?? ''
    }
  })
  return result
}