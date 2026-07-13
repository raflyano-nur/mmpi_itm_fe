/**
 * @file types.ts
 * @description Type definitions untuk modul User Management.
 *
 * File ini berisi semua interface dan type yang digunakan
 * di seluruh komponen User Management (tabel, modal form, dropdown, dll).
 *
 * @module UserManagement/Types
 */

// ============================================================
// ENUMS / LITERAL TYPES
// ============================================================

/**
 * Role user yang tersedia dalam sistem.
 *
 * @example
 * const role: UserRole = 'it'
 */
export type UserRole = 'super_admin' | 'admin' | 'it'

/**
 * Status aktifitas user.
 *
 * @example
 * const status: UserStatus = 'aktif'
 */
export type UserStatus = 'aktif' | 'nonaktif'

// ============================================================
// INSTITUSI
// ============================================================

/**
 * Representasi satu data institusi kesehatan.
 * Digunakan sebagai referensi dropdown saat tambah/edit user.
 *
 * @example
 * const institusi: InstitusiItem = {
 *   id: 'INST-001',
 *   namaInstitusi: 'Puskesmas Boyolali 1',
 *   alamat: 'Jl. Pandanaran No. 156, Boyolali',
 *   telepon: '0276-321001',
 *   email: 'puskesmas1@boyolali.go.id',
 *   createdAt: '2026-01-10 08:00',
 * }
 */
export interface InstitusiItem {
  /** ID unik institusi */
  id: string
  /** Nama resmi institusi */
  namaInstitusi: string
  /** Alamat lengkap institusi */
  alamat: string
  /** Nomor telepon institusi */
  telepon: string
  /** Email resmi institusi */
  email: string
  /** Waktu data dibuat (format: YYYY-MM-DD HH:mm) */
  createdAt: string
}

// ============================================================
// USER
// ============================================================

/**
 * Representasi satu data user dalam sistem.
 * Mencakup informasi profil, role, dan relasi ke institusi.
 *
 * @example
 * const user: UserItem = {
 *   id: 'USR-003',
 *   username: 'it.pkm1',
 *   namaLengkap: 'Agus Prasetyo',
 *   phone: '081211110002',
 *   email: 'agus@puskesmas1.go.id',
 *   role: 'it',
 *   institutionId: 'INST-001',
 *   namaInstitusi: 'Puskesmas Boyolali 1',
 *   status: 'aktif',
 *   createdAt: '2026-01-10 09:30',
 * }
 */
export interface UserItem {
  /** ID unik user */
  id: string
  /** Username untuk login (unique) */
  username: string
  /** Nama lengkap user */
  namaLengkap: string
  /** Nomor telepon user */
  phone: string
  /** Email user */
  email: string
  /** Role user dalam sistem */
  role: UserRole
  /** ID institusi tempat user bernaung. Null untuk Super Admin */
  institutionId: string | null
  /** Nama institusi (denormalized untuk kemudahan tampil). Null untuk Super Admin */
  namaInstitusi: string | null
  /** Status aktifitas user */
  status: UserStatus
  /** Waktu akun dibuat (format: YYYY-MM-DD HH:mm) */
  createdAt: string
}

// ============================================================
// FORM
// ============================================================

/**
 * Payload untuk membuat user baru.
 * Digunakan pada form tambah user.
 *
 * @example
 * const payload: CreateUserPayload = {
 *   username: 'it.pkm3',
 *   password: 'rahasia123',
 *   namaLengkap: 'Budi Santoso',
 *   phone: '08123456789',
 *   email: 'budi@puskesmas3.go.id',
 *   role: 'it',
 *   institutionId: 'INST-001',
 * }
 */
export interface CreateUserPayload {
  username: string
  password: string
  namaLengkap: string
  phone: string
  email: string
  /** Role yang dapat dipilih oleh IT: 'admin' | 'it'. Super Admin bisa semua. */
  role: UserRole
  /** Diisi otomatis dari institution_id pembuat jika role IT yang membuat */
  institutionId: string | null
}

/**
 * Payload untuk mengupdate data user yang sudah ada.
 * Password opsional — hanya diisi jika ingin mengganti.
 *
 * @example
 * const payload: UpdateUserPayload = {
 *   id: 'USR-003',
 *   namaLengkap: 'Agus Prasetyo Updated',
 *   phone: '081299990000',
 *   email: 'agus.new@puskesmas1.go.id',
 *   status: 'nonaktif',
 * }
 */
export interface UpdateUserPayload {
  id: string
  namaLengkap?: string
  phone?: string
  email?: string
  password?: string
  status?: UserStatus
  role?: UserRole
}

// ============================================================
// API
// ============================================================

/**
 * Raw response dari API user management (sebelum di-map).
 * Struktur ini menyesuaikan dengan format response backend.
 */
export interface UserApiResponse {
  [key: string]: any
}

/**
 * Mapping field dari API response ke field aplikasi.
 * Key = field di aplikasi, Value = field dari API.
 *
 * @example
 * // API response: { full_name: '...', institution_id: '...' }
 * // Mapped to:    { namaLengkap: '...', institutionId: '...' }
 */
export interface UserApiMapping {
  [appKey: string]: string
}