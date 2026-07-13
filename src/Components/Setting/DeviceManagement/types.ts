/**
 * @file types.ts
 * @description Type definitions dan constants untuk modul Manajemen Alat (Device Management).
 *
 * Disesuaikan dengan response API /master/devices.
 *
 * @module Setting/DeviceManagement/Types
 */

import type { DeviceItem as ApiDeviceItem } from '@/Services/Modules/device/getListDevice'
import type { CreateDeviceRequest } from '@/Services/Modules/device/postDevice'

/**
 * Re-export DeviceItem dari API agar komponen UI tetap konsisten.
 */
export type DeviceItem = ApiDeviceItem

/**
 * Form data untuk create/update device.
 * Sesuai dengan CreateDeviceRequest dari API.
 */
export type DeviceFormData = CreateDeviceRequest

/**
 * Initial/default value untuk form device.
 */
export const DEVICE_FORM_INITIAL: DeviceFormData = {
  devices_code: '',
  devices_name: '',
  status: 1,
  description: '',
}

/**
 * Opsi status device.
 * Value = angka yang dikirim ke API, Label = teks yang ditampilkan di UI.
 */
export const DEVICE_STATUS_OPTIONS: { label: string; value: number }[] = [
  { label: 'Aktif', value: 1 },
  { label: 'Tidak Aktif', value: 2 },
  { label: 'Maintenance', value: 3 },
]

/**
 * Map status number ke label string.
 * Digunakan untuk menampilkan badge status di tabel dan detail.
 */
export const DEVICE_STATUS_MAP: Record<number, string> = {
  1: 'Aktif',
  2: 'Tidak Aktif',
  3: 'Maintenance',
}

/**
 * Konfigurasi warna badge berdasarkan status number.
 */
export const DEVICE_STATUS_BADGE_CONFIG: Record<number, { bg: string; text: string; dot: string }> = {
  1: {
    bg: 'bg-success/10 border-success/20',
    text: 'text-success',
    dot: 'bg-success',
  },
  2: {
    bg: 'bg-neutral-100 border-neutral-200',
    text: 'text-neutral-500',
    dot: 'bg-neutral-400',
  },
  3: {
    bg: 'bg-warning/10 border-warning/20',
    text: 'text-warning',
    dot: 'bg-warning',
  },
}

/**
 * Konfigurasi field form untuk render dinamis.
 */
export interface FormFieldConfig {
  key: keyof DeviceFormData
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder: string
  required?: boolean
  options?: { label: string; value: string | number }[]
  colSpan?: number
}

/**
 * Definisi field-field form device.
 * Digunakan untuk render form secara dinamis.
 */
export const DEVICE_FORM_FIELDS: FormFieldConfig[] = [
  {
    key: 'devices_code',
    label: 'Kode Alat',
    type: 'text',
    placeholder: 'Contoh: YS03022500136',
    required: true,
  },
  {
    key: 'devices_name',
    label: 'Nama Alat',
    type: 'text',
    placeholder: 'Contoh: Health Diagnostic Device YS-01',
    required: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: '',
    options: DEVICE_STATUS_OPTIONS.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })),
  },
  {
    key: 'description',
    label: 'Deskripsi',
    type: 'textarea',
    placeholder: 'Deskripsi alat (opsional)',
    colSpan: 2,
  },
]
