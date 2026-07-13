/**
 * @file types.ts
 * @description Tipe data untuk manajemen role dengan API
 * NOTE: Tidak ada field "type" dari API — type di-derive dari role_name secara dinamis
 */

export type Permission = 
  | 'view_institutions'
  | 'create_institutions'
  | 'edit_institutions'
  | 'delete_institutions'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_devices'
  | 'create_devices'
  | 'edit_devices'
  | 'delete_devices'
  | 'view_patients'
  | 'view_all_patients'
  | 'print_results'
  | 'send_to_boyolali'
  | 'configure_api'
  | 'view_reports'
  | 'manage_roles'

// API Response Types
export interface ApiResponse<T> {
  status: string
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: {
    url: string | null
    label: string
    active: boolean
  }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface PermissionResource {
  id: number
  permission_name: string
  resource_id: number
}

export interface RolePermission {
  id: number
  role_id: number
  permission_id: number
  resource_id: number
  permission?: PermissionResource
  resource?: {
    id: number
    resource_name: string
  }
}

// Role Model from API — tidak ada field "type"
export interface ApiRole {
  id: number
  role_name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number | null
  updated_by: number | null
  permissions?: RolePermission[]
}

// Role untuk ditampilkan di UI (transformed)
export interface Role {
  id: number
  name: string
  type: string         // dinamis: langsung dari role_name (e.g. "ADMIN", "DOKTER")
  description: string
  permissions: Permission[]
  usersCount: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  deletedAt: string | null
}

// Form data — tidak perlu field "type" karena itu adalah role_name itu sendiri
export interface RoleFormData {
  role_name: string
  description?: string | null
  is_active?: boolean
  permissions: Permission[]
}

// API Params
export interface RoleListParams {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  with_deleted?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export const ROLE_FORM_INITIAL: RoleFormData = {
  role_name: '',
  description: '',
  is_active: true,
  permissions: []
}

// Mapping permission ke label yang mudah dibaca
export const PERMISSION_LABELS: Record<Permission, string> = {
  view_institutions: 'Lihat Institusi',
  create_institutions: 'Tambah Institusi',
  edit_institutions: 'Edit Institusi',
  delete_institutions: 'Hapus Institusi',
  view_users: 'Lihat User',
  create_users: 'Tambah User',
  edit_users: 'Edit User',
  delete_users: 'Hapus User',
  view_devices: 'Lihat Alat',
  create_devices: 'Tambah Alat',
  edit_devices: 'Edit Alat',
  delete_devices: 'Hapus Alat',
  view_patients: 'Lihat Data Pasien',
  view_all_patients: 'Lihat Semua Data Pasien',
  print_results: 'Cetak Hasil',
  send_to_boyolali: 'Kirim ke Boyolali Sehat',
  configure_api: 'Konfigurasi API',
  view_reports: 'Lihat Laporan',
  manage_roles: 'Kelola Role'
}

// Group permissions berdasarkan kategori
export const PERMISSION_GROUPS = [
  {
    name: 'Institusi',
    permissions: ['view_institutions', 'create_institutions', 'edit_institutions', 'delete_institutions'] as Permission[]
  },
  {
    name: 'User',
    permissions: ['view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles'] as Permission[]
  },
  {
    name: 'Alat (Device)',
    permissions: ['view_devices', 'create_devices', 'edit_devices', 'delete_devices'] as Permission[]
  },
  {
    name: 'Data Pasien',
    permissions: ['view_patients', 'view_all_patients', 'print_results', 'send_to_boyolali'] as Permission[]
  },
  {
    name: 'Laporan & Konfigurasi',
    permissions: ['view_reports', 'configure_api'] as Permission[]
  }
]

// Mapping permission dari API ke format UI
export const mapApiPermissionsToUI = (permissions?: RolePermission[]): Permission[] => {
  if (!permissions) return []

  const validPermissions = new Set<Permission>([
    'view_institutions', 'create_institutions', 'edit_institutions', 'delete_institutions',
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'view_devices', 'create_devices', 'edit_devices', 'delete_devices',
    'view_patients', 'view_all_patients', 'print_results', 'send_to_boyolali',
    'configure_api', 'view_reports', 'manage_roles'
  ])

  return permissions
    .map(p => p.permission?.permission_name as Permission)
    .filter(name => name && validPermissions.has(name))
    .filter((v, i, a) => a.indexOf(v) === i) // unique
}

// Transform API Role ke UI Role
export const transformApiRole = (apiRole: ApiRole): Role => {
  return {
    id: apiRole.id,
    name: apiRole.role_name,
    type: apiRole.role_name,  // type = role_name langsung, tidak perlu mapping
    description: apiRole.description || '',
    permissions: mapApiPermissionsToUI(apiRole.permissions),
    usersCount: 0,
    createdAt: apiRole.created_at,
    updatedAt: apiRole.updated_at,
    isActive: apiRole.is_active,
    deletedAt: apiRole.deleted_at ?? null
  }
}

/**
 * Generate warna badge yang konsisten berdasarkan nama role.
 * Hash sederhana agar tiap nama role selalu dapat warna yang sama.
 */
export const getRoleBadgeColor = (roleName: string): string => {
  const colors = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
  ]
  const hash = roleName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * Generate warna icon berdasarkan nama role (untuk background icon)
 */
export const getRoleIconColor = (roleName: string): { bg: string; icon: string } => {
  const iconColors = [
    { bg: 'bg-purple-100', icon: 'text-purple-600' },
    { bg: 'bg-blue-100', icon: 'text-blue-600' },
    { bg: 'bg-green-100', icon: 'text-green-600' },
    { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
    { bg: 'bg-pink-100', icon: 'text-pink-600' },
    { bg: 'bg-orange-100', icon: 'text-orange-600' },
    { bg: 'bg-teal-100', icon: 'text-teal-600' },
    { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
  ]
  const hash = roleName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return iconColors[hash % iconColors.length]
}