// src/Store/redux/Auth/index.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isTokenExpired, decodeJWT } from '@/Utils/jwtHelper'
import type { AuthUser, ModuleMenu, Permissions } from '@/Services/Modules/auth/auth.types'

/**
 * Interface untuk decoded JWT payload yang mengandung modules & permissions
 */
export interface JWTPayload {
  iss: string
  iat: number
  exp: number
  nbf: number
  jti: string
  sub: string
  prv: string
  permissions: Permissions
  modules: ModuleMenu[]
  [key: string]: any
}

interface AuthState {
  BearerToken: string | null
  user: Record<string, any> | null
  userID: any | null
  defaultData: JWTPayload | null
  modules: ModuleMenu[]
  permissions: Permissions
}

const initialState = (): AuthState => ({
  BearerToken: null,
  defaultData: null,
  user: null,
  userID: null,
  modules: [],
  permissions: {},
})

/**
 * Parse modules dan permissions dari JWT token payload
 */
const parseTokenData = (token: string) => {
  const decoded = decodeJWT(token) as JWTPayload | null
  if (!decoded) return { modules: [] as ModuleMenu[], permissions: {} as Permissions, decoded: null }

  return {
    modules: decoded.modules ?? [],
    permissions: decoded.permissions ?? {},
    decoded,
  }
}

const AuthSlicer = createSlice({
  name: 'Auth',
  initialState: initialState(),
  reducers: {
    /**
     * Set bearer token dan parse modules/permissions dari JWT payload.
     * Jika token expired, akan di-ignore.
     */
    setBearerToken: (state, action: PayloadAction<string | null>) => {
      const token = action.payload

      if (token && isTokenExpired(token)) {
        console.warn('[Auth] Attempted to set expired token, ignoring...')
        state.BearerToken = null
        state.defaultData = null
        state.modules = []
        state.permissions = {}
        return
      }

      state.BearerToken = token ?? null

      if (token) {
        const { modules, permissions, decoded } = parseTokenData(token)

        state.user = decoded ?? null
        state.defaultData = decoded ?? null
        state.modules = modules
        state.permissions = permissions

        if (decoded) {
          console.log('[Auth] Token set successfully')
          console.log(
            '[Auth] Modules:',
            modules.map((m) => m.module_name),
          )
          console.log('[Auth] Permissions:', Object.keys(permissions))
          console.log('[Auth] Expires:', new Date(decoded.exp * 1000).toLocaleString())
        }
      } else {
        state.user = null
        state.defaultData = null
        state.modules = []
        state.permissions = {}
      }
    },

    /**
     * Clear semua auth state (logout)
     */
    clearBearerToken: (state) => {
      state.BearerToken = null
      state.user = null
      state.defaultData = null
      state.modules = []
      state.permissions = {}
      state.userID = null
      console.log('[Auth] Token cleared, user logged out')
    },

    /**
     * Validasi token, jika expired maka clear state
     */
    validateToken: (state) => {
      if (state.BearerToken && isTokenExpired(state.BearerToken)) {
        console.log('[Auth] Token has expired, clearing...')
        state.BearerToken = null
        state.user = null
        state.defaultData = null
        state.modules = []
        state.permissions = {}
        state.userID = null
      }
    },

    /**
     * Set default user data (decoded JWT payload)
     */
    setDefaultUser: (state, action: PayloadAction<Record<string, any> | null>) => {
      state.defaultData = action.payload ? (action.payload as JWTPayload) : null

      // Sync modules & permissions jika defaultData di-set manual
      if (action.payload) {
        state.modules = (action.payload as JWTPayload).modules ?? state.modules
        state.permissions = (action.payload as JWTPayload).permissions ?? state.permissions
      }
    },

    /**
     * Update user ID & Role
     */
    setUserID: (state, action: PayloadAction<any>) => {
      state.userID = action.payload
    },

    /**
     * Update modules saja (misalnya setelah refresh token)
     */
    setModules: (state, action: PayloadAction<ModuleMenu[]>) => {
      state.modules = action.payload
    },

    /**
     * Update permissions saja
     */
    setPermissions: (state, action: PayloadAction<Permissions>) => {
      state.permissions = action.payload
    },
  },
})

export const {
  setBearerToken,
  clearBearerToken,
  validateToken,
  setDefaultUser,
  setModules,
  setPermissions,
  setUserID,
} = AuthSlicer.actions

export default AuthSlicer.reducer
