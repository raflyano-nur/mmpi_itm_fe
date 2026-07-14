import React from 'react'
import type { IconType } from 'react-icons'
import {
  HiOutlineScale,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineShieldExclamation,
  HiOutlineMapPin,
  HiOutlineClock,
} from 'react-icons/hi2'

export interface InfoAccordionSection {
  id: string
  title: string
  icon: IconType
  content: React.ReactNode
}

export interface QuickInfoItem {
  icon: IconType
  title: string
  description: string
}

/**
 * Single source of truth untuk konten halaman Info MMPI-2.
 * Ubah teks/urutan di sini — komponen (InfoView/InfoAccordion) tinggal render.
 */
export const INFO_ACCORDION_SECTIONS: InfoAccordionSection[] = [
  {
    id: 'purpose',
    title: 'Tujuan Tes',
    icon: HiOutlineScale,
    content: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          Membantu dalam proses <strong>diagnosis psikologis / psikiatris</strong>.
        </li>
        <li>
          Menjadi bahan pertimbangan dalam <strong>evaluasi klinis, konseling, dan terapi</strong>.
        </li>
        <li>
          Digunakan dalam bidang <strong>psikologi industri, pendidikan, dan forensik</strong> untuk memahami
          profil kepribadian.
        </li>
        <li>
          Mendukung dokter atau psikolog dalam menyusun <strong>rencana penanganan</strong>.
        </li>
      </ul>
    ),
  },
  {
    id: 'rules',
    title: 'Peraturan Sebelum Tes',
    icon: HiOutlineClipboardDocumentList,
    content: (
      <>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Kerjakan sendiri tanpa bantuan orang lain.</li>
          <li>Jangan terburu-buru — bacalah setiap pernyataan dengan teliti sebelum menjawab.</li>
          <li>
            Jawablah <strong>jujur</strong> sesuai kondisi saat ini, bukan berdasarkan harapan.
          </li>
          <li>Hindari membandingkan jawaban dengan peserta lain.</li>
          <li>Pastikan kondisi fisik fit (cukup istirahat, tidak lapar/terlalu lelah).</li>
          <li>Tidak diperkenankan mengulang atau mengganti jawaban setelah dikirim.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Tips:</strong> Bila Anda merasa terganggu secara emosional, konsultasikan dulu dengan petugas
          sebelum melanjutkan tes.
        </div>
      </>
    ),
  },
  {
    id: 'terms',
    title: 'Ketentuan Tes & Hasil',
    icon: HiOutlineDocumentText,
    content: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Jumlah soal:</strong> 567 item.
        </li>
        <li>
          <strong>Waktu pengerjaan:</strong> rata-rata 60–90 menit (tidak dibatasi ketat).
        </li>
        <li>
          <strong>Format jawaban:</strong> Ya (True) / Tidak (False).
        </li>
        <li>
          Hasil akan diproses oleh sistem dan <strong>diinterpretasikan oleh Psikolog / Psikiater</strong>{' '}
          berwenang.
        </li>
        <li>Tes ini bukan penilaian benar/salah, tetapi alat untuk memahami pola kepribadian.</li>
      </ul>
    ),
  },
  {
    id: 'confidential',
    title: 'Kerahasiaan & Catatan Penting',
    icon: HiOutlineShieldExclamation,
    content: (
      <>
        <p>
          Hasil tes bersifat <strong>rahasia</strong> dan hanya digunakan oleh tenaga profesional untuk keperluan
          klinis. Interpretasi akhir akan diberikan oleh{' '}
          <strong>Psikolog Klinis / Psikiater RSND Semarang</strong>.
        </p>
        <p className="mb-0">
          Jika Anda memiliki kekhawatiran terkait privasi atau penggunaan data, silakan hubungi pihak Poliklinik
          sebelum melakukan tes.
        </p>
      </>
    ),
  },
]

export const QUICK_INFO_ITEMS: QuickInfoItem[] = [
  {
    icon: HiOutlineMapPin,
    title: 'Lokasi',
    description: 'Poliklinik Kejiwaan, Gedung Rawat Jalan RSND Semarang (Tembalang)',
  },
  {
    icon: HiOutlineClock,
    title: 'Jam Layanan',
    description: 'Senin - Jumat, 08.00 - 15.00 WIB (jadwal dapat berubah; konfirmasi via telepon)',
  },
]