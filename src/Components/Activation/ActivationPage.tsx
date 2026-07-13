/**
 * @file ActivationPage.tsx
 * @description Halaman form input activation code
 *
 * Features:
 * - Auto-format XXXX-XXXX-XXXX-XXXX
 * - POST /activate saat submit
 * - Loading & error state
 */

import React, { useState, useCallback, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivation } from '@/Hooks/useActivation'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import * as HeroIcons from 'react-icons/hi2'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import bgTele from '@/Assets/Images/bg_telemedicine.png'
import 'react-lazy-load-image-component/src/effects/blur.css'

export const ActivationPage: React.FC = () => {
  const navigate = useNavigate()
  const { activate, isLoading, isActive, activatedAt } = useActivation()

  const [activationCode, setActivationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-format activation code to XXXX-XXXX-XXXX-XXXX
  const formatActivationCode = useCallback((value: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    // Add dashes every 4 characters
    const parts = []
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.slice(i, i + 4))
    }

    return parts.join('-')
  }, [])

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const formatted = formatActivationCode(value)
      setActivationCode(formatted)
      setError(null)
      setSuccessMessage(null)
    },
    [formatActivationCode],
  )

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!activationCode || activationCode.replace(/-/g, '').length !== 16) {
        setError('Masukkan kode aktivasi lengkap (16 karakter)')
        return
      }

      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const result = await activate(activationCode)

        if (result.success) {
          setSuccessMessage(result.message)
          // Redirect to dashboard after successful activation
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          setError(result.message)
        }
      } catch (err: any) {
        setError(err?.message || 'Terjadi kesalahan saat aktivasi')
      } finally {
        setIsSubmitting(false)
      }
    },
    [activationCode, activate, navigate],
  )

  // If already active, show success state
  if (isActive && activatedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aplikasi Sudah Aktif</h2>
            <p className="text-gray-600 mb-4">Aplikasi Anda telah diaktifkan pada:</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(activatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Masuk ke Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <LazyLoadImage
        className="object-cover h-screen"
        alt="background_image"
        effect="blur"
        height="100%"
        width="100%"
        wrapperProps={{
          style: {
            transitionDelay: '1s',
          },
        }}
        src={bgTele}
      />

      <div className="absolute top-1/2 left-1/2 z-2 translate-y-[-50%] translate-x-[-50%] px-3 w-full mx-auto max-w-md transition-all duration-300">
        <div className="overflow-hidden bg-transparent border border-gray-300 shadow-md backdrop-blur-xl rounded-2xl">
          <div className="flex items-center p-6 bg-gradient-to-r from-primary to-primary-600">
            <div className="w-3" />
            <div>
              <h1 className="text-xl font-bold text-white">Aktivasi Aplikasi</h1>
              <p className="mt-1 text-sm text-white/80">Masukkan kode aktivasi untuk menggunakan aplikasi</p>
            </div>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Activation Code */}
            <div>
              <label htmlFor="activation_code" className="block text-sm font-medium text-primary-800 mb-1.5">
                Kode Aktivasi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HeroIcons.HiOutlineKey className="text-primary-800" size={20} />
                </div>
                <input
                  type="text"
                  id="activation_code"
                  value={activationCode}
                  onChange={handleInputChange}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  disabled={isSubmitting || isLoading}
                  maxLength={19}
                  className="block w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-300 rounded-lg focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 uppercase"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">Format: XXXX-XXXX-XXXX-XXXX</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading || activationCode.replace(/-/g, '').length !== 16}
              className={`${
                isSubmitting || isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
              } transition-all w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {isSubmitting || isLoading ? (
                <Spin indicator={<LoadingOutlined spin />} />
              ) : (
                'Aktivasi Sekarang'
              )}
            </button>
          </form>

          {/* Loading overlay when checking initial status */}
          {isLoading && !isSubmitting && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Memeriksa status aktivasi...</p>
            </div>
          )}

          <div className="px-6 py-3 text-center">
            <p className="text-xs text-primary-800">© {new Date().getFullYear()} PT. Indo Tele Mediasoft</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ActivationPage
