/**
 * @file types.ts
 * @description Type definitions untuk modul Institusi.
 *
 * Disesuaikan dengan response API /institutions.
 *
 * @module Setting/Institution/Types
 */

import type { ListInstitutionItem } from '@/Services/Modules/institution/getListInstitution'
import type { CreateInstitutionRequest } from '@/Services/Modules/institution/postInstitution'

/**
 * Re-export ListInstitutionItem sebagai InstitutionItem
 * agar komponen-komponen UI tetap konsisten.
 */
export type InstitutionItem = ListInstitutionItem

/**
 * Form data untuk create/update institusi.
 * Sesuai dengan CreateInstitutionRequest dari API.
 */
export type InstitutionFormData = CreateInstitutionRequest

/**
 * Initial/default value untuk form institusi.
 */
export const INSTITUTION_FORM_INITIAL: InstitutionFormData = {
  institutions_code: '',
  institutions_name: '',
  addr1: '',
  addr2: '',
  rt: '',
  rw: '',
  villages: '',
  districts: '',
  regencies: '',
  provincies: '',
  poscode: '',
  phone: '',
  fax: '',
  mail: '',
  logo: '',
  status: true,
}

/**
 * Konfigurasi field form untuk render dinamis.
 */
export interface FormFieldConfig {
  key: keyof InstitutionFormData
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'file' | 'toggle'
  placeholder: string
  required?: boolean
  options?: { label: string; value: string | boolean }[]
  colSpan?: number
}

/**
 * Definisi field-field form institusi.
 * Digunakan untuk render form secara dinamis.
 */
export const INSTITUTION_FORM_FIELDS: FormFieldConfig[] = [
  {
    key: 'institutions_code',
    label: 'Kode Institusi',
    type: 'text',
    placeholder: 'Contoh: INST-001',
    required: true,
  },
  {
    key: 'institutions_name',
    label: 'Nama Institusi',
    type: 'text',
    placeholder: 'Contoh: Puskesmas Cikaso',
    required: true,
  },
  {
    key: 'addr1',
    label: 'Alamat 1',
    type: 'text',
    placeholder: 'Alamat utama institusi',
    required: true,
    colSpan: 2,
  },
  {
    key: 'addr2',
    label: 'Alamat 2',
    type: 'text',
    placeholder: 'Alamat tambahan (opsional)',
    colSpan: 2,
  },
  {
    key: 'rt',
    label: 'RT',
    type: 'text',
    placeholder: 'Contoh: 001',
  },
  {
    key: 'rw',
    label: 'RW',
    type: 'text',
    placeholder: 'Contoh: 002',
  },
  {
    key: 'villages',
    label: 'Kelurahan/Desa',
    type: 'text',
    placeholder: 'Nama kelurahan/desa',
    required: true,
  },
  {
    key: 'districts',
    label: 'Kecamatan',
    type: 'text',
    placeholder: 'Nama kecamatan',
    required: true,
  },
  {
    key: 'regencies',
    label: 'Kabupaten/Kota',
    type: 'text',
    placeholder: 'Nama kabupaten/kota',
    required: true,
  },
  {
    key: 'provincies',
    label: 'Provinsi',
    type: 'text',
    placeholder: 'Nama provinsi',
    required: true,
  },
  {
    key: 'poscode',
    label: 'Kode Pos',
    type: 'text',
    placeholder: 'Contoh: 10310',
  },
  {
    key: 'phone',
    label: 'Telepon',
    type: 'text',
    placeholder: 'Contoh: 02112345678',
    required: true,
  },
  {
    key: 'fax',
    label: 'Fax',
    type: 'text',
    placeholder: 'Contoh: 02187654321',
  },
  {
    key: 'mail',
    label: 'Email',
    type: 'email',
    placeholder: 'Contoh: info@institusi.com',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'toggle',
    placeholder: '',
  },
]
