/**
 * @file examples.tsx
 * @description Contoh penggunaan Permission System.
 *
 * Sistem ini menyediakan beberapa cara untuk cek permission:
 * 1. Component <Can> - untuk JSX
 * 2. Hook usePermission(resource) - untuk scoped checks
 * 3. Hook usePermissionContext() - untuk advanced usage
 *
 * @module Permissions/examples
 */

import React from 'react'
import { Button } from 'antd'
import { usePermission, Can, usePermissionContext } from '@/Permissions'

// ============================================================
// CONTOH 1: Component <Can> (paling sederhana)
// ============================================================

/**
 * Contoh penggunaan component <Can> untuk hide/show komponen.
 *
 *CATATAN: Ini hanya untuk UX (tidak menampilkan tombol/fitur).
 * Backend tetap melakukan validasi sebenarnya.
 */
export const CanExampleBasic = () => {
  return (
    <div>
      <h3>Contoh 1: Component Can</h3>

      {/* Hanya tampilkan tombol jika user punya permission */}
      <Can resource="devices" action="create">
        <Button type="primary">Tambah Device</Button>
      </Can>

      {/* Dengan fallback - tampilkan pesan alternatif */}
      <Can
        resource="devices"
        action="delete"
        fallback={<span className="text-gray-400">Tidak ada akses hapus</span>}
      >
        <Button danger>Hapus Device</Button>
      </Can>

      {/* Tanpa fallback - tidak tampil apa-apa jika tidak ada akses */}
      <Can resource="users" action="export">
        <Button>Export Users</Button>
      </Can>
    </div>
  )
}

// ============================================================
// CONTOH 2: Hook usePermission(resource) - untuk satu resource
// ============================================================

/**
 * Hook usePermission cocok untuk halaman yang fokus ke satu resource.
 */
export const CanExampleHook = () => {
  // Scoped ke resource "devices"
  const { can, canAny, canAll, actions } = usePermission('devices')

  return (
    <div>
      <h3>Contoh 2: Hook usePermission('devices')</h3>

      {/* Cek single action */}
      {can('view') && (
        <div className="mb-2">
          <Button>View Devices List</Button>
        </div>
      )}

      {/* Cek salah satu dari beberapa action */}
      {canAny(['update', 'edit']) && (
        <div className="mb-2">
          <Button type="primary">Edit Device</Button>
        </div>
      )}

      {/* Cek semua action */}
      {canAll(['export', 'print']) && (
        <div className="mb-2">
          <Button>Export & Print Report</Button>
        </div>
      )}

      {/* Tampilkan info */}
      <p className="text-sm text-gray-600">
        Actions tersedia untuk devices: {actions.join(', ') || 'Tidak ada'}
      </p>
    </div>
  )
}

// ============================================================
// CONTOH 3: Hook usePermissionContext() - untuk multiple resources
// ============================================================

/**
 * usePermissionContext berguna untuk cek permission lintas resource.
 */
export const CanExampleContext = () => {
  const { can, canAny, canAll, permissions } = usePermissionContext()

  return (
    <div>
      <h3>Contoh 3: usePermissionContext (cross-resource)</h3>

      {/* Cek permission lintas resource */}
      {can('devices', 'view') && can('users', 'view') && (
        <div className="mb-2">
          <Button>Tampilkan Dashboard Lengkap</Button>
        </div>
      )}

      {/* Cek apakah punya akses admin (multiple resources) */}
      {canAny('users', ['create', 'update', 'delete']) && (
        <div className="mb-2">
          <Button type="primary">Menu Admin</Button>
        </div>
      )}

      {/* Debug: tampilkan semua permission */}
      <details className="mt-4">
        <summary className="cursor-pointer text-blue-600">Debug: Lihat Semua Permissions</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(permissions, null, 2)}
        </pre>
      </details>
    </div>
  )
}

// ============================================================
// CONTOH 4: Dengan API Call (RTK Query)
// ============================================================

/**
 * Contoh penggunaan dengan API calls.
 *
 * CATATAN PENTING:
 * - Frontend check hanya untuk UX (hide/show tombol)
 * - Backend melakukan validasi sebenarnya
 * - Jika backend返回403, interceptor akan:
 *   1. Menampilkan toast notification
 *   2. Mencoba refresh token
 *   3. Retry request jika token berhasil di-refresh
 *   4. Jika refresh gagal, menampilkan error
 */
export const CanExampleWithAPI = () => {
  // Import API dari services Anda
  // import { useGetDevicesQuery } from '@/Services/api'
  // const { data, isLoading } = useGetDevicesQuery()

  // const { can } = usePermission('devices')

  // return (
  //   <div>
  //     {can('view') ? (
  //       <DeviceList data={data} loading={isLoading} />
  //     ) : (
  //       <div>Anda tidak memiliki akses untuk melihat device</div>
  //     )}
  //   </div>
  // )

  return (
    <div>
      <h3>Contoh 4: Dengan API Call</h3>
      <p className="text-sm text-gray-600">Lihat contoh di comment untuk implementasi dengan RTK Query.</p>
    </div>
  )
}

// ============================================================
// CONTOH 5: Conditional Rendering di Tabel
// ============================================================

/**
 * Contoh penggunaan di DataTable - hide action column.
 */
export const CanExampleTable = () => {
  const { canAny } = usePermission('devices')

  return (
    <div>
      <h3>Contoh 5: Di Tabel</h3>
      {/* columns untuk DataTable */}
      {/*
      const columns = [
        { title: 'Name', dataIndex: 'name' },
        canAny(['update', 'delete', 'view']) && {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Space>
              {can('view') && <Button>View</Button>}
              {can('update') && <Button>Edit</Button>}
              {can('delete') && <Button danger>Delete</Button>}
            </Space>
          ),
        },
      ].filter(Boolean)
      */}
    </div>
  )
}

// ============================================================
// CONTOH 6: Sidebar Navigation
// ============================================================

/**
 * Contoh penggunaan untuk Sidebar - hanya tampilkan menu yang diizinkan.
 */
export const CanExampleSidebar = () => {
  const { can } = usePermissionContext()

  // Sidebar items - hanya tampilkan jika ada akses
  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      show: true, // Semua user bisa lihat dashboard
    },
    {
      key: 'devices',
      label: 'Device Management',
      path: '/setting/device-management',
      show: can('devices', 'view'),
    },
    {
      key: 'users',
      label: 'User Management',
      path: '/setting/user-management',
      show: can('users', 'view'),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      path: '/setting/permissions',
      show: can('permissions', 'view'),
    },
  ].filter((item) => item.show)

  return (
    <div>
      <h3>Contoh 6: Sidebar Navigation</h3>
      <ul>
        {menuItems.map((item) => (
          <li key={item.key}>{item.label}</li>
        ))}
      </ul>
    </div>
  )
}
