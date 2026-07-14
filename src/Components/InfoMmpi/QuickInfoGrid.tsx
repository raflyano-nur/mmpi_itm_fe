import React from 'react'
import { QUICK_INFO_ITEMS } from './infoMmpi.config'

const QuickInfoGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {QUICK_INFO_ITEMS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="border border-gray-200 rounded-lg p-3.5 h-full">
          <h6 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-1.5">
            <Icon className="w-4 h-4 text-primary" />
            {title}
          </h6>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  )
}

export default QuickInfoGrid