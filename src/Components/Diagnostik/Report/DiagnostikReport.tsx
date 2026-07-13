/**
 * @file DiagnostikReport.tsx
 * @description Komponen untuk menampilkan laporan dan statistik diagnostik.
 *
 * @module Diagnostik/DiagnostikReport
 */

import React from 'react'
import { HiChartBar } from 'react-icons/hi2'

const DiagnostikReport: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <HiChartBar className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Laporan Diagnostik</h3>
          <p className="text-sm text-neutral-500">Statistik dan laporan data diagnostik</p>
        </div>
      </div>

      {/* Placeholder - TODO: Implementasi laporan diagnostik */}
      <div className="mt-6 h-64 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
        <div className="text-center">
          <HiChartBar className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Laporan Diagnostik dalam pengembangan</p>
          <p className="text-neutral-300 text-xs mt-1">Coming soon...</p>
        </div>
      </div>

      {/* TODO: Tambahkan komponen ChartCard untuk statistik */}
      {/* <ChartCard title="Statistik Pemeriksaan" ... /> */}
    </div>
  )
}

export default DiagnostikReport
