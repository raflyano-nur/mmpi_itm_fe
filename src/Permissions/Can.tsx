/**
 * @file Can.tsx
 * @description Wrapper component untuk conditional rendering berdasarkan permission.
 *
 * Menggunakan pattern "Render Props" — hanya merender children jika user
 * memiliki permission yang diperlukan.
 *
 * Fallback support:
 * - Tidak ada fallback → tidak render apa-apa
 * - fallback={false} → tidak render apa-apa (explicit)
 * - fallback={<SomeComponent />} → render komponen alternatif
 * - fallback="text" → render teks alternatif
 *
 * CATATAN: Pengecekan permission di frontend hanya untuk UX (hide/show komponen).
 * Backend tetap menjadi sumber kebenaran utama.
 *
 * @module Permissions/Can
 */

import React from 'react'
import { usePermissionContext } from './usePermission'
import type { CanProps } from './types'

/**
 * Component wrapper yang hanya merender children jika user memiliki permission.
 *
 * @param props - { resource, action, children, fallback? }
 * @returns children jika permission ada, fallback jika tidak
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Can resource="devices" action="create">
 *   <Button>Tambah Device</Button>
 * </Can>
 *
 * // Dengan fallback
 * <Can resource="devices" action="delete" fallback={<span>No delete permission</span>}>
 *   <Button>Delete</Button>
 * </Can>
 *
 * // Multiple actions (any)
 * <Can resource="devices" action="update">
 *   <Button>Edit</Button>
 * </Can>
 * ```
 */
export const Can: React.FC<CanProps> = ({ resource, action, children, fallback = null }) => {
  const { can } = usePermissionContext()

  // Cek permission
  const hasPermission = can(resource, action)

  // Jika tidak punya permission, render fallback
  if (!hasPermission) {
    return <>{fallback}</>
  }

  // Jika punya permission, render children
  return <>{children}</>
}

/**
 * Alias untuk Can component untuk penggunaan yang lebih deklaratif.
 */
export const CanPerform = Can
