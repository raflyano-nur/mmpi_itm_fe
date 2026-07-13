/**
 * @file authUtils.ts
 * @description Utility untuk inisialisasi autentikasi via refresh token.
 * Dipakai di setiap halaman yang membutuhkan validasi sesi pengguna.
 *
 * @module Utils/authUtils
 */

import type { Dispatch } from '@reduxjs/toolkit'
import { setBearerToken, setDefaultUser } from '@/Store/redux/Auth'
import { decodeJWT } from '@/Utils/jwtHelper'
import { performTokenRefresh, scheduleTokenRefresh } from '@/Services/tokenRefresh'

/**
 * Tipe untuk mutation RTK Query postRefresh.
 * Menerima fungsi trigger dari usePostRefreshMutation().
 */
type PostRefreshTrigger = () => { unwrap: () => Promise<{ token: string }> }

/**
 * Menginisialisasi autentikasi dengan melakukan refresh token.
 * Mendispatch bearer token dan data user ke Redux store.
 * Juga menjadwalkan silent refresh berikutnya.
 *
 * Gagal secara silent (hanya log) agar tidak memblokir render halaman.
 *
 * @param postRefreshToken - Fungsi trigger dari RTK Query mutation
 * @param dispatch - Redux dispatch function
 *
 * @example
 * // Di dalam komponen:
 * const [postRefreshToken] = usePostRefreshMutation()
 * const dispatch = useDispatch()
 *
 * useEffect(() => {
 *   initializeAuth(postRefreshToken, dispatch)
 * }, [])
 */
export const initializeAuth = async (
  postRefreshToken: PostRefreshTrigger,
  dispatch: Dispatch,
): Promise<void> => {
  try {
    const result = await postRefreshToken().unwrap()
    dispatch(setBearerToken(result?.token))
    dispatch(setDefaultUser(decodeJWT(result?.token)))
  } catch (error) {
    console.log('[authUtils] User not authenticated:', error)
  }
}

/**
 * Inisialisasi auth menggunakan tokenRefresh service (tanpa RTK Query).
 * Lebih sederhana dan terintegrasi dengan promise lock.
 *
 * @param dispatch - Redux dispatch function
 */
export const initializeAuthWithRefresh = async (dispatch: Dispatch): Promise<void> => {
  try {
    const newToken = await performTokenRefresh()
    if (newToken) {
      console.log('[authUtils] Auth initialized via refresh')
    }
  } catch (error) {
    console.log('[authUtils] User not authenticated:', error)
  }
}
