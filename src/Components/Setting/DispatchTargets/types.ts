import type {
  AuthType,
  DispatchTargetItem as ApiDispatchTargetItem,
  PostDispatchTargetBody,
  UpdateDispatchTargetBody,
} from '@/Services/Modules/dispatchTargets'

export type DispatchTargetItem = ApiDispatchTargetItem
export type { AuthType }

export interface DispatchTargetFormData {
  name: string
  description: string
  url: string
  auth_type: AuthType
  auth_header_name: string
  auth_value: string
  is_active: boolean
}

export interface DispatchTargetFieldConfig {
  key: keyof DispatchTargetFormData
  label: string
  type: 'text' | 'url' | 'textarea' | 'select' | 'password' | 'toggle'
  placeholder: string
  required?: boolean
  description?: string
  options?: { label: string; value: string | boolean }[]
  colSpan?: number
}

export interface DispatchTargetPreset {
  id: AuthType
  title: string
  subtitle: string
  body: PostDispatchTargetBody
}

export const AUTH_TYPE_OPTIONS: { label: string; value: AuthType }[] = [
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'API Key Header', value: 'api_key_header' },
  { label: 'Basic Auth', value: 'basic_auth' },
  { label: 'Tanpa Auth', value: 'none' },
]

export const DISPATCH_TARGET_AUTH_META: Record<
  AuthType,
  {
    label: string
    description: string
    badgeClassName: string
    authValueLabel: string
    authValuePlaceholder: string
    authValueHint: string
  }
> = {
  bearer: {
    label: 'Bearer Token',
    description: 'Mengirim token bearer pada header Authorization.',
    badgeClassName: 'bg-blue-50 text-blue-700 border-blue-200',
    authValueLabel: 'Bearer Token',
    authValuePlaceholder: 'Contoh: token-rahasia-dinkes-boyolali',
    authValueHint: 'Simpan token tanpa prefix "Bearer". Header akan dibentuk oleh backend.',
  },
  api_key_header: {
    label: 'API Key Header',
    description: 'Mengirim API key menggunakan nama header kustom.',
    badgeClassName: 'bg-amber-50 text-amber-700 border-amber-200',
    authValueLabel: 'API Key',
    authValuePlaceholder: 'Contoh: api-key-rahasia-xyz',
    authValueHint: 'Cocok untuk target yang meminta header seperti x-api-key.',
  },
  basic_auth: {
    label: 'Basic Auth',
    description: 'Mengirim nilai Basic Auth yang sudah di-encode base64.',
    badgeClassName: 'bg-violet-50 text-violet-700 border-violet-200',
    authValueLabel: 'Basic Auth Value',
    authValuePlaceholder: 'Contoh: dXNlcm5hbWU6cGFzc3dvcmQ=',
    authValueHint: 'Isi dengan base64 dari format username:password.',
  },
  none: {
    label: 'Tanpa Auth',
    description: 'Request dikirim tanpa informasi autentikasi tambahan.',
    badgeClassName: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    authValueLabel: 'Auth Value',
    authValuePlaceholder: '',
    authValueHint: 'Tidak ada credential yang dikirim untuk target ini.',
  },
}

export const DISPATCH_TARGET_FORM_INITIAL: DispatchTargetFormData = {
  name: '',
  description: '',
  url: '',
  auth_type: 'bearer',
  auth_header_name: '',
  auth_value: '',
  is_active: true,
}

const DISPATCH_TARGET_BASE_FIELDS: DispatchTargetFieldConfig[] = [
  {
    key: 'name',
    label: 'Nama Target',
    type: 'text',
    placeholder: 'Contoh: Dinas Kesehatan Boyolali',
    required: true,
  },
  {
    key: 'url',
    label: 'URL Endpoint',
    type: 'url',
    placeholder: 'https://example.com/api/diagnostic',
    required: true,
  },
  {
    key: 'description',
    label: 'Deskripsi',
    type: 'textarea',
    placeholder: 'Jelaskan fungsi target pengiriman ini',
    colSpan: 2,
  },
  {
    key: 'auth_type',
    label: 'Tipe Autentikasi',
    type: 'select',
    placeholder: '',
    required: true,
    options: AUTH_TYPE_OPTIONS,
  },
  {
    key: 'is_active',
    label: 'Status',
    type: 'toggle',
    placeholder: '',
    description: 'Target aktif akan dipakai saat proses dispatch berlangsung.',
  },
]

export const DISPATCH_TARGET_PRESETS: DispatchTargetPreset[] = [
  {
    id: 'bearer',
    title: 'Buat Data - Bearer Token',
    subtitle: 'POST dengan bearer token',
    body: {
      name: 'Dinas Kesehatan Boyolali',
      description: 'Target pengiriman ke sistem Dinas Kesehatan Boyolali',
      url: 'https://dinkes-boyolali.example.com/api/diagnostic',
      auth_type: 'bearer',
      auth_header_name: null,
      auth_value: 'token-rahasia-dinkes-boyolali',
      is_active: true,
    },
  },
  {
    id: 'api_key_header',
    title: 'Buat Data - API Key Header',
    subtitle: 'POST dengan custom header',
    body: {
      name: 'Sistem Eksternal XYZ',
      description: 'Target dengan autentikasi API Key Header',
      url: 'https://sistem-xyz.example.com/api/receive',
      auth_type: 'api_key_header',
      auth_header_name: 'x-api-key',
      auth_value: 'api-key-rahasia-xyz',
      is_active: true,
    },
  },
  {
    id: 'basic_auth',
    title: 'Buat Data - Basic Auth',
    subtitle: 'POST dengan Basic Auth',
    body: {
      name: 'Sistem Legacy ABC',
      description: 'Target dengan Basic Auth',
      url: 'https://sistem-abc.example.com/api/diagnostic',
      auth_type: 'basic_auth',
      auth_header_name: null,
      auth_value: 'dXNlcm5hbWU6cGFzc3dvcmQ=',
      is_active: true,
    },
  },
  {
    id: 'none',
    title: 'Buat Data - Tanpa Auth',
    subtitle: 'POST tanpa auth',
    body: {
      name: 'Webhook Internal',
      description: 'Target internal tanpa autentikasi',
      url: 'https://internal.example.com/webhook/diagnostic',
      auth_type: 'none',
      auth_header_name: null,
      auth_value: null,
      is_active: true,
    },
  },
]

export const getDispatchTargetFormFields = (
  formData: DispatchTargetFormData,
  mode: 'create' | 'edit',
  item?: DispatchTargetItem | null,
): DispatchTargetFieldConfig[] => {
  const fields = [...DISPATCH_TARGET_BASE_FIELDS]
  const authMeta = DISPATCH_TARGET_AUTH_META[formData.auth_type]
  const authTypeChanged = mode === 'edit' && !!item && item.auth_type !== formData.auth_type

  if (formData.auth_type === 'api_key_header') {
    fields.push({
      key: 'auth_header_name',
      label: 'Nama Header',
      type: 'text',
      placeholder: 'Contoh: x-api-key',
      required: true,
      description: 'Header custom yang akan dikirim bersama auth value.',
    })
  }

  if (formData.auth_type !== 'none') {
    fields.push({
      key: 'auth_value',
      label: authMeta.authValueLabel,
      type: 'password',
      placeholder: authMeta.authValuePlaceholder,
      required: mode === 'create' || authTypeChanged,
      description:
        mode === 'edit' && !authTypeChanged
          ? `Kosongkan jika tidak ingin mengganti nilai credential. ${authMeta.authValueHint}`
          : authMeta.authValueHint,
      colSpan: 2,
    })
  }

  return fields
}

export function buildDispatchTargetPayload(
  formData: DispatchTargetFormData,
  mode: 'create',
  item?: DispatchTargetItem | null,
): PostDispatchTargetBody
export function buildDispatchTargetPayload(
  formData: DispatchTargetFormData,
  mode: 'edit',
  item?: DispatchTargetItem | null,
): UpdateDispatchTargetBody
export function buildDispatchTargetPayload(
  formData: DispatchTargetFormData,
  mode: 'create' | 'edit',
  item?: DispatchTargetItem | null,
): PostDispatchTargetBody | UpdateDispatchTargetBody {
  const name = formData.name.trim()
  const description = formData.description.trim()
  const url = formData.url.trim()
  const authHeaderName = formData.auth_header_name.trim()
  const authValue = formData.auth_value.trim()
  const authTypeChanged = mode === 'edit' && !!item && item.auth_type !== formData.auth_type

  const payload: PostDispatchTargetBody | UpdateDispatchTargetBody = {
    name,
    description: description || null,
    url,
    auth_type: formData.auth_type,
    auth_header_name: formData.auth_type === 'api_key_header' ? authHeaderName || null : null,
    is_active: formData.is_active,
  }

  if (formData.auth_type === 'none') {
    payload.auth_value = null
    return payload
  }

  if (mode === 'create') {
    payload.auth_value = authValue
    return payload
  }

  if (authValue) {
    payload.auth_value = authValue
  } else if (authTypeChanged) {
    payload.auth_value = null
  }

  return payload
}

export const formatDispatchTargetDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export const maskSecretValue = (value: string | null | undefined): string => {
  if (!value) return '-'
  if (value.length <= 4) return '****'

  return `${value.slice(0, 2)}${'*'.repeat(Math.min(8, Math.max(4, value.length - 4)))}${value.slice(-2)}`
}

export const toDispatchTargetFormData = (preset: DispatchTargetPreset): DispatchTargetFormData => ({
  name: preset.body.name,
  description: preset.body.description ?? '',
  url: preset.body.url,
  auth_type: preset.body.auth_type,
  auth_header_name: preset.body.auth_header_name ?? '',
  auth_value: preset.body.auth_value ?? '',
  is_active: preset.body.is_active ?? true,
})
