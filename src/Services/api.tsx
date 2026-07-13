/**
 * @file api.tsx
 * @description RTK Query API base configuration untuk MMPI (session-based auth via Flask).
 *
 * Catatan:
 * - Backend Flask menggunakan session cookie (bukan JWT), jadi tidak perlu
 *   Authorization header, refresh token, atau permission events seperti versi lama.
 * - `credentials: 'include'` WAJIB agar cookie session terkirim & tersimpan.
 * - Pada 401 (session invalid/expired), cukup redirect ke halaman login.
 *
 * @module Services/api
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include', // WAJIB: kirim & simpan cookie session Flask
})

/**
 * Wrapper tipis di atas baseQuery.
 * Saat ini hanya menangani 401 (belum/tidak login lagi) dengan redirect ke halaman login.
 * Tidak ada refresh token karena backend memakai session, bukan JWT.
 */
const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    console.warn('[API] 401 Unauthorized - session tidak valid, redirect ke login')

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  if (result.error && result.error.status === 403) {
    console.warn('[API] 403 Forbidden - tidak punya akses:', result.error.data)
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Auth', 'Member', 'Result', 'Report', 'Chart', 'Dashboard'],
  endpoints: () => ({}),
})