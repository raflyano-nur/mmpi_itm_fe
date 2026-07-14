import React, { useState } from 'react'
import AccordionItem from './AccordionItem'
import { INFO_ACCORDION_SECTIONS } from './infoMmpi.config'

const InfoAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-3">
      {INFO_ACCORDION_SECTIONS.map((section) => (
        <AccordionItem
          key={section.id}
          section={section}
          isOpen={openId === section.id}
          onToggle={() => handleToggle(section.id)}
        />
      ))}
    </div>
  )
}

export default InfoAccordion