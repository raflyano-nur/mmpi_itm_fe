import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_LOCAL_STORAGE_SECRET_KEY

export const encryptData = (name: string, data: any) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
  localStorage.setItem(name, encrypted)
}

export const decryptData = (name: string) => {
  const encrypted = localStorage.getItem(name)
  if (encrypted !== null) {
    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    return JSON.parse(decrypted)
  } else {
    return null
  }
}
