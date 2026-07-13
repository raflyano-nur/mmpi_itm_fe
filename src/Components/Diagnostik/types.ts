/**
 * @file types.ts
 * @description Type definitions untuk modul Diagnostik.
 *
 * File ini berisi semua interface dan type yang digunakan
 * di seluruh komponen Diagnostik (tabel utama, modal detail, dll).
 *
 * @module Diagnostik/Types
 */

/**
 * Parameter untuk query list diagnostik
 */
export interface ListDiagnosticParams {
  search?: string
  devices_code?: string
  institutions_code?: string
  queue_status?: 'pending' | 'processing' | 'success' | 'failed'
  date_from?: string // format: YYYY-MM-DD
  date_to?: string // format: YYYY-MM-DD
  per_page?: number
  page?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

/**
 * Queue log item dari API
 */
export interface QueueLogItem {
  id: number
  diagnostic_id: number
  status: string
  attempt: number
  response_code: number | null // ← null saat gagal
  response_body: string | null // ← null saat gagal
  error_message: string | null
  sent_at: string | null // ← null saat gagal
  created_at: string
  updated_at: string
  dispatch_target_id: number | null // ← ganti dari institution_id
}

/**
 * Latest queue log dari list API
 */
export interface LatestQueueLog {
  id: number
  diagnostic_id: number
  status: string
  attempt: number
  response_code: number | null
  response_body: string | null
  error_message: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  dispatch_target_id: number | null // ← ganti dari institution_id
}

/**
 * Data institusi dari list API
 */
export interface ListInstitutionItem {
  id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  institutions_code: string
  institutions_name: string
  addr1: string
  addr2: string
  rt: string
  rw: string
  villages: string
  districts: string
  regencies: string
  provincies: string
  poscode: string
  phone: string
  fax: string
  mail: string
  status: boolean
  logo: string
  deleted_at: null | string
  logo_url: string
}

/**
 * Item diagnostik dari API response
 */
export interface DiagnosticApiItem {
  id: number
  created_by: number | null
  created_at: string
  updated_by: number | null
  updated_at: string
  device_id: string
  username: string
  sex: string
  id_number: string
  establish_time: string
  phone: string
  address: string
  birth_time: string
  nation: string
  shebao_id: number | null
  height: string
  weight: string
  bmi: string
  left_vision: string | number | null
  righe_vision: string | number | null
  left_correct: string | number | null
  righe_correct: string | number | null
  sys: string | number | null
  dia: string | number | null
  map: string | number | null
  pr: string | number | null
  blood_unit: string
  heart_r: string | number | null
  temp: string
  temp_unit: string
  blood_o: string | number | null
  res: string | number | null
  blood_s: string | number | null
  uric_a: string | number | null
  cho: string | number | null
  colo_result: string | number | null
  result: string
  received_at: string
  devices_code: string
  institutions_code: string
  latest_queue_log?: LatestQueueLog
  queue_logs?: QueueLogItem[]
  institutions?: ListInstitutionItem
}

/**
 * Response untuk getListDiagnostic
 */
export interface DiagnosticListResponse {
  current_page: number
  data: DiagnosticApiItem[]
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

/**
 * Response untuk getDetailDiagnostic
 */
export interface DiagnosticDetailResponse {
  status: string
  message: string
  data: DiagnosticApiItem
}

/**
 * Paginated container untuk queue logs
 */
export interface QueueLogPaginated {
  current_page: number
  data: QueueLogItem[]
  last_page: number
  per_page: number
  total: number
  next_page_url: string | null
  prev_page_url: string | null
  from: number
  to: number
}

/**
 * Response untuk getQueueLogDiagnostic
 */
export interface QueueLogResponse {
  status: string
  message: string
  data: {
    diagnostic_id: number
    total_attempt: number
    latest_status: string
    logs: QueueLogPaginated // ← sebelumnya QueueLogItem[]
  }
}

/**
 * Response untuk postResendDiagnostic
 */
export interface ResendDiagnosticResponse {
  status: string
  message: string
  data: {
    diagnostic_id: number
    queue_log_id: number
    queue_status: string
  }
}

/**
 * Parameter hasil pemeriksaan untuk UI
 */
export interface DiagnostikParameter {
  /** Nama parameter pemeriksaan */
  parameter: string
  /** Nilai hasil pemeriksaan */
  hasil: string | number | null
  /** Satuan pengukuran */
  satuan: string
  /** Rentang nilai rujukan normal */
  nilaiRujukan?: string
  /** Keterangan status: 'Normal' | 'Tinggi' | 'Rendah' */
  keterangan: string
}

/**
 * Item diagnostik untuk UI
 */
export interface DiagnostikItem {
  /** ID unik hasil diagnostik */
  id: number | string
  /** Waktu pemeriksaan */
  waktu: string
  /** ID alat yang digunakan */
  idAlat: string
  /** Kode device */
  devices_code: string
  /** Nama lengkap pasien */
  namaPasien: string
  /** Jenis kelamin */
  sex: string
  /** Nomor identitas */
  idNumber: string
  /** Tanggal lahir */
  birthTime: string
  /** Tinggi badan */
  height: string
  /** Berat badan */
  weight: string
  /** BMI */
  bmi: string
  /** Ringkasan singkat hasil pemeriksaan */
  hasilSingkat: string
  /** Hasil utama diagnostik */
  result: string
  /** Daftar parameter hasil pemeriksaan */
  parameters: DiagnostikParameter[]
  /** Status queue terakhir */
  queueStatus?: string
  /** Queue log terakhir */
  latestQueueLog?: LatestQueueLog
  /** Kode institusi */
  institutions_code?: string

  /** Data institusi */
  institutions?: ListInstitutionItem
  /** Tekanan darah sistolik */
  sys?: string | number | null
  /** Tekanan darah diastolik */
  dia?: string | number | null
  /** Mean Arterial Pressure */
  map?: string | number | null
  /** Denyut nadi (PR) */
  pr?: string | number | null
  /** Detak jantung */
  heartRate?: string | number | null
  /** Suhu tubuh */
  temp?: string
  /** Suhu tubuh unit */
  tempUnit?: string
  /** Oksigen darah (SpO2) */
  bloodO?: string | number | null
  /** Respiratory rate */
  res?: string | number | null
  /** Gula darah sewaktu */
  bloodSugar?: string | number | null
  /** Asam urat */
  uricAcid?: string | number | null
  /** Kolesterol total */
  cholesterol?: string | number | null
}

/**
 * Mapping field dari API response ke field aplikasi.
 */
export interface DiagnostikApiMapping {
  [appKey: string]: string
}

/**
 * Konfigurasi parameter diagnostik dari API fields
 */
export const DIAGNOSTIC_PARAMETERS: DiagnostikParameter[] = [
  { parameter: 'Tinggi Badan', hasil: '', satuan: 'cm', keterangan: '' },
  { parameter: 'Berat Badan', hasil: '', satuan: 'kg', keterangan: '' },
  { parameter: 'BMI', hasil: '', satuan: 'kg/m²', keterangan: '' },
  { parameter: 'Tekanan Darah Sistolik (Sys)', hasil: '', satuan: 'mmHg', keterangan: '' },
  { parameter: 'Tekanan Darah Diastolik (Dia)', hasil: '', satuan: 'mmHg', keterangan: '' },
  { parameter: 'Mean Arterial Pressure (MAP)', hasil: '', satuan: 'mmHg', keterangan: '' },
  { parameter: 'Denyut Nadi (PR)', hasil: '', satuan: 'bpm', keterangan: '' },
  { parameter: 'Detak Jantung (Heart Rate)', hasil: '', satuan: 'bpm', keterangan: '' },
  { parameter: 'Suhu Tubuh', hasil: '', satuan: '℃', keterangan: '' },
  { parameter: 'Oksigen Darah (SpO2)', hasil: '', satuan: '%', keterangan: '' },
  { parameter: 'Respiratory Rate', hasil: '', satuan: '/min', keterangan: '' },
  { parameter: 'Gula Darah Sewaktu', hasil: '', satuan: 'mg/dL', keterangan: '' },
  { parameter: 'Asam Urat', hasil: '', satuan: 'mg/dL', keterangan: '' },
  { parameter: 'Kolesterol Total', hasil: '', satuan: 'mg/dL', keterangan: '' },
  { parameter: 'Vision Kiri', hasil: '', satuan: '', keterangan: '' },
  { parameter: 'Vision Kanan', hasil: '', satuan: '', keterangan: '' },
]

/**
 * Badge configuration untuk queue status
 */
export const QUEUE_STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    label: 'Menunggu',
  },
  processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    label: 'Diproses',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
    label: 'Berhasil',
  },
  failed: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    label: 'Gagal',
  },
}
