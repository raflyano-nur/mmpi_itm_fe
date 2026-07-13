import React from 'react'
import { HiUser, HiInformationCircle, HiPlay } from 'react-icons/hi2'

interface UserDashboardViewProps {
  userName?: string
  userId?: string | number
  testPurpose: string
  agreed: boolean
  isSubmitting: boolean
  onTestPurposeChange: (value: string) => void
  onAgreedChange: (value: boolean) => void
  onSubmit: () => void
  onNavigateProfile: () => void
  onNavigateTestInfo: () => void
}

const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  userName,
  userId,
  testPurpose,
  agreed,
  isSubmitting,
  onTestPurposeChange,
  onAgreedChange,
  onSubmit,
  onNavigateProfile,
  onNavigateTestInfo,
}) => {
  const canSubmit = testPurpose.trim() !== '' && agreed

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Selamat Datang di Tes MMPI-2 Anda</h1>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-green-600 font-medium">{userName || '...'}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">ID: {userId || '...'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 space-y-3">
            <p className="text-gray-600 text-sm leading-relaxed">
              Anda akan memulai <span className="font-semibold text-primary">Tes MMPI-2</span> untuk{' '}
              <span className="font-semibold">Rumah Sakit Nasional Diponegoro</span>. Tes psikologi ini
              bertujuan untuk membantu kami memahami Anda dengan lebih baik.
            </p>
            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Catatan penting:</span> Tes ini berisi pertanyaan pribadi.
                Semua jawaban Anda akan dijaga kerahasiaannya.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              <HiUser size={16} />
              Profil Saya
            </button>
            <button
              onClick={onNavigateTestInfo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-green-500 text-green-600 text-sm font-medium hover:bg-green-500 hover:text-white transition-colors"
            >
              <HiInformationCircle size={16} />
              Informasi Tes
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tujuan mengikuti tes ini <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testPurpose}
                onChange={(e) => onTestPurposeChange(e.target.value)}
                placeholder="Jelaskan alasan Anda mengikuti tes ini"
                className="w-full px-4 py-2.5 border-2 border-primary/30 rounded-lg text-sm focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agreementCheckbox"
                checked={agreed}
                onChange={(e) => onAgreedChange(e.target.checked)}
                className="mt-1 w-5 h-5 accent-primary flex-shrink-0"
              />
              <label htmlFor="agreementCheckbox" className="text-sm text-gray-600">
                Saya menyatakan bahwa seluruh informasi yang saya berikan dalam formulir ini adalah benar
                dan akurat. Saya memahami bahwa segala ketidaksesuaian di kemudian hari menjadi tanggung
                jawab saya sepenuhnya.
              </label>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all ${
                  !canSubmit || isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-green-500 hover:scale-105'
                }`}
              >
                <HiPlay size={18} />
                {isSubmitting ? 'Memulai...' : 'Mulai Tes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboardView