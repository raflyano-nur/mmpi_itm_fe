/**
 * @file usePermission.ts
 * @description React hooks untuk permission checking.
 *
 * Menyediakan dua hooks:
 * - `usePermissionContext()` → akses langsung ke PermissionContext
 * - `usePermission(resource)` → scoped ke resource tertentu dengan method can/canAny/canAll
 *
 * Pengecekan permission di frontend hanya untuk UX (hide/show komponen).
 * Backend tetap menjadi sumber kebenaran utama.
 *
 * @module Permissions/usePermission
 */

import { useContext, useMemo } from 'react'
import { PermissionContext } from './PermissionContext'
import type { PermissionContextValue, UsePermissionReturn } from './types'

// ============================================================
// usePermissionContext — Akses langsung ke context
// ============================================================

/**
 * Hook untuk mengakses PermissionContext secara langsung.
 * Berguna ketika perlu cek permission lintas resource.
 *
 * @returns PermissionContextValue
 * @throws Error jika digunakan di luar PermissionProvider
 *
 * @example
 * ```tsx
 * const { can, canAny, permissions } = usePermissionContext()
 *
 * if (can('devices', 'create')) {
 *   // tampilkan tombol tambah device
 * }
 *
 * if (canAny('users', ['view', 'export'])) {
 *   // tampilkan menu users
 * }
 * ```
 */
export const usePermissionContext = (): PermissionContextValue => {
  const context = useContext(PermissionContext)

  if (!context) {
    throw new Error(
      '[usePermissionContext] Hook harus digunakan di dalam <PermissionProvider>. ' +
        'Pastikan komponen ini dibungkus oleh PermissionProvider.',
    )
  }

  return context
}

// ============================================================
// usePermission — Scoped ke resource tertentu
// ============================================================

/**
 * Hook untuk cek permission yang di-scope ke resource tertentu.
 * Mengembalikan method `can`, `canAny`, `canAll` yang sudah terikat ke resource.
 *
 * @param resource - Nama resource (e.g. "devices", "users")
 * @returns UsePermissionReturn
 *
 * @example
 * ```tsx
 * function DeviceManagement() {
 *   const { can, canAny, canAll, actions } = usePermission('devices')
 *
 *   return (
 *     <div>
 *       {can('view') && <DeviceList />}
 *       {can('create') && <Button>Tambah Device</Button>}
 *       {canAny(['update', 'delete']) && <ActionColumn />}
 *       {canAll(['export', 'print']) && <BulkActions />}
 *       <p>Actions tersedia: {actions.join(', ')}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export const usePermission = (resource: string): UsePermissionReturn => {
  const { permissions } = usePermissionContext()

  return useMemo(() => {
    const resourceActions = permissions[resource] ?? []

    return {
      /**
       * Cek apakah user bisa melakukan action tertentu pada resource ini.
       * @param action - Nama action (e.g. "view", "create")
       */
      can: (action: string): boolean => {
        return resourceActions.includes(action)
      },

      /**
       * Cek apakah user bisa melakukan salah satu dari beberapa action.
       * @param actions - Array action yang dicek
       */
      canAny: (actions: string[]): boolean => {
        return actions.some((action) => resourceActions.includes(action))
      },

      /**
       * Cek apakah user bisa melakukan semua action.
       * @param actions - Array action yang dicek
       */
      canAll: (actions: string[]): boolean => {
        return actions.every((action) => resourceActions.includes(action))
      },

      /** Daftar action yang diizinkan untuk resource ini */
      actions: resourceActions,
    }
  }, [permissions, resource])
}
