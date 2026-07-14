import React from 'react'
import { HiChevronDown } from 'react-icons/hi2'
import type { InfoAccordionSection } from './infoMmpi.config'

interface AccordionItemProps {
  section: InfoAccordionSection
  isOpen: boolean
  onToggle: () => void
}

const AccordionItem: React.FC<AccordionItemProps> = ({ section, isOpen, onToggle }) => {
  const { title, icon: Icon, content } = section

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-primary flex-shrink-0" />
          {title}
        </span>
        <HiChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed">{content}</div>
        </div>
      </div>
    </div>
  )
}

export default AccordionItem