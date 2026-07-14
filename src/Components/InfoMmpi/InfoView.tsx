import React from 'react'
import { HiOutlineBookOpen } from 'react-icons/hi2'
import InfoHero from './InfoHero'
import InfoAccordion from './InfoAccordion'
import QuickInfoGrid from './QuickInfoGrid'

interface InfoViewProps {
  logoSrc: string
  profileHref: string
  dashboardHref: string
}

const InfoView: React.FC<InfoViewProps> = ({ logoSrc, profileHref, dashboardHref }) => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <InfoHero logoSrc={logoSrc} />

          <div className="col-span-1 lg:col-span-8 bg-gray-50 p-6 md:p-8">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-1">
                <HiOutlineBookOpen className="w-6 h-6 text-primary" />
                Info MMPI-2
              </h2>
              <p className="text-sm text-gray-500">
                Informasi lengkap, peraturan sebelum tes, dan ketentuan penting terkait pelaksanaan MMPI-2 di
                RSND Semarang.
              </p>
            </div>

            <hr className="border-gray-200 mb-5" />

            <section className="mb-6">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Apa itu MMPI-2?</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>MMPI-2 (Minnesota Multiphasic Personality Inventory-2)</strong> adalah instrumen
                psikologis yang digunakan untuk mengevaluasi aspek kepribadian, kesehatan mental, dan potensi
                gangguan psikologis. Tes ini terdiri dari <strong>567 pernyataan</strong> yang dijawab dengan
                pilihan <em>Ya (True)</em> atau <em>Tidak (False)</em>.
              </p>
            </section>

            <div className="mb-6">
              <InfoAccordion />
            </div>

            <QuickInfoGrid />

            <div className="flex gap-2 flex-wrap mt-6">
              <a
                href={profileHref}
                className="px-5 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Profil
              </a>

              <a
                href={dashboardHref}
                className="px-5 py-2.5 rounded-full border-2 border-emerald-500 text-emerald-600 text-sm font-medium hover:bg-emerald-500 hover:text-white transition-colors"
              >
                Back
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoView