import { useState, useRef, useEffect, useCallback } from 'react'
import { generateCode } from '@/Helpers/captcha/captchaUtils'
import { drawCaptcha } from '@/Helpers/captcha/drawcaptcha'
import { styles, globalCss, STATUS_COLORS } from '@/Helpers/captcha/captchaStyles'

type CaptchaProps = {
  input: string
  setInput: any
  setCodeValue: any
  onVerify?: any // A FUNCTION - optional
}

export default function Captcha({ input, setInput, setCodeValue, onVerify }: CaptchaProps) {
  const [code, setCode] = useState(() => generateCode())
  const [status, setStatus] = useState('idle') // idle | success | error
  const [shakeKey, setShakeKey] = useState(0)
  const canvasRef = useRef(null)

  const refresh = useCallback(() => {
    setCode(generateCode())
    setCodeValue(generateCode())
    setInput('')
    setStatus('idle')
  }, [])

  useEffect(() => {
    drawCaptcha(canvasRef.current, code)
    setCodeValue(code)
  }, [code])

  const statusColor = STATUS_COLORS[status]

  return (
    <div style={styles.wrapper}>
      <style>{globalCss}</style>
      <div>
        {/* Header */}
        <div style={styles.header}>
          {/* <div style={styles.dot(statusColor)} /> */}
          <span className="block text-sm font-medium text-primary-800 mb-1.5">Verifikasi CAPTCHA</span>
        </div>

        {/* Canvas */}
        <div
          key={shakeKey}
          style={
            {
              ...styles.canvasWrap,
              animation: status === 'error' ? 'shake 0.5s ease' : undefined,
            } as any
          }
        >
          <canvas ref={canvasRef} width={260} height={72} style={styles.canvas as any} />
          <button
            className="refresh-btn"
            type="button"
            onClick={refresh}
            style={styles.refreshBtn as any}
            title="Refresh"
          >
            ↺
          </button>
        </div>

        {/* Input */}
        <input
          id="captcha"
          name="captcha"
          type="text"
          required
          className="text-xs block bg-white  rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-4 border w-1/2"
          style={{
            borderColor: status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : '#1e1e2e',
          }}
          placeholder=""
          value={input}
          onChange={(e: any) => {
            setInput(e.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
          maxLength={6}
          disabled={status === 'success'}
        />

        {/* Status message */}
        {status !== 'idle' && (
          <p style={{ ...styles.msg, color: statusColor, animation: 'fadeIn 0.2s ease' } as any}>
            {status === 'success' ? '✓ Berhasil diverifikasi!' : '✗ Kode salah, coba lagi...'}
          </p>
        )}
      </div>
    </div>
  )
}
