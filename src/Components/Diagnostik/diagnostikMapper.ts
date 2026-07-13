/**
 * @file diagnostikMapper.ts
 * @description Utility functions untuk mapping data diagnostik dari API ke format UI.
 *
 * @module Diagnostik/Mapper
 */

import type { DiagnosticApiItem, DiagnostikItem, DiagnostikParameter, QueueLogItem } from './types'

/**
 * Format date string ke format Indonesia
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format date singkat
 */
export const formatDateShort = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * Helper untuk get BMI keterangan
 */
const getBMIKeterangan = (bmi: string | number | null | undefined): string => {
  if (bmi === null || bmi === undefined) return '-'
  const bmiNum = parseFloat(bmi as string)
  if (isNaN(bmiNum)) return '-'
  if (bmiNum < 18.5) return 'Rendah'
  if (bmiNum > 25) return 'Tinggi'
  return 'Normal'
}

/**
 * Helper untuk get Blood Pressure keterangan
 */
const getBPKeterangan = (value: number | string | null | undefined, type: 'sys' | 'dia'): string => {
  if (value === null || value === undefined) return '-'
  const valNum = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(valNum)) return '-'
  if (type === 'sys') {
    if (valNum < 90) return 'Rendah'
    if (valNum > 140) return 'Tinggi'
  } else {
    if (valNum < 60) return 'Rendah'
    if (valNum > 90) return 'Tinggi'
  }
  return 'Normal'
}

/**
 * Helper untuk get Pulse keterangan
 */
const getPulseKeterangan = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const valNum = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(valNum)) return '-'
  if (valNum < 60) return 'Rendah'
  if (valNum > 100) return 'Tinggi'
  return 'Normal'
}

/**
 * Helper untuk get Temperature keterangan
 */
const getTempKeterangan = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const valNum = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(valNum)) return '-'
  if (valNum < 36.1) return 'Rendah'
  if (valNum > 37.2) return 'Tinggi'
  return 'Normal'
}

/**
 * Helper untuk get SpO2 keterangan
 */
const getSpO2Keterangan = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const valNum = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(valNum)) return '-'
  if (valNum < 95) return 'Rendah'
  return 'Normal'
}

/**
 * Helper untuk get Respiratory keterangan
 */
const getRespiratoryKeterangan = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const valNum = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(valNum)) return '-'
  if (valNum < 12) return 'Rendah'
  if (valNum > 20) return 'Tinggi'
  return 'Normal'
}

/**
 * Mapping single API item ke UI item
 */
export const mapDiagnosticApiToItem = (apiItem: DiagnosticApiItem): DiagnostikItem => {
  // Build parameters array dari API fields
  const parameters: DiagnostikParameter[] = []

  // Tinggi Badan
  if (apiItem.height) {
    parameters.push({
      parameter: 'Tinggi Badan',
      hasil: apiItem.height,
      satuan: 'cm',
      nilaiRujukan: '-',
      keterangan: '-',
    })
  }

  // Berat Badan
  if (apiItem.weight) {
    parameters.push({
      parameter: 'Berat Badan',
      hasil: apiItem.weight,
      satuan: 'kg',
      nilaiRujukan: '-',
      keterangan: '-',
    })
  }

  // BMI
  if (apiItem.bmi) {
    parameters.push({
      parameter: 'BMI',
      hasil: apiItem.bmi,
      satuan: 'kg/m²',
      nilaiRujukan: '18.5 - 25',
      keterangan: getBMIKeterangan(apiItem.bmi),
    })
  }

  // Tekanan Darah Sistolik
  if (apiItem.sys) {
    parameters.push({
      parameter: 'Tekanan Darah Sistolik (Sys)',
      hasil: apiItem.sys,
      satuan: apiItem.blood_unit || 'mmHg',
      nilaiRujukan: '90 - 140',
      keterangan: getBPKeterangan(apiItem.sys, 'sys'),
    })
  }

  // Tekanan Darah Diastolik
  if (apiItem.dia) {
    parameters.push({
      parameter: 'Tekanan Darah Diastolik (Dia)',
      hasil: apiItem.dia,
      satuan: apiItem.blood_unit || 'mmHg',
      nilaiRujukan: '60 - 90',
      keterangan: getBPKeterangan(apiItem.dia, 'dia'),
    })
  }

  // Mean Arterial Pressure
  if (apiItem.map) {
    parameters.push({
      parameter: 'Mean Arterial Pressure (MAP)',
      hasil: apiItem.map,
      satuan: 'mmHg',
      nilaiRujukan: '70 - 105',
      keterangan: '-',
    })
  }

  // Denyut Nadi (PR)
  if (apiItem.pr) {
    parameters.push({
      parameter: 'Denyut Nadi (PR)',
      hasil: apiItem.pr,
      satuan: 'bpm',
      nilaiRujukan: '60 - 100',
      keterangan: getPulseKeterangan(apiItem.pr),
    })
  }

  // Detak Jantung (Heart Rate)
  if (apiItem.heart_r) {
    parameters.push({
      parameter: 'Detak Jantung (Heart Rate)',
      hasil: apiItem.heart_r,
      satuan: 'bpm',
      nilaiRujukan: '60 - 100',
      keterangan: getPulseKeterangan(apiItem.heart_r),
    })
  }

  // Suhu Tubuh
  if (apiItem.temp) {
    parameters.push({
      parameter: 'Suhu Tubuh',
      hasil: apiItem.temp,
      satuan: apiItem.temp_unit || '℃',
      nilaiRujukan: '36.1 - 37.2',
      keterangan: getTempKeterangan(apiItem.temp),
    })
  }

  // Oksigen Darah (SpO2)
  if (apiItem.blood_o) {
    parameters.push({
      parameter: 'Oksigen Darah (SpO2)',
      hasil: apiItem.blood_o,
      satuan: '%',
      nilaiRujukan: '95 - 100',
      keterangan: getSpO2Keterangan(apiItem.blood_o),
    })
  }

  // Respiratory Rate
  if (apiItem.res) {
    parameters.push({
      parameter: 'Respiratory Rate',
      hasil: apiItem.res,
      satuan: '/min',
      nilaiRujukan: '12 - 20',
      keterangan: getRespiratoryKeterangan(apiItem.res),
    })
  }

  // Gula Darah Sewaktu
  if (apiItem.blood_s) {
    const bloodS = parseFloat(apiItem.blood_s as string)
    parameters.push({
      parameter: 'Gula Darah Sewaktu',
      hasil: apiItem.blood_s,
      satuan: 'mg/dL',
      nilaiRujukan: '< 200',
      keterangan: isNaN(bloodS) ? '-' : bloodS > 200 ? 'Tinggi' : 'Normal',
    })
  }

  // Asam Urat
  if (apiItem.uric_a) {
    parameters.push({
      parameter: 'Asam Urat',
      hasil: apiItem.uric_a,
      satuan: 'mg/dL',
      nilaiRujukan: 'Pria: 3.4-7.0, Wanita: 2.4-6.0',
      keterangan: '-',
    })
  }

  // Kolesterol Total
  if (apiItem.cho) {
    const choVal = parseFloat(apiItem.cho as string)
    parameters.push({
      parameter: 'Kolesterol Total',
      hasil: apiItem.cho,
      satuan: 'mg/dL',
      nilaiRujukan: '< 200',
      keterangan: isNaN(choVal) ? '-' : choVal > 200 ? 'Tinggi' : 'Normal',
    })
  }

  // Vision Kiri
  if (apiItem.left_vision) {
    parameters.push({
      parameter: 'Vision Kiri',
      hasil: apiItem.left_vision,
      satuan: '',
      nilaiRujukan: '-',
      keterangan: '-',
    })
  }

  // Vision Kanan
  if (apiItem.righe_vision) {
    parameters.push({
      parameter: 'Vision Kanan',
      hasil: apiItem.righe_vision,
      satuan: '',
      nilaiRujukan: '-',
      keterangan: '-',
    })
  }

  return {
    id: apiItem.id,
    waktu: formatDateTime(apiItem.received_at || apiItem.establish_time),
    idAlat: apiItem.device_id,
    devices_code: apiItem.devices_code,
    namaPasien: apiItem.username,
    sex: apiItem.sex,
    idNumber: apiItem.id_number,
    birthTime: apiItem.birth_time,
    height: apiItem.height,
    weight: apiItem.weight,
    bmi: apiItem.bmi,
    hasilSingkat: apiItem.result || '-',
    result: apiItem.result || '-',
    parameters: parameters,
    queueStatus: apiItem.latest_queue_log?.status,
    latestQueueLog: apiItem.latest_queue_log,
    institutions_code: apiItem.institutions_code,
    institutions: apiItem.institutions,
    // Pemeriksaan parameters
    sys: apiItem.sys,
    dia: apiItem.dia,
    map: apiItem.map,
    pr: apiItem.pr,
    heartRate: apiItem.heart_r,
    temp: apiItem.temp,
    tempUnit: apiItem.temp_unit,
    bloodO: apiItem.blood_o,
    res: apiItem.res,
    bloodSugar: apiItem.blood_s,
    uricAcid: apiItem.uric_a,
    cholesterol: apiItem.cho,
  }
}

/**
 * Mapping array of API items ke array of UI items
 */
export const mapDiagnosticsApiList = (apiItems: DiagnosticApiItem[]): DiagnostikItem[] => {
  return apiItems.map(mapDiagnosticApiToItem)
}

/**
 * Get gender label
 */
export const getGenderLabel = (sex: string | null | undefined): string => {
  if (!sex) return '-'
  return sex.toLowerCase() === 'female' ? 'Perempuan' : sex.toLowerCase() === 'male' ? 'Laki-laki' : sex
}

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '-'
  try {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} tahun`
  } catch {
    return '-'
  }
}

/**
 * Format queue log response body (JSON string)
 */
export const formatResponseBody = (responseBody: string): string => {
  try {
    const parsed = JSON.parse(responseBody)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return responseBody
  }
}
