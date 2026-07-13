/**
 * @file useTokenRefresh.ts
 * @description React hook untuk mengelola silent token refresh.
 *
 * Fitur:
 * - Jadwalkan refresh 10 menit sebelum token expired (setTimeout)
 * - Skip refresh jika tab hidden (visibility API)
 * - Setelah refresh, validasi route aktif terhadap modules baru
 * - Redirect + toast confirm jika route tidak lagi diizinkan
 * - Promise lock via tokenRefresh service
 *
 * @module Hooks/useTokenRefresh
 */

import { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Modal } from 'antd'
import type { RootState } from '@/Store'
import {
  scheduleTokenRefresh,
  clearRefreshTimer,
  isCurrentRouteAllowed,
  getFirstAllowedRoute,
  hasModulesChanged,
} from '@/Services/tokenRefresh'
import { decodeJWT } from '@/Utils/jwtHelper'
import type { ModuleMenu } from '@/Services/Modules/auth/auth.types'
import { setRoute } from '@/Store/redux/Sidebar'

/**
 * Hook untuk mengelola silent token refresh dan route validation.
 *
 * Harus dipanggil di dalam komponen yang sudah di-wrap oleh:
 * - `<Provider store={store}>`
 * - `<BrowserRouter>`
 *
 * @example
 * ```tsx
 * function App() {
 *   useTokenRefresh()
 *   return <Routes>...</Routes>
 * }
 * ```
 */
export const useTokenRefresh = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const token = useSelector((state: RootState) => state.AuthSlicer?.BearerToken)
  const modules = useSelector((state: RootState) => state.AuthSlicer?.modules)

  // Ref untuk menyimpan state terbaru (avoid stale closure)
  const tokenRef = useRef(token)
  const modulesRef = useRef(modules)
  const locationRef = useRef(location)

  // Update refs
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  useEffect(() => {
    modulesRef.current = modules
  }, [modules])

  useEffect(() => {
    locationRef.current = location
  }, [location])

  /**
   * Callback setelah refresh berhasil.
   * Bandingkan modules lama vs baru, redirect jika perlu.
   */
  const handleRefreshSuccess = useCallback(
    (newToken: string, oldModules: ModuleMenu[]) => {
      const decoded = decodeJWT(newToken)
      if (!decoded) return

      const newModules: ModuleMenu[] = decoded.modules ?? []

      // Cek apakah modules berubah
      if (!hasModulesChanged(oldModules, newModules)) {
        console.log('[useTokenRefresh] Modules unchanged after refresh')
        return
      }

      console.log('[useTokenRefresh] Modules changed after refresh, validating current route...')

      // Cek apakah route saat ini masih diizinkan
      if (!isCurrentRouteAllowed(newModules)) {
        const firstAllowed = getFirstAllowedRoute(newModules)
        const currentPath = window.location.pathname

        console.warn(
          `[useTokenRefresh] Current route "${currentPath}" no longer allowed. Redirecting to "${firstAllowed}"`,
        )

        // Tampilkan dialog confirm
        Modal.confirm({
          title: 'Akses Berubah',
          content: `Hak akses Anda telah diperbarui. Halaman "${currentPath}" tidak lagi tersedia. Anda akan dialihkan ke halaman yang diizinkan.`,
          okText: 'OK',
          cancelText: 'Batal',
          centered: true,
          onOk: () => {
            dispatch(setRoute(firstAllowed))
            navigate(firstAllowed, { replace: true })
          },
          onCancel: () => {
            // Tetap redirect meskipun cancel, karena route tidak valid
            dispatch(setRoute(firstAllowed))
            navigate(firstAllowed, { replace: true })
          },
        })
      }
    },
    [dispatch, navigate],
  )

  /**
   * Effect utama: schedule refresh ketika token berubah
   */
  useEffect(() => {
    if (!token) {
      clearRefreshTimer()
      return
    }

    // Schedule silent refresh
    scheduleTokenRefresh(handleRefreshSuccess)

    // Cleanup saat unmount atau token berubah
    return () => {
      clearRefreshTimer()
    }
  }, [token, handleRefreshSuccess])

  /**
   * Effect: handle visibility change untuk re-schedule
   * Ketika tab kembali aktif dan token masih ada, re-schedule refresh
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tokenRef.current) {
        console.log('[useTokenRefresh] Tab became visible, re-scheduling refresh')
        scheduleTokenRefresh(handleRefreshSuccess)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleRefreshSuccess])
}

export default useTokenRefresh
