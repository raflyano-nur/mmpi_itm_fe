/**
 * @file roleData.ts
 * @description Data dummy untuk role
 * NOTE: id sudah number (bukan string), type = role_name langsung, tidak ada DEFAULT_ROLE_PERMISSIONS
 */

import type { Role } from './types'
import { PERMISSION_LABELS } from './types'

export const dummyRoleData: Role[] = [
  {
    id: 1,
    name: 'Super Administrator',
    type: 'Super Administrator',
    description: 'Memiliki akses penuh ke seluruh sistem, termasuk manajemen institusi dan konfigurasi API',
    permissions: [
      'view_institutions', 'create_institutions', 'edit_institutions', 'delete_institutions',
      'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles',
      'view_devices', 'create_devices', 'edit_devices', 'delete_devices',
      'view_patients', 'view_all_patients', 'print_results', 'send_to_boyolali',
      'configure_api', 'view_reports',
    ],
    usersCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true,
    deletedAt: null,
  },
  {
    id: 2,
    name: 'Admin RSUD Wonosari',
    type: 'Admin RSUD Wonosari',
    description: 'Mengelola user dan melihat data pasien di RSUD Wonosari',
    permissions: [
      'view_users', 'create_users', 'edit_users', 'delete_users',
      'view_patients', 'view_all_patients', 'print_results',
      'view_reports',
    ],
    usersCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    isActive: true,
    deletedAt: null,
  },
  {
    id: 3,
    name: 'IT RSUD Wonosari',
    type: 'IT RSUD Wonosari',
    description: 'Mengelola alat dan integrasi teknis di RSUD Wonosari',
    permissions: [
      'view_devices', 'create_devices', 'edit_devices', 'delete_devices',
      'configure_api', 'view_patients',
    ],
    usersCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
    isActive: true,
    deletedAt: null,
  },
  {
    id: 4,
    name: 'Admin RSUD Sleman',
    type: 'Admin RSUD Sleman',
    description: 'Mengelola user dan melihat data pasien di RSUD Sleman',
    permissions: [
      'view_users', 'create_users', 'edit_users', 'delete_users',
      'view_patients', 'view_all_patients', 'print_results',
      'view_reports',
    ],
    usersCount: 2,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
    isActive: true,
    deletedAt: null,
  },
  {
    id: 5,
    name: 'IT RSUD Sleman',
    type: 'IT RSUD Sleman',
    description: 'Mengelola alat dan integrasi teknis di RSUD Sleman',
    permissions: [
      'view_devices', 'create_devices', 'edit_devices', 'delete_devices',
      'configure_api', 'view_patients',
    ],
    usersCount: 1,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
    isActive: false,
    deletedAt: null,
  },
]

export { PERMISSION_LABELS }