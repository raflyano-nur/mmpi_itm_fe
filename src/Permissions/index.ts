/**
 * @file index.ts
 * @description Barrel export untuk Permission system.
 *
 * Exports:
 * - types: Tipe TypeScript
 * - PermissionProvider: Context Provider
 * - PermissionContext: React Context
 * - usePermissionContext: Hook untuk akses context langsung
 * - usePermission: Hook untuk scoped permission
 * - Can: Wrapper component
 * - CanPerform: Alias untuk Can
 * - permissionEvents: Event emitter
 *
 * @module Permissions
 */

// Types
export * from './types'

// Context & Provider
export { PermissionProvider } from './PermissionContext'
export { PermissionContext } from './PermissionContext'

// Hooks
export { usePermissionContext, usePermission } from './usePermission'

// Components
export { Can, CanPerform } from './Can'

// Events (for advanced usage)
export { permissionEvents } from './permissionEvents'
