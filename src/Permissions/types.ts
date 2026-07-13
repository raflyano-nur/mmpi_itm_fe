/**
 * @file types.ts
 * @description Tipe-tipe TypeScript untuk Permission system.
 *
 * Permission disimpan di JWT payload sebagai pasangan resource → action[].
 * Contoh: { "devices": ["create", "update"], "users": ["view", "delete"] }
 *
 * @module Permissions/types
 */

// ============================================================
// PERMISSION MAP (dari JWT payload)
// ============================================================

/**
 * Map resource ke daftar action yang diizinkan.
 * Sama dengan `Permissions` di auth.types.ts, di-re-export untuk konsistensi.
 *
 * @example
 * ```ts
 * const perms: PermissionMap = {
 *   devices: ['create', 'update'],
 *   users: ['view', 'delete', 'export'],
 * }
 * ```
 */
export type PermissionMap = Record<string, string[]>

// ============================================================
// PERMISSION DENIED EVENT (dari 403 response)
// ============================================================

/**
 * Payload event ketika backend mengembalikan 403 Forbidden.
 * Sesuai format error backend:
 * ```json
 * { "status": 403, "data": { "status": "error", "title": "Akses Ditolak", "permission": "view", "resource": "devices" } }
 * ```
 */
export interface PermissionDeniedPayload {
  /** HTTP status code (selalu 403) */
  status: number
  /** Judul error dari backend */
  title: string
  /** Action yang ditolak (e.g. "view", "create", "delete") */
  permission: string
  /** Resource yang ditolak (e.g. "devices", "users") */
  resource: string
}

// ============================================================
// PERMISSION CONTEXT VALUE
// ============================================================

/**
 * Value yang disediakan oleh PermissionContext.
 */
export interface PermissionContextValue {
  /** Map lengkap permission dari JWT */
  permissions: PermissionMap
  /** Cek apakah user memiliki permission tertentu */
  can: (resource: string, action: string) => boolean
  /** Cek apakah user memiliki salah satu dari beberapa action pada resource */
  canAny: (resource: string, actions: string[]) => boolean
  /** Cek apakah user memiliki semua action pada resource */
  canAll: (resource: string, actions: string[]) => boolean
  /** Apakah permission sedang loading (misal saat refresh token) */
  isLoading: boolean
}

// ============================================================
// PERMISSION HOOK RETURN
// ============================================================

/**
 * Return value dari usePermission(resource) hook.
 */
export interface UsePermissionReturn {
  /** Cek apakah user bisa melakukan action tertentu pada resource ini */
  can: (action: string) => boolean
  /** Cek apakah user bisa melakukan salah satu dari beberapa action */
  canAny: (actions: string[]) => boolean
  /** Cek apakah user bisa melakukan semua action */
  canAll: (actions: string[]) => boolean
  /** Daftar action yang diizinkan untuk resource ini */
  actions: string[]
}

// ============================================================
// CAN COMPONENT PROPS
// ============================================================

/**
 * Props untuk komponen <Can>.
 */
export interface CanProps {
  /** Resource yang dicek (e.g. "devices", "users") */
  resource: string
  /** Action yang dicek (e.g. "view", "create") */
  action: string
  /** Konten yang ditampilkan jika permission ada */
  children: React.ReactNode
  /** Konten fallback jika permission tidak ada (opsional) */
  fallback?: React.ReactNode
}

// ============================================================
// PERMISSION EVENT TYPES
// ============================================================

/**
 * Tipe event yang didukung oleh permission event system.
 */
export type PermissionEventType = 'permission:denied' | 'permission:refreshed' | 'permission:refresh-failed'

/**
 * Map event type ke payload-nya.
 */
export interface PermissionEventMap {
  'permission:denied': PermissionDeniedPayload
  'permission:refreshed': PermissionMap
  'permission:refresh-failed': { reason: string }
}
