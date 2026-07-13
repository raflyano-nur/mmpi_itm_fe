/**
 * @file permissionEvents.ts
 * @description Event emitter untuk permission system.
 *
 * Memisahkan interceptor API dari React context sehingga:
 * - Interceptor bisa emit event tanpa bergantung pada React tree
 * - Context/hook bisa subscribe ke event tanpa coupling ke interceptor
 * - Mudah di-test dan di-extend
 *
 * Events:
 * - `permission:denied` → Ketika backend mengembalikan 403
 * - `permission:refreshed` → Ketika token berhasil di-refresh (permission baru)
 * - `permission:refresh-failed` → Ketika refresh token gagal setelah 403
 *
 * @module Permissions/permissionEvents
 */

import type { PermissionEventType, PermissionEventMap } from './types'

// ============================================================
// EVENT EMITTER
// ============================================================

type Listener<T> = (payload: T) => void

/**
 * Typed event emitter untuk permission events.
 * Singleton — digunakan di seluruh aplikasi.
 */
class PermissionEventEmitter {
  private listeners: Map<string, Set<Listener<any>>> = new Map()

  /**
   * Subscribe ke event tertentu.
   *
   * @param event - Tipe event
   * @param listener - Callback yang dipanggil saat event di-emit
   * @returns Fungsi unsubscribe
   *
   * @example
   * ```ts
   * const unsub = permissionEvents.on('permission:denied', (payload) => {
   *   console.log(`Akses ditolak: ${payload.resource}.${payload.permission}`)
   * })
   *
   * // Cleanup
   * unsub()
   * ```
   */
  on<E extends PermissionEventType>(event: E, listener: Listener<PermissionEventMap[E]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener)
    }
  }

  /**
   * Subscribe ke event, tapi hanya dipanggil sekali.
   *
   * @param event - Tipe event
   * @param listener - Callback yang dipanggil sekali
   * @returns Fungsi unsubscribe
   */
  once<E extends PermissionEventType>(event: E, listener: Listener<PermissionEventMap[E]>): () => void {
    const wrappedListener = (payload: PermissionEventMap[E]) => {
      listener(payload)
      this.listeners.get(event)?.delete(wrappedListener)
    }

    return this.on(event, wrappedListener)
  }

  /**
   * Emit event ke semua listener yang terdaftar.
   *
   * @param event - Tipe event
   * @param payload - Data yang dikirim ke listener
   *
   * @example
   * ```ts
   * permissionEvents.emit('permission:denied', {
   *   status: 403,
   *   title: 'Akses Ditolak',
   *   permission: 'view',
   *   resource: 'devices',
   * })
   * ```
   */
  emit<E extends PermissionEventType>(event: E, payload: PermissionEventMap[E]): void {
    const eventListeners = this.listeners.get(event)

    if (!eventListeners || eventListeners.size === 0) {
      console.debug(`[PermissionEvents] No listeners for "${event}"`)
      return
    }

    console.log(`[PermissionEvents] Emitting "${event}" to ${eventListeners.size} listener(s)`)

    for (const listener of eventListeners) {
      try {
        listener(payload)
      } catch (error) {
        console.error(`[PermissionEvents] Error in listener for "${event}":`, error)
      }
    }
  }

  /**
   * Hapus semua listener untuk event tertentu, atau semua event.
   *
   * @param event - Tipe event (opsional). Jika tidak diberikan, hapus semua.
   */
  off(event?: PermissionEventType): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

/**
 * Singleton instance dari PermissionEventEmitter.
 * Digunakan di interceptor API dan React context/hooks.
 */
export const permissionEvents = new PermissionEventEmitter()
