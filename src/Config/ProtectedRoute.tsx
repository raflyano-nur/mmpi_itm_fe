/**
 * @file ProtectedRoute.tsx
 * @description Protected route component untuk MMPI (session-based auth via Flask).
 *
 * Features:
 * - Cek session aktif lewat endpoint /auth/me
 * - Redirect ke /login kalau belum login / session invalid
 * - Tampilkan loading screen saat sedang cek status
 * - Semua role (admin/user) diarahkan ke /dashboard yang sama —
 *   perbedaan tampilan diatur di dalam DashboardContainer itu sendiri
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMeQuery } from '@/Services/Modules/auth'
import NotFound from '@/Components/Errors/404'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Loading screen component
 */
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Memeriksa Sesi Login</h2>
      <p className="text-gray-500">Mohon tunggu sebentar...</p>
    </div>
  </div>
)

/**
 * Protected route component yang cek session aktif lewat /auth/me.
 * - Redirect ke /login kalau belum login / session sudah tidak valid
 * - Render children kalau session valid (untuk role apapun)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const { isLoading, isError } = useMeQuery()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isError) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * Route yang seharusnya hanya bisa diakses saat BELUM login
 * (contoh: halaman login itu sendiri)
 */
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useMeQuery()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (data?.success) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/**
 * Catch-all route handler.
 * - Kalau belum login → redirect ke /login
 * - Kalau sudah login tapi path tidak ada → tampilkan halaman 404
 */
export const CatchAllRoute: React.FC = () => {
  const location = useLocation()
  const { data, isLoading, isError } = useMeQuery()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isError || !data?.success) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <NotFound />
}

export default ProtectedRoute