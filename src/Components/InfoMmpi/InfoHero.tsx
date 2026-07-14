import React from 'react'

interface InfoHeroProps {
  logoSrc: string
}

const InfoHero: React.FC<InfoHeroProps> = ({ logoSrc }) => {
  return (
    <div className="hidden lg:flex lg:col-span-4 items-center justify-center bg-gray-50 p-8">
      <div className="text-center">
        <img src={logoSrc} alt="Logo RSND" className="mx-auto mb-3 max-h-[90px] w-auto object-contain" />
        <h4 className="text-lg font-bold text-gray-800">MMPI-2</h4>
        <p className="text-sm text-gray-600 mt-1">Poliklinik Kejiwaan — RSND Semarang</p>
      </div>
    </div>
  )
}

export default InfoHero