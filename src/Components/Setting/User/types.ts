/**
 * @file types.ts
 * @description Tipe data untuk manajemen user
 * NOTE: Tidak ada hardcoded role mapping — role diambil dari API roles
 */

export type UserStatus = 'active' | 'inactive'

// Struktur person dari API GET /users/:id
export interface UserPerson {
  id?: number
  natid?: string
  fullname?: string
  title?: string | null
  sex?: string | null
  birthplace?: string | null
  birthdate?: string | null
  religion?: string | null
  ethnic?: number | null
  citizenship?: string | null
  maritalstatus?: string | null
  education?: string | null
  work?: string | null
  // address adalah string gabungan dari API — di-parse manual
  address?: string | null
  phone?: string | null
  mail?: string | null
  photo_link?: string | null
  file_ktp_url?: string | null
  file_photo_url?: string | null
}

export interface UserItem {
  id: number
  username: string
  isactive: boolean
  institution_id?: number | null
  api_key_active?: boolean
  role_id?: number
  role_name?: string

  // Nested person object dari API GET /users/:id
  person?: UserPerson

  // Field flat dari API GET /users (list) — opsional
  name?: string
  email?: string
  mail?: string
  fullname?: string
  institutionId?: string | number
  institutionName?: string
  status?: UserStatus
  natid?: string
  title?: string | null
  sex?: 'L' | 'P' | null
  birthplace?: string | null
  birthdate?: string | null
  religion?: string | null
  ethnic?: number | null
  citizenship?: string | null
  maritalstatus?: string | null
  education?: string | null
  work?: string | null
  addr1?: string | null
  addr2?: string | null
  rt?: string | null
  rw?: string | null
  villages?: string | null
  districts?: string | null
  regencies?: string | null
  provincies?: string | null
  poscode?: string | null
  phone?: string | null
  photo_link?: string | null
  file_ktp_url?: string | null
  file_photo_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserFormData {
  username: string
  password: string
  role_id: number
  isactive: boolean | string
  institution_id?: number | null // FIX: was `string` — must be number | null to support clearing
  natid: string
  fullname: string
  title?: string | null
  sex?: 'L' | 'P' | null
  birthplace?: string | null
  birthdate?: string | null
  religion?: string | null
  ethnic?: number | null
  citizenship?: string | null
  maritalstatus?: string | null
  education?: string | null
  work?: string | null
  addr1?: string | null
  addr2?: string | null
  rt?: string | null
  rw?: string | null
  villages?: string | null
  districts?: string | null
  regencies?: string | null
  provincies?: string | null
  poscode?: string | null
  phone?: string | null
  mail?: string | null
  file_ktp?: string | null
  file_photo?: string | null
}

export const USER_FORM_INITIAL: UserFormData = {
  username: '',
  password: '',
  role_id: 0,
  isactive: true,
  institution_id: undefined,
  natid: '',
  fullname: '',
  title: null,
  sex: null,
  birthplace: null,
  birthdate: null,
  religion: null,
  ethnic: null,
  citizenship: null,
  maritalstatus: null,
  education: null,
  work: null,
  addr1: null,
  addr2: null,
  rt: null,
  rw: null,
  villages: null,
  districts: null,
  regencies: null,
  provincies: null,
  poscode: null,
  phone: null,
  mail: null,
  file_ktp: null,
  file_photo: null,
}

export interface UserListParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
}

// Tipe role option dari API roles — dipakai di form select
export interface RoleOption {
  label: string // role_name dari API
  value: number // id dari API
}
