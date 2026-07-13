/**
 * @file diagnostikData.ts
 * @description Dummy data untuk modul Diagnostik.
 *
 * File ini berisi data dummy yang digunakan untuk development & testing.
 * Nantinya akan diganti dengan data dari API melalui Redux store.
 *
 * @module Diagnostik/Data
 *
 * @example
 * // Import dan gunakan di komponen:
 * import { dummyDiagnostikData } from './diagnostikData'
 *
 * <DataTable data={dummyDiagnostikData} columns={columns} />
 */

import type { DiagnostikItem } from './types'

/**
 * Data dummy hasil diagnostik pasien.
 * Mencakup berbagai skenario:
 * - Pasien dengan hasil abnormal (rendah/tinggi)
 * - Pasien dengan semua parameter normal
 * - Berbagai jenis pemeriksaan (hematologi, kimia darah, fungsi hati, fungsi ginjal)
 */
export const dummyDiagnostikData: any[] = [
  {
    id: '1',
    waktu: '2026-02-27 08:30',
    idAlat: 'ALT-001',
    namaPasien: 'Ahmad Suryadi',
    hasilSingkat: 'Hemoglobin rendah, Leukosit normal',
    parameters: [
      {
        parameter: 'Hemoglobin',
        hasil: '10.2',
        satuan: 'g/dL',
        nilaiRujukan: '13.0 - 17.5',
        keterangan: 'Rendah',
      },
      {
        parameter: 'Leukosit',
        hasil: '7.500',
        satuan: '/µL',
        nilaiRujukan: '4.000 - 11.000',
        keterangan: 'Normal',
      },
      {
        parameter: 'Trombosit',
        hasil: '250.000',
        satuan: '/µL',
        nilaiRujukan: '150.000 - 400.000',
        keterangan: 'Normal',
      },
      {
        parameter: 'Eritrosit',
        hasil: '4.2',
        satuan: 'juta/µL',
        nilaiRujukan: '4.5 - 5.5',
        keterangan: 'Rendah',
      },
      { parameter: 'Hematokrit', hasil: '38', satuan: '%', nilaiRujukan: '40 - 54', keterangan: 'Rendah' },
    ],
  },
  {
    id: '2',
    waktu: '2026-02-27 09:15',
    idAlat: 'ALT-002',
    namaPasien: 'Siti Nurhaliza',
    hasilSingkat: 'Glukosa tinggi, Kolesterol normal',
    parameters: [
      {
        parameter: 'Glukosa Puasa',
        hasil: '180',
        satuan: 'mg/dL',
        nilaiRujukan: '70 - 100',
        keterangan: 'Tinggi',
      },
      {
        parameter: 'Kolesterol Total',
        hasil: '190',
        satuan: 'mg/dL',
        nilaiRujukan: '< 200',
        keterangan: 'Normal',
      },
      {
        parameter: 'Trigliserida',
        hasil: '145',
        satuan: 'mg/dL',
        nilaiRujukan: '< 150',
        keterangan: 'Normal',
      },
      { parameter: 'HDL', hasil: '55', satuan: 'mg/dL', nilaiRujukan: '> 40', keterangan: 'Normal' },
      { parameter: 'LDL', hasil: '120', satuan: 'mg/dL', nilaiRujukan: '< 130', keterangan: 'Normal' },
    ],
  },
  {
    id: '3',
    waktu: '2026-02-27 10:00',
    idAlat: 'ALT-001',
    namaPasien: 'Budi Santoso',
    hasilSingkat: 'Semua parameter normal',
    parameters: [
      {
        parameter: 'Hemoglobin',
        hasil: '14.5',
        satuan: 'g/dL',
        nilaiRujukan: '13.0 - 17.5',
        keterangan: 'Normal',
      },
      {
        parameter: 'Leukosit',
        hasil: '6.800',
        satuan: '/µL',
        nilaiRujukan: '4.000 - 11.000',
        keterangan: 'Normal',
      },
      {
        parameter: 'Trombosit',
        hasil: '280.000',
        satuan: '/µL',
        nilaiRujukan: '150.000 - 400.000',
        keterangan: 'Normal',
      },
      {
        parameter: 'Eritrosit',
        hasil: '5.0',
        satuan: 'juta/µL',
        nilaiRujukan: '4.5 - 5.5',
        keterangan: 'Normal',
      },
      { parameter: 'Hematokrit', hasil: '45', satuan: '%', nilaiRujukan: '40 - 54', keterangan: 'Normal' },
    ],
  },
  {
    id: '4',
    waktu: '2026-02-27 10:45',
    idAlat: 'ALT-003',
    namaPasien: 'Dewi Lestari',
    hasilSingkat: 'SGOT tinggi, SGPT tinggi',
    parameters: [
      { parameter: 'SGOT', hasil: '85', satuan: 'U/L', nilaiRujukan: '5 - 40', keterangan: 'Tinggi' },
      { parameter: 'SGPT', hasil: '92', satuan: 'U/L', nilaiRujukan: '7 - 56', keterangan: 'Tinggi' },
      {
        parameter: 'Bilirubin Total',
        hasil: '1.0',
        satuan: 'mg/dL',
        nilaiRujukan: '0.1 - 1.2',
        keterangan: 'Normal',
      },
      { parameter: 'Albumin', hasil: '3.8', satuan: 'g/dL', nilaiRujukan: '3.5 - 5.0', keterangan: 'Normal' },
      {
        parameter: 'Protein Total',
        hasil: '7.0',
        satuan: 'g/dL',
        nilaiRujukan: '6.0 - 8.3',
        keterangan: 'Normal',
      },
    ],
  },
  {
    id: '5',
    waktu: '2026-02-27 11:30',
    idAlat: 'ALT-002',
    namaPasien: 'Rudi Hermawan',
    hasilSingkat: 'Kreatinin tinggi, Ureum tinggi',
    parameters: [
      {
        parameter: 'Kreatinin',
        hasil: '2.5',
        satuan: 'mg/dL',
        nilaiRujukan: '0.7 - 1.3',
        keterangan: 'Tinggi',
      },
      { parameter: 'Ureum', hasil: '65', satuan: 'mg/dL', nilaiRujukan: '15 - 40', keterangan: 'Tinggi' },
      {
        parameter: 'Asam Urat',
        hasil: '6.5',
        satuan: 'mg/dL',
        nilaiRujukan: '3.5 - 7.2',
        keterangan: 'Normal',
      },
      {
        parameter: 'Natrium',
        hasil: '140',
        satuan: 'mEq/L',
        nilaiRujukan: '136 - 145',
        keterangan: 'Normal',
      },
      { parameter: 'Kalium', hasil: '4.2', satuan: 'mEq/L', nilaiRujukan: '3.5 - 5.0', keterangan: 'Normal' },
    ],
  },
]
