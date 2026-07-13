/**
 * @file 404.tsx
 * @description Halaman 404 - ditampilkan saat route/path tidak ditemukan
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
          <HiOutlineExclamationTriangle className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Kembali
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound