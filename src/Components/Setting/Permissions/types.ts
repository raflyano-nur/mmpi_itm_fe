/**
 * @file types.ts
 * @description Type definitions untuk modul Hak Akses (Permissions).
 *
 * @module Setting/Permissions/Types
 */

/** Definisi satu modul/fitur yang bisa diakses */
export interface ModulePermission {
  /** Key unik modul */
  key: string
  /** Nama modul yang ditampilkan */
  label: string
  /** Deskripsi singkat modul */
  description?: string
  /** Kategori/grup modul */
  category: string
  /** Apakah user memiliki akses ke modul ini */
  enabled: boolean
}

/** Representasi satu user dengan hak aksesnya */
export interface RoleItem {
  id: number
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
  role_name: string
  is_active: boolean
  description: string
  deleted_at: null | string
}

/** Payload untuk update permissions user */
export interface UpdatePermissionsPayload {
  userId: string
  permissions: { key: string; enabled: boolean }[]
}

/** Daftar modul yang tersedia di sistem (master) */
export interface ModuleDefinition {
  key: string
  label: string
  description: string
  category: string
}

/** Kategori modul */
export interface ModuleCategory {
  key: string
  label: string
  icon?: string
}
