/**
 * @file columnMap.ts
 * @description Konfigurasi column mapping dan filter untuk semua modul.
 *
 * File ini berisi:
 * - Mapping field API → field aplikasi (untuk setiap modul)
 * - Konfigurasi filter panel (field, tipe, placeholder, options)
 *
 * @module Config/ColumnMap
 */

// ===================================================================
// SHARED TYPES
// ===================================================================

export type FilterFieldType = 'text' | 'select' | 'date'

export interface FilterFieldConfig {
  /** Key untuk state filter & query param */
  key: string
  /** Label yang ditampilkan di UI */
  label: string
  /** Tipe input filter */
  type: FilterFieldType
  /** Placeholder untuk input text */
  placeholder?: string
  /** Options untuk type 'select' */
  options?: { label: string; value: string }[]
}

// ===================================================================
// DIAGNOSTIK COLUMN MAPPING
// ===================================================================

/**
 * Mapping field dari API response diagnostik ke field aplikasi.
 * Key = Column accessor (di column definition / aplikasi)
 * Value = Field dari API response backend
 *
 * @example
 * // API response: { Waktu: '2026-02-27', IdAlat: 'ALT-001', ... }
 * // Setelah di-map: { waktu: '2026-02-27', idAlat: 'ALT-001', ... }
 */
export const diagnostikMapping: Record<string, string> = {
  waktu: 'Waktu',
  idAlat: 'IdAlat',
  namaPasien: 'NamaPasien',
  hasilSingkat: 'HasilSingkat',
}

/**
 * Mapping field untuk parameter hasil pemeriksaan diagnostik.
 * Digunakan untuk memetakan detail parameter dari API response.
 */
export const diagnostikParameterMapping: Record<string, string> = {
  parameter: 'NamaParameter',
  hasil: 'Hasil',
  satuan: 'Satuan',
  nilaiRujukan: 'NilaiRujukan',
  keterangan: 'Keterangan',
}

/**
 * Konfigurasi filter untuk halaman Diagnostik.
 * Setiap entry mendefinisikan satu field filter di UI.
 */
export const diagnostikFilterConfig: FilterFieldConfig[] = [
  {
    key: 'IdAlat',
    label: 'ID Alat',
    type: 'text',
    placeholder: 'Cari ID alat...',
  },
  {
    key: 'NamaPasien',
    label: 'Nama Pasien',
    type: 'text',
    placeholder: 'Cari nama pasien...',
  },
  {
    key: 'TglMulai',
    label: 'Tanggal Mulai',
    type: 'date',
  },
  {
    key: 'TglSelesai',
    label: 'Tanggal Selesai',
    type: 'date',
  },
]

// ===================================================================
// DEVICE MANAGEMENT COLUMN MAPPING
// ===================================================================

/**
 * Mapping field dari API response device/alat ke field aplikasi.
 */
export const deviceMapping: Record<string, string> = {
  idAlat: 'IdAlat',
  namaAlat: 'NamaAlat',
  tipeAlat: 'TipeAlat',
  lokasi: 'Lokasi',
  status: 'Status',
  keterangan: 'Keterangan',
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
}

/**
 * Konfigurasi filter untuk halaman Manajemen Alat.
 */
export const deviceFilterConfig: FilterFieldConfig[] = [
  {
    key: 'IdAlat',
    label: 'ID Alat',
    type: 'text',
    placeholder: 'Cari ID alat...',
  },
  {
    key: 'NamaAlat',
    label: 'Nama Alat',
    type: 'text',
    placeholder: 'Cari nama alat...',
  },
  {
    key: 'Status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Semua', value: '' },
      { label: 'Aktif', value: 'active' },
      { label: 'Nonaktif', value: 'inactive' },
      { label: 'Maintenance', value: 'maintenance' },
    ],
  },
]

// ===================================================================
// INSTITUTION COLUMN MAPPING
// ===================================================================

/**
 * Mapping field dari API response institusi ke field aplikasi.
 * Key = Column accessor (di column definition / aplikasi)
 * Value = Field dari API response backend
 *
 * @example
 * // API response: { Kode: 'INS-001', Nama: 'RSUD Wonosari', ... }
 * // Setelah di-map: { kode: 'INS-001', nama: 'RSUD Wonosari', ... }
 */
export const institutionMapping: Record<string, string> = {
  kode: 'Kode',
  nama: 'Nama',
  alamat: 'Alamat',
  telepon: 'Telepon',
  email: 'Email',
  penanggungJawab: 'PenanggungJawab',
  status: 'Status',
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
}

/**
 * Konfigurasi filter untuk halaman Institusi.
 * Setiap entry mendefinisikan satu field filter di UI.
 */
export const institutionFilterConfig: FilterFieldConfig[] = [
  {
    key: 'Kode',
    label: 'Kode Institusi',
    type: 'text',
    placeholder: 'Cari kode institusi...',
  },
  {
    key: 'Nama',
    label: 'Nama Institusi',
    type: 'text',
    placeholder: 'Cari nama institusi...',
  },
  {
    key: 'Status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Semua', value: '' },
      { label: 'Aktif', value: 'active' },
      { label: 'Nonaktif', value: 'inactive' },
    ],
  },
]

// ===================================================================
// KONSULTASI COLUMN MAPPING
// ===================================================================

export const konsultasiMapping: Record<string, string> = {
  // Key = Column accessor (di column definition)
  // Value = Field dari API response
  no_pendaftaran: 'NoPendaftaran',
  no_cm: 'NoCM',
  nama_pasien: 'NamaPasien',
  dokter_perujuk: 'NamaDokterPerujuk',
  tanggal_mulai: 'TglDirujuk',
  tanggal_selesai: 'TglSelesai',
  status: 'StatusPeriksa',
}

/**
 * Konfigurasi filter untuk halaman Konsul Masuk.
 * Setiap entry mendefinisikan satu field filter di UI.
 */
export const konsultasiFilterConfig: FilterFieldConfig[] = [
  {
    key: 'Type',
    label: 'Tipe Konsultasi',
    type: 'select',
    options: [
      { label: 'Semua', value: '' },
      { label: 'Konsul', value: 'Konsul' },
      { label: 'Rujuk', value: 'Rujuk' },
    ],
  },
  {
    key: 'NoPendaftaran',
    label: 'No Pendaftaran',
    type: 'text',
    placeholder: 'Cari no pendaftaran...',
  },
  {
    key: 'NoCM',
    label: 'No CM',
    type: 'text',
    placeholder: 'Cari no CM...',
  },
  {
    key: 'NamaPasien',
    label: 'Nama Pasien',
    type: 'text',
    placeholder: 'Cari nama pasien...',
  },
  {
    key: 'StatusPeriksa',
    label: 'Status Periksa',
    type: 'select',
    options: [
      { label: 'Semua', value: '' },
      { label: 'Selesai', value: 'S' },
      { label: 'Belum', value: 'B' },
    ],
  },
  {
    key: 'TglDirujukMulai',
    label: 'Tanggal Mulai',
    type: 'date',
  },
  {
    key: 'TglDirujukSelesai',
    label: 'Tanggal Selesai',
    type: 'date',
  },
]
