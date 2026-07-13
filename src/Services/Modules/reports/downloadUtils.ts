export interface DownloadFilePayload {
  blob: Blob
  filename: string
}

export const getFilenameFromContentDisposition = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) return fallback

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])

  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  return filenameMatch?.[1] ?? fallback
}

export const saveBlobFile = ({ blob, filename }: DownloadFilePayload) => {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.URL.revokeObjectURL(url)
}
