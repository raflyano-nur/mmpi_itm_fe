/**
 * @file permissionsUtils.ts
 * @description Utility functions reusable untuk modul Hak Akses (Permissions).
 *
 * Berisi fungsi-fungsi helper yang dapat digunakan kembali untuk:
 * - Transformasi data API ke format internal
 * - Grouping permissions berdasarkan resource
 * - Kalkulasi statistik permissions
 * - Toggle helpers
 * - Payload builder (hanya resource yang berubah)
 *
 * @module Setting/Permissions/Utils
 */

import type { RoleResourceItem } from '@/Services/Modules/permissions/getRolePermission'

// ============================================================
// TYPES INTERNAL
// ============================================================

/**
 * Representasi satu permission item dalam state lokal panel.
 * Merupakan flatten dari RoleResourceItem + RolePermissionItem.
 *
 * Unique key: `resource_id` + `id` (karena permission ID bisa sama di resource berbeda)
 */
export interface FlatPermissionItem {
  /** ID unik permission dari API */
  id: number
  /** Nama permission (e.g. "view", "create") */
  permission_name: string
  /** Apakah permission ini aktif */
  granted: boolean
  /** ID resource induk */
  resource_id: number
  /** Nama resource induk (digunakan sebagai label) */
  resource_name: string
  /** Deskripsi resource (digunakan sebagai label kategori) */
  category: string
}

/**
 * Grup permissions berdasarkan resource_id.
 */
export interface PermissionGroup {
  /** Nama kategori (dari description resource, fallback ke resource_name) */
  category: string
  /** Nama resource asli */
  resource_name: string
  /** ID resource */
  resource_id: number
  /** Daftar permission items dalam grup ini */
  items: FlatPermissionItem[]
}

/**
 * Payload per resource untuk API update.
 */
export interface ResourcePermissionPayload {
  resource_id: number
  permissions: { id: number; granted: boolean }[]
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Buat unique key untuk setiap FlatPermissionItem.
 * Kombinasi resource_id + permission id agar unik.
 */
export const getPermissionKey = (item: FlatPermissionItem): string => {
  return `${item.resource_id}_${item.id}`
}

// ============================================================
// TRANSFORMASI DATA
// ============================================================

/**
 * Flatten data API (RoleResourceItem[]) menjadi array FlatPermissionItem[].
 *
 * Setiap resource memiliki banyak permissions. Fungsi ini
 * menggabungkan informasi resource ke setiap permission item
 * agar mudah dikelola dalam state lokal.
 *
 * @param resources - Array RoleResourceItem dari API response
 * @returns Array FlatPermissionItem yang sudah di-flatten
 *
 * @example
 * const flat = flattenPermissions(apiResponse.data)
 * // [{ id: 1, permission_name: 'view', granted: true, resource_id: 1, resource_name: 'Dashboard', category: 'Modul Dashboard' }, ...]
 */
export const flattenPermissions = (resources: RoleResourceItem[]): FlatPermissionItem[] => {
  return resources.flatMap((resource) =>
    resource.permissions.map((perm) => ({
      id: perm.id,
      permission_name: perm.permission_name,
      granted: perm.granted,
      resource_id: resource.resource_id,
      resource_name: resource.resource_name,
      category: resource.description ?? resource.resource_name,
    })),
  )
}

/**
 * Group FlatPermissionItem[] berdasarkan resource_id.
 *
 * Urutan grup mengikuti urutan kemunculan pertama resource dalam array.
 *
 * @param items - Array FlatPermissionItem yang sudah di-flatten
 * @returns Array PermissionGroup yang sudah dikelompokkan
 *
 * @example
 * const groups = groupPermissionsByResource(flatItems)
 * // [{ category: 'Modul Dashboard', resource_name: 'Dashboard', resource_id: 1, items: [...] }, ...]
 */
export const groupPermissionsByResource = (items: FlatPermissionItem[]): PermissionGroup[] => {
  const groupMap = new Map<number, PermissionGroup>()

  for (const item of items) {
    const key = item.resource_id

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        category: item.category,
        resource_name: item.resource_name,
        resource_id: item.resource_id,
        items: [],
      })
    }

    groupMap.get(key)!.items.push(item)
  }

  return Array.from(groupMap.values())
}

// ============================================================
// KALKULASI STATISTIK
// ============================================================

/**
 * Hitung jumlah permission yang aktif (granted = true).
 *
 * @param items - Array FlatPermissionItem
 * @returns Jumlah item dengan granted = true
 */
export const countGranted = (items: FlatPermissionItem[]): number => {
  return items.filter((p) => p.granted).length
}

/**
 * Cek apakah semua permission dalam array aktif.
 *
 * @param items - Array FlatPermissionItem
 * @returns true jika semua item granted = true
 */
export const isAllGranted = (items: FlatPermissionItem[]): boolean => {
  return items.length > 0 && items.every((p) => p.granted)
}

/**
 * Cek apakah sebagian (tapi tidak semua) permission dalam array aktif.
 *
 * @param items - Array FlatPermissionItem
 * @returns true jika ada yang granted = true tapi tidak semua
 */
export const isSomeGranted = (items: FlatPermissionItem[]): boolean => {
  return items.some((p) => p.granted) && !isAllGranted(items)
}

// ============================================================
// TOGGLE HELPERS
// ============================================================

/**
 * Toggle satu permission berdasarkan resource_id + permission id.
 *
 * Menggunakan kombinasi resource_id + id sebagai unique key
 * karena permission ID bisa sama di resource berbeda.
 *
 * @param items - Array FlatPermissionItem (state saat ini)
 * @param resourceId - ID resource induk
 * @param permissionId - ID permission yang akan di-toggle
 * @returns Array baru dengan permission yang sudah di-toggle
 */
export const togglePermissionById = (
  items: FlatPermissionItem[],
  resourceId: number,
  permissionId: number,
): FlatPermissionItem[] => {
  return items.map((p) =>
    p.resource_id === resourceId && p.id === permissionId ? { ...p, granted: !p.granted } : p,
  )
}

/**
 * Toggle semua permission dalam satu resource (berdasarkan resource_id).
 *
 * Jika semua sudah aktif → nonaktifkan semua.
 * Jika ada yang nonaktif → aktifkan semua.
 *
 * @param items - Array FlatPermissionItem (state saat ini)
 * @param resourceId - ID resource yang akan di-toggle
 * @returns Array baru dengan permissions resource yang sudah di-toggle
 */
export const togglePermissionsByResource = (
  items: FlatPermissionItem[],
  resourceId: number,
): FlatPermissionItem[] => {
  const resourceItems = items.filter((p) => p.resource_id === resourceId)
  const allEnabled = isAllGranted(resourceItems)

  return items.map((p) => (p.resource_id === resourceId ? { ...p, granted: !allEnabled } : p))
}

/**
 * Toggle semua permission (aktifkan semua atau nonaktifkan semua).
 *
 * Jika semua sudah aktif → nonaktifkan semua.
 * Jika ada yang nonaktif → aktifkan semua.
 *
 * @param items - Array FlatPermissionItem (state saat ini)
 * @returns Array baru dengan semua permissions yang sudah di-toggle
 */
export const toggleAllPermissions = (items: FlatPermissionItem[]): FlatPermissionItem[] => {
  const allEnabled = isAllGranted(items)
  return items.map((p) => ({ ...p, granted: !allEnabled }))
}

// ============================================================
// PAYLOAD BUILDER
// ============================================================

/**
 * Buat payload untuk API update permissions.
 * Hanya menyertakan resource yang memiliki perubahan (dibandingkan dengan state awal).
 *
 * Format output:
 * ```json
 * [
 *   {
 *     "resource_id": 14,
 *     "permissions": [
 *       { "id": 15, "granted": true },
 *       { "id": 11, "granted": true }
 *     ]
 *   }
 * ]
 * ```
 *
 * @param currentItems - Array FlatPermissionItem (state saat ini)
 * @param originalItems - Array FlatPermissionItem (state awal dari API)
 * @returns Array ResourcePermissionPayload hanya untuk resource yang berubah
 */
export const buildChangedResourcesPayload = (
  currentItems: FlatPermissionItem[],
  originalItems: FlatPermissionItem[],
): ResourcePermissionPayload[] => {
  // Buat lookup map dari original items: key = "resource_id_permissionId" → granted
  const originalMap = new Map<string, boolean>()
  for (const item of originalItems) {
    originalMap.set(getPermissionKey(item), item.granted)
  }

  // Cari resource_id yang memiliki perubahan
  const changedResourceIds = new Set<number>()
  for (const item of currentItems) {
    const originalGranted = originalMap.get(getPermissionKey(item))
    if (originalGranted !== undefined && originalGranted !== item.granted) {
      changedResourceIds.add(item.resource_id)
    }
  }

  // Bangun payload hanya untuk resource yang berubah
  // Sertakan SEMUA permissions dari resource tersebut (bukan hanya yang berubah)
  const payload: ResourcePermissionPayload[] = []
  for (const resourceId of changedResourceIds) {
    const resourcePermissions = currentItems
      .filter((p) => p.resource_id === resourceId)
      .map((p) => ({ id: p.id, granted: p.granted }))

    payload.push({
      resource_id: resourceId,
      permissions: resourcePermissions,
    })
  }

  return payload
}
