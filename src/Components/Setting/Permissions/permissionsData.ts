/**
 * @file permissionsData.ts
 * @description Master data modul untuk modul Hak Akses.
 *
 * Berisi:
 * - MODULE_DEFINITIONS: Daftar master modul yang tersedia di sistem
 * - MODULE_CATEGORIES: Daftar kategori modul
 *
 * Catatan: Dummy data user permissions sudah tidak digunakan setelah
 * integrasi API. Data permissions sekarang diambil dari endpoint
 * `getRolePermission` dan ditransformasi menggunakan `permissionsUtils.ts`.
 *
 * @module Setting/Permissions/Data
 */

import type { ModuleDefinition } from './types'

/** Master daftar modul yang tersedia di sistem */
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Dashboard
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Akses halaman dashboard utama',
    category: 'Dashboard',
  },
  {
    key: 'dashboard-chart',
    label: 'Grafik Dashboard',
    description: 'Lihat grafik statistik',
    category: 'Dashboard',
  },

  // Diagnostik
  {
    key: 'diagnostik-view',
    label: 'Lihat Diagnostik',
    description: 'Akses halaman diagnostik',
    category: 'Diagnostik',
  },
  {
    key: 'diagnostik-detail',
    label: 'Detail Diagnostik',
    description: 'Lihat detail parameter pemeriksaan',
    category: 'Diagnostik',
  },
  {
    key: 'diagnostik-print',
    label: 'Print Diagnostik',
    description: 'Cetak hasil diagnostik',
    category: 'Diagnostik',
  },
  {
    key: 'diagnostik-send',
    label: 'Kirim Diagnostik',
    description: 'Kirim data ke sistem lain',
    category: 'Diagnostik',
  },

  // Pengaturan
  {
    key: 'setting-main',
    label: 'Main Setting',
    description: 'Akses konfigurasi utama',
    category: 'Pengaturan',
  },
  {
    key: 'setting-user',
    label: 'Manajemen User',
    description: 'Kelola data pengguna',
    category: 'Pengaturan',
  },
  {
    key: 'setting-role',
    label: 'Manajemen Role',
    description: 'Kelola role dan jabatan',
    category: 'Pengaturan',
  },
  {
    key: 'setting-permission',
    label: 'Hak Akses',
    description: 'Atur hak akses user',
    category: 'Pengaturan',
  },
  {
    key: 'setting-institution',
    label: 'Institusi',
    description: 'Kelola data institusi',
    category: 'Pengaturan',
  },
  {
    key: 'setting-device',
    label: 'Manajemen Alat',
    description: 'Kelola data alat diagnostik',
    category: 'Pengaturan',
  },

  // Laporan
  { key: 'report-daily', label: 'Laporan Harian', description: 'Akses laporan harian', category: 'Laporan' },
  {
    key: 'report-monthly',
    label: 'Laporan Bulanan',
    description: 'Akses laporan bulanan',
    category: 'Laporan',
  },
  {
    key: 'report-export',
    label: 'Export Laporan',
    description: 'Export laporan ke Excel/PDF',
    category: 'Laporan',
  },
]

/** Daftar kategori modul */
export const MODULE_CATEGORIES = ['Dashboard', 'Diagnostik', 'Pengaturan', 'Laporan']
