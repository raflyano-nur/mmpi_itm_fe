/**
 * @file userManagementData.ts
 * @description Dummy data untuk modul Manajemen User.
 *
 * File ini berisi data dummy yang digunakan untuk development & testing.
 * Nantinya akan diganti dengan data dari API melalui Redux store.
 *
 * @module UserManagement/Data
 *
 * @example
 * // Import dan gunakan di komponen:
 * import { dummyUserData, dummyInstitusiData } from './userManagementData'
 *
 * <DataTable data={dummyUserData} columns={columns} />
 */

import type { UserItem, InstitusiItem } from './types'

// ============================================================
// DUMMY DATA — INSTITUSI
// ============================================================

/**
 * Data dummy institusi.
 * Digunakan sebagai referensi dropdown saat tambah/edit user.
 */
export const dummyInstitusiData: InstitusiItem[] = [
  {
    id: 'INST-001',
    namaInstitusi: 'Puskesmas Boyolali 1',
    alamat: 'Jl. Pandanaran No. 156, Boyolali',
    telepon: '0276-321001',
    email: 'puskesmas1@boyolali.go.id',
    createdAt: '2026-01-10 08:00',
  },
  {
    id: 'INST-002',
    namaInstitusi: 'Puskesmas Boyolali 2',
    alamat: 'Jl. Merapi No. 45, Boyolali',
    telepon: '0276-321002',
    email: 'puskesmas2@boyolali.go.id',
    createdAt: '2026-01-12 09:00',
  },
  {
    id: 'INST-003',
    namaInstitusi: 'RSUD Pandan Arang',
    alamat: 'Jl. Kantil No. 10, Boyolali',
    telepon: '0276-321100',
    email: 'rsud@boyolali.go.id',
    createdAt: '2026-01-15 10:00',
  },
]

// ============================================================
// DUMMY DATA — USER
// ============================================================

/**
 * Data dummy user sistem.
 * Mencakup berbagai skenario:
 * - Super Admin (institutionId = null)
 * - Admin Institusi (role: admin)
 * - IT Institusi (role: it)
 * - User aktif & nonaktif
 * - Tersebar di beberapa institusi berbeda
 */
export const dummyUserData: UserItem[] = [
  // ── Super Admin ──────────────────────────────────────────
  {
    id: 'USR-001',
    username: 'superadmin',
    namaLengkap: 'Super Administrator',
    phone: '081200000001',
    email: 'superadmin@diagnostik.id',
    role: 'super_admin',
    institutionId: null,
    namaInstitusi: null,
    status: 'aktif',
    createdAt: '2026-01-01 07:00',
  },

  // ── Admin & IT — Puskesmas Boyolali 1 ────────────────────
  {
    id: 'USR-002',
    username: 'admin.pkm1',
    namaLengkap: 'Rina Kusumawati',
    phone: '081211110001',
    email: 'rina.kusumawati@puskesmas1.go.id',
    role: 'admin',
    institutionId: 'INST-001',
    namaInstitusi: 'Puskesmas Boyolali 1',
    status: 'aktif',
    createdAt: '2026-01-10 09:00',
  },
  {
    id: 'USR-003',
    username: 'it.pkm1',
    namaLengkap: 'Agus Prasetyo',
    phone: '081211110002',
    email: 'agus.prasetyo@puskesmas1.go.id',
    role: 'it',
    institutionId: 'INST-001',
    namaInstitusi: 'Puskesmas Boyolali 1',
    status: 'aktif',
    createdAt: '2026-01-10 09:30',
  },
  {
    id: 'USR-004',
    username: 'it2.pkm1',
    namaLengkap: 'Fitri Handayani',
    phone: '081211110003',
    email: 'fitri.handayani@puskesmas1.go.id',
    role: 'it',
    institutionId: 'INST-001',
    namaInstitusi: 'Puskesmas Boyolali 1',
    status: 'nonaktif',
    createdAt: '2026-01-20 10:00',
  },

  // ── Admin & IT — Puskesmas Boyolali 2 ────────────────────
  {
    id: 'USR-005',
    username: 'admin.pkm2',
    namaLengkap: 'Hendra Wijaya',
    phone: '081222220001',
    email: 'hendra.wijaya@puskesmas2.go.id',
    role: 'admin',
    institutionId: 'INST-002',
    namaInstitusi: 'Puskesmas Boyolali 2',
    status: 'aktif',
    createdAt: '2026-01-12 10:00',
  },
  {
    id: 'USR-006',
    username: 'it.pkm2',
    namaLengkap: 'Dian Pertiwi',
    phone: '081222220002',
    email: 'dian.pertiwi@puskesmas2.go.id',
    role: 'it',
    institutionId: 'INST-002',
    namaInstitusi: 'Puskesmas Boyolali 2',
    status: 'aktif',
    createdAt: '2026-01-12 10:30',
  },

  // ── Admin & IT — RSUD Pandan Arang ───────────────────────
  {
    id: 'USR-007',
    username: 'admin.rsud',
    namaLengkap: 'dr. Bambang Sutrisno',
    phone: '081233330001',
    email: 'bambang.sutrisno@rsud.go.id',
    role: 'admin',
    institutionId: 'INST-003',
    namaInstitusi: 'RSUD Pandan Arang',
    status: 'aktif',
    createdAt: '2026-01-15 11:00',
  },
  {
    id: 'USR-008',
    username: 'it.rsud',
    namaLengkap: 'Wahyu Nugroho',
    phone: '081233330002',
    email: 'wahyu.nugroho@rsud.go.id',
    role: 'it',
    institutionId: 'INST-003',
    namaInstitusi: 'RSUD Pandan Arang',
    status: 'aktif',
    createdAt: '2026-01-15 11:30',
  },
  {
    id: 'USR-009',
    username: 'it2.rsud',
    namaLengkap: 'Maya Sari',
    phone: '081233330003',
    email: 'maya.sari@rsud.go.id',
    role: 'it',
    institutionId: 'INST-003',
    namaInstitusi: 'RSUD Pandan Arang',
    status: 'aktif',
    createdAt: '2026-02-01 08:00',
  },
  {
    id: 'USR-010',
    username: 'admin2.rsud',
    namaLengkap: 'Sri Mulyani',
    phone: '081233330004',
    email: 'sri.mulyani@rsud.go.id',
    role: 'admin',
    institutionId: 'INST-003',
    namaInstitusi: 'RSUD Pandan Arang',
    status: 'nonaktif',
    createdAt: '2026-02-10 09:00',
  },
]

// ============================================================
// HELPER — Filter by institution (untuk view IT/Admin)
// ============================================================

/**
 * Filter user berdasarkan institutionId.
 * Simulasi query: WHERE institution_id = ?
 *
 * @example
 * const myUsers = getUsersByInstitusi('INST-001')
 */
export const getUsersByInstitusi = (institutionId: string): UserItem[] =>
  dummyUserData.filter((u) => u.institutionId === institutionId)

/**
 * Cek apakah username sudah dipakai (untuk validasi form tambah user).
 *
 * @example
 * const taken = isUsernameTaken('admin.pkm1') // true
 */
export const isUsernameTaken = (username: string): boolean =>
  dummyUserData.some((u) => u.username === username)