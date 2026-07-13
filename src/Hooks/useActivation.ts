/**
 * @file useActivation.ts
 * @description Custom hook for Activation Gate feature
 *
 * Features:
 * - Hit GET /activate saat app pertama load
 * - Simpan hasilnya di state
 * - Cache status aktivasi di localStorage
 */

import { useState, useEffect, useCallback } from 'react'
import { useGetActivationStatusQuery, usePostActivationCodeMutation } from '@/Services/Modules/activation'
import { ActivationStatusResponse } from '@/Services/Modules/activation/activation.types'

const ACTIVATION_CACHE_KEY = 'activation_status_cache'

interface CachedActivation {
  is_active: boolean
  activated_at: string | null
  message: string
  cached_at: number
}

export interface UseActivationReturn {
  // State
  isActive: boolean | null
  activatedAt: string | null
  message: string
  isLoading: boolean
  isError: boolean
  error: any

  // Actions
  activate: (code: string) => Promise<{ success: boolean; message: string }>
  refetch: () => void
}

/**
 * Get cached activation status from localStorage
 */
const getCachedActivation = (): CachedActivation | null => {
  try {
    const cached = localStorage.getItem(ACTIVATION_CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('[useActivation] Error reading cache:', error)
  }
  return null
}

/**
 * Set cached activation status to localStorage
 */
const setCachedActivation = (data: { is_active: boolean; activated_at: string | null; message: string }) => {
  try {
    const cacheData: CachedActivation = {
      ...data,
      cached_at: Date.now(),
    }
    localStorage.setItem(ACTIVATION_CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('[useActivation] Error writing cache:', error)
  }
}

/**
 * Clear cached activation status
 */
export const clearActivationCache = () => {
  try {
    localStorage.removeItem(ACTIVATION_CACHE_KEY)
  } catch (error) {
    console.error('[useActivation] Error clearing cache:', error)
  }
}

export const useActivation = (): UseActivationReturn => {
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Try to get cached data first for immediate response
  const [cachedData, setCachedData] = useState<CachedActivation | null>(null)

  // Use RTK Query for API call
  const { data, isLoading, isError, error, refetch } = useGetActivationStatusQuery(undefined, {
    // Don't refetch on every navigation - rely on cache
    pollingInterval: 0,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  // Use mutation for posting activation code
  const [postActivationCode] = usePostActivationCodeMutation()

  // Load cached data on mount
  useEffect(() => {
    const cache = getCachedActivation()
    if (cache) {
      setCachedData(cache)
    }
  }, [])

  // Update cache when API data is received
  useEffect(() => {
    if (data && !isLoading) {
      setCachedActivation({
        is_active: data.is_active,
        activated_at: data.activated_at,
        message: data.message,
      })
      setInitialLoadDone(true)
    }
  }, [data, isLoading])

  // Determine actual values (use API data if available, otherwise use cache)
  const isActive = data?.is_active ?? cachedData?.is_active ?? null
  const activatedAt = data?.activated_at ?? cachedData?.activated_at ?? null
  const message = data?.message ?? cachedData?.message ?? ''

  // Handle activation code submission
  const activate = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      try {
        // Format the code (remove any existing dashes for validation)
        const formattedCode = code.replace(/-/g, '').toUpperCase()

        // Validate format
        if (formattedCode.length !== 16) {
          return { success: false, message: 'Kode aktivasi tidak valid. Format: XXXX-XXXX-XXXX-XXXX' }
        }

        // Add dashes back for API
        const codeWithDashes = `${formattedCode.slice(0, 4)}-${formattedCode.slice(4, 8)}-${formattedCode.slice(8, 12)}-${formattedCode.slice(12, 16)}`

        const result = await postActivationCode({ activation_code: codeWithDashes }).unwrap()

        // Clear cache to force refetch
        clearActivationCache()

        // Trigger refetch
        refetch()

        return {
          success: result.status === 'success',
          message: result.message,
        }
      } catch (err: any) {
        const errorMessage =
          err?.data?.message || err?.message || 'Gagal melakukan aktivasi. Silakan coba lagi.'
        return { success: false, message: errorMessage }
      }
    },
    [postActivationCode, refetch],
  )

  return {
    isActive,
    activatedAt,
    message,
    isLoading: isLoading && !initialLoadDone,
    isError,
    error,
    activate,
    refetch,
  }
}
