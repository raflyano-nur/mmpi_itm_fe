export interface PayloadBearerToken {
  iss: string
  iat: number
  nbf: number
  exp: number
  data: {
    uid: string
    username: string
    name: string
    name_with_title: string
    role_code: number
    role_name: string
    title: string
    iat: number
    exp: number
  }
}

export const decodeJWT = (token: string | null) => {
  try {
    // JWT format: header.payload.signature
    const parts = token?.split('.')

    if (parts?.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    // Decode base64url payload
    const payload = parts[1]
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    return decodedPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded.exp) {
    return true // Anggap expired jika tidak bisa decode
  }

  const expirationTime = decoded.exp * 1000 // Convert ke milliseconds
  const currentTime = Date.now()

  return currentTime >= expirationTime
}

export const isTokenExpiringSoon = (token: string, minutesBeforeExpiry: number = 5): boolean => {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded.exp) {
    return true
  }

  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  const timeUntilExpiry = expirationTime - currentTime
  const minutesInMs = minutesBeforeExpiry * 60 * 1000

  return timeUntilExpiry <= minutesInMs
}

export const getTokenRemainingTime = (token: string): number => {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded.exp) {
    return 0
  }

  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  const remainingMs = expirationTime - currentTime

  return Math.floor(remainingMs / 1000 / 60) // Convert ke menit
}

export const getUserFromToken = (token: string) => {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded) {
    return null
  }

  return decoded
}

export const getTokenExpiryDate = (token: string): Date | null => {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded.exp) {
    return null
  }

  return new Date(decoded.exp * 1000)
}
