import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_CAPTCHA_SECRET_KEY || 'DEFAULT_SECRET'

/**
 * Generate HMAC-SHA256 — sama persis dengan backend:
 * hash_hmac('sha256', strtolower($input), $secretKey)
 */
export const encryptCaptcha = (text: string): string => {
  return CryptoJS.HmacSHA256(text, SECRET_KEY).toString(CryptoJS.enc.Hex)
}
