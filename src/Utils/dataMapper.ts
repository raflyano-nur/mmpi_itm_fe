/**
 * @file dataMapper.ts
 * @description Utility functions untuk memetakan data dari API response
 * ke format yang digunakan di aplikasi.
 *
 * Setiap modul memiliki mapper sendiri yang menggunakan
 * column mapping dari `src/Config/columnMap.ts`.
 *
 * @module Utils/DataMapper
 */

import {
  konsultasiMapping,
  diagnostikMapping,
  diagnostikParameterMapping,
  institutionMapping,
} from '../Config/columnMap'
import type { DiagnostikItem, DiagnostikParameter } from '@/Components/Diagnostik/types'
import type { InstitutionItem } from '@/Components/Setting/Institution/types'

// ===================================================================
// DIAGNOSTIK MAPPER
// ===================================================================

/**
 * Memetakan array data parameter dari API response ke format DiagnostikParameter.
 *
 * @param {any[]} apiParams - Array parameter dari API response
 * @returns {DiagnostikParameter[]} Array parameter yang sudah di-map
 *
 * @example
 * const apiParams = [
 *   { NamaParameter: 'Hemoglobin', Hasil: '10.2', Satuan: 'g/dL', NilaiRujukan: '13.0 - 17.5', Keterangan: 'Rendah' }
 * ]
 * const mapped = mapDiagnostikParameters(apiParams)
 * // Result: [{ parameter: 'Hemoglobin', hasil: '10.2', satuan: 'g/dL', nilaiRujukan: '13.0 - 17.5', keterangan: 'Rendah' }]
 */
export const mapDiagnostikParameters = (apiParams: any[]): DiagnostikParameter[] => {
  if (!apiParams || !Array.isArray(apiParams)) return []

  return apiParams.map((param) => {
    const mapped: Record<string, any> = {}

    for (const [appKey, apiKey] of Object.entries(diagnostikParameterMapping)) {
      mapped[appKey] = param[apiKey] ?? ''
    }

    return mapped as DiagnostikParameter
  })
}

/**
 * Memetakan data diagnostik dari API response ke format DiagnostikItem[].
 * Menggunakan `diagnostikMapping` untuk field utama dan
 * `mapDiagnostikParameters` untuk nested parameters.
 *
 * @param {any[]} apiData - Array data dari API response
 * @returns {DiagnostikItem[]} Array data diagnostik yang sudah di-map
 *
 * @example
 * const apiResponse = [
 *   {
 *     Id: '1',
 *     Waktu: '2026-02-27 08:30',
 *     IdAlat: 'ALT-001',
 *     NamaPasien: 'Ahmad Suryadi',
 *     HasilSingkat: 'Hemoglobin rendah',
 *     Parameters: [
 *       { NamaParameter: 'Hemoglobin', Hasil: '10.2', ... }
 *     ]
 *   }
 * ]
 * const mapped = mapDiagnostikData(apiResponse)
 */
export const mapDiagnostikData = (apiData: any[]): DiagnostikItem[] => {
  if (!apiData || !Array.isArray(apiData)) return []

  return apiData.map((item) => {
    const mapped: Record<string, any> = {
      id: item.Id || item.id || item.diagnostik_id || '',
    }

    // Map field utama secara dinamis dari diagnostikMapping
    for (const [appKey, apiKey] of Object.entries(diagnostikMapping)) {
      mapped[appKey] = item[apiKey] ?? ''
    }

    // Map nested parameters
    mapped.parameters = mapDiagnostikParameters(
      item.Parameters || item.parameters || item.DetailParameter || [],
    )

    return mapped as DiagnostikItem
  })
}

// ===================================================================
// KONSULTASI MAPPER
// ===================================================================

/**
 * Memetakan data konsultasi dari API response ke format aplikasi.
 *
 * @param {any[]} apiData - Array data dari API response
 * @returns {Record<string, any>[]} Array data konsultasi yang sudah di-map
 *
 * @example
 * const apiResponse = [{ NoPendaftaran: '001', NamaPasien: 'John', ... }]
 * const mapped = mapKonsultasiData(apiResponse)
 * // Result: [{ no_pendaftaran: '001', nama_pasien: 'John', ... }]
 */
export const mapKonsultasiData = (apiData: any): Record<string, any>[] => {
  if (!apiData || !Array.isArray(apiData)) return []

  return apiData.map((item) => {
    const mapped: Record<string, any> = {
      id: item.id || item.konsultasi_id,
    }

    // Map field secara dinamis dari konsultasiMapping
    for (const [appKey, apiKey] of Object.entries(konsultasiMapping)) {
      // Field 'status' punya default value 'Unknown', sisanya null
      mapped[appKey] = item[apiKey] ?? (appKey === 'status' ? 'Unknown' : null)
    }

    mapped._original = item // Simpan data original untuk referensi
    return mapped
  })
}

// ===================================================================
// INSTITUTION MAPPER
// ===================================================================

/**
 * Memetakan data institusi dari API response ke format InstitutionItem[].
 * Menggunakan `institutionMapping` untuk field mapping.
 *
 * @param {any[]} apiData - Array data dari API response
 * @returns {InstitutionItem[]} Array data institusi yang sudah di-map
 *
 * @example
 * const apiResponse = [
 *   {
 *     Id: '1',
 *     Kode: 'INS-001',
 *     Nama: 'RSUD Wonosari',
 *     Alamat: 'Jl. Taman Bhakti No.6',
 *     Telepon: '0274-391007',
 *     Email: 'info@rsudwonosari.go.id',
 *     PenanggungJawab: 'dr. Budi Santoso',
 *     Status: 'active',
 *     CreatedAt: '2026-01-15',
 *     UpdatedAt: '2026-02-20',
 *   }
 * ]
 * const mapped = mapInstitutionData(apiResponse)
 */
export const mapInstitutionData = (apiData: any[]): InstitutionItem[] => {
  if (!apiData || !Array.isArray(apiData)) return []

  return apiData.map((item) => {
    const mapped: Record<string, any> = {
      id: item.Id || item.id || item.institution_id || '',
    }

    // Map field utama secara dinamis dari institutionMapping
    for (const [appKey, apiKey] of Object.entries(institutionMapping)) {
      mapped[appKey] = item[apiKey] ?? ''
    }

    return mapped as InstitutionItem
  })
}

/**
 * Memetakan data form institusi ke format API request.
 * Kebalikan dari mapInstitutionData — dari format app ke format API.
 *
 * @param {Record<string, any>} formData - Data form dari aplikasi
 * @returns {Record<string, any>} Data yang siap dikirim ke API
 *
 * @example
 * const formData = { kode: 'INS-001', nama: 'RSUD Wonosari', ... }
 * const apiPayload = mapInstitutionToApi(formData)
 * // Result: { Kode: 'INS-001', Nama: 'RSUD Wonosari', ... }
 */
export const mapInstitutionToApi = (formData: Record<string, any>): Record<string, any> => {
  const mapped: Record<string, any> = {}

  for (const [appKey, apiKey] of Object.entries(institutionMapping)) {
    if (formData[appKey] !== undefined) {
      mapped[apiKey] = formData[appKey]
    }
  }

  return mapped
}

// ===================================================================
// DEVICE MAPPER
// ===================================================================
// Device mapper sudah tidak diperlukan karena data langsung dari API
// tanpa perlu mapping field. Lihat: src/Services/Modules/device/

// ===================================================================
// HELPER UTILITIES
// ===================================================================

/**
 * Helper untuk extract nested response.
 * Beberapa API response bentuknya { data: { items: [...] } }
 *
 * @param {Object} response - API response
 * @param {string} path - Path ke data (dot notation)
 * @returns {Array} Extracted data
 *
 * @example
 * extractData(response, 'data.items')
 * extractData(response, 'result.diagnostik')
 */
export const extractData = (response: any, path = 'data') => {
  if (!response) return []

  // Jika response sudah array, return langsung
  if (Array.isArray(response)) return response

  // Extract nested data
  const fields = path.split('.')
  const data = fields.reduce((obj, field) => obj?.[field], response)

  return Array.isArray(data) ? data : []
}

// Export semua mapper
export default {
  mapDiagnostikData,
  mapDiagnostikParameters,
  mapKonsultasiData,
  mapInstitutionData,
  mapInstitutionToApi,
  extractData,
}
