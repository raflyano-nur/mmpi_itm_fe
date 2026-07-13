/**
 * @file PermissionContext.tsx
 * @description React Context untuk permission system.
 *
 * Membaca permission dari Redux store (yang di-parse dari JWT payload)
 * dan menyediakan method `can`, `canAny`, `canAll` ke seluruh component tree.
 *
 * Juga subscribe ke permissionEvents untuk:
 * - Menampilkan toast notifikasi saat 403 (permission:denied)
 * - Auto-refresh token dan update permission saat menerima 403
 * - Menampilkan notifikasi saat refresh gagal
 *
 * @module Permissions/PermissionContext
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { notification } from 'antd'
import type { RootState } from '@/Store'
import type { PermissionContextValue, PermissionMap, PermissionDeniedPayload } from './types'
import { permissionEvents } from './permissionEvents'

// ============================================================
// CONTEXT
// ============================================================

const defaultContextValue: PermissionContextValue = {
  permissions: {},
  can: () => false,
  canAny: () => false,
  canAll: () => false,
  isLoading: false,
}

export const PermissionContext = createContext<PermissionContextValue>(defaultContextValue)

// ============================================================
// PROVIDER
// ============================================================

interface PermissionProviderProps {
  children: React.ReactNode
}

/**
 * Provider yang membungkus aplikasi dan menyediakan permission context.
 *
 * Harus ditempatkan di dalam `<Provider store={store}>` karena
 * membaca permission dari Redux store.
 *
 * @example
 * ```tsx
 * <Provider store={store}>
 *   <PermissionProvider>
 *     <App />
 *   </PermissionProvider>
 * </Provider>
 * ```
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const permissions = useSelector((state: RootState) => state.AuthSlicer?.permissions ?? {})
  const [isLoading, setIsLoading] = useState(false)

  // ─── Permission check methods ───

  /**
   * Cek apakah user memiliki permission untuk action tertentu pada resource.
   *
   * @param resource - Nama resource (e.g. "devices", "users")
   * @param action - Nama action (e.g. "view", "create", "delete")
   * @returns true jika user memiliki permission
   */
  const can = useCallback(
    (resource: string, action: string): boolean => {
      const resourceActions = permissions[resource]
      if (!resourceActions) return false
      return resourceActions.includes(action)
    },
    [permissions],
  )

  /**
   * Cek apakah user memiliki salah satu dari beberapa action pada resource.
   *
   * @param resource - Nama resource
   * @param actions - Array action yang dicek
   * @returns true jika user memiliki minimal satu action
   */
  const canAny = useCallback(
    (resource: string, actions: string[]): boolean => {
      const resourceActions = permissions[resource]
      if (!resourceActions) return false
      return actions.some((action) => resourceActions.includes(action))
    },
    [permissions],
  )

  /**
   * Cek apakah user memiliki semua action pada resource.
   *
   * @param resource - Nama resource
   * @param actions - Array action yang dicek
   * @returns true jika user memiliki semua action
   */
  const canAll = useCallback(
    (resource: string, actions: string[]): boolean => {
      const resourceActions = permissions[resource]
      if (!resourceActions) return false
      return actions.every((action) => resourceActions.includes(action))
    },
    [permissions],
  )

  // ─── Subscribe ke permission events ───

  useEffect(() => {
    // Handler: permission denied (403 dari backend)
    const unsubDenied = permissionEvents.on('permission:denied', (payload: PermissionDeniedPayload) => {
      console.warn(`[PermissionContext] Permission denied: ${payload.resource}.${payload.permission}`)

      notification.warning({
        message: payload.title || 'Akses Ditolak',
        description: `Anda tidak memiliki izin "${payload.permission}" untuk resource "${payload.resource}".`,
        placement: 'topRight',
        duration: 5,
      })
    })

    // Handler: permission refreshed (token baru, permission baru)
    const unsubRefreshed = permissionEvents.on('permission:refreshed', (newPermissions: PermissionMap) => {
      console.log('[PermissionContext] Permissions refreshed:', Object.keys(newPermissions))
      setIsLoading(false)

      notification.info({
        message: 'Hak Akses Diperbarui',
        description: 'Permission Anda telah diperbarui dari server.',
        placement: 'topRight',
        duration: 3,
      })
    })

    // Handler: refresh failed
    const unsubFailed = permissionEvents.on('permission:refresh-failed', ({ reason }) => {
      console.error('[PermissionContext] Permission refresh failed:', reason)
      setIsLoading(false)

      notification.error({
        message: 'Gagal Memperbarui Hak Akses',
        description: reason || 'Terjadi kesalahan saat memperbarui permission.',
        placement: 'topRight',
        duration: 5,
      })
    })

    return () => {
      unsubDenied()
      unsubRefreshed()
      unsubFailed()
    }
  }, [])

  // ─── Memoize context value ───

  const contextValue = useMemo<PermissionContextValue>(
    () => ({
      permissions,
      can,
      canAny,
      canAll,
      isLoading,
    }),
    [permissions, can, canAny, canAll, isLoading],
  )

  return <PermissionContext.Provider value={contextValue}>{children}</PermissionContext.Provider>
}
