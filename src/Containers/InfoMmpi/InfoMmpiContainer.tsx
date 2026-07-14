import React from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import InfoView from '@/Components/InfoMmpi/InfoView'
import imageContainer from '@/Hooks/Images'
import { useSessionUser } from '@/Hooks/useSessionUser'

/**
 * Owns navigation targets (profile/dashboard per logged-in user).
 * Presentation lives entirely in InfoView + Components/InfoMmpi.
 */
const InfoMmpiContainer: React.FC = () => {
  const session = useSessionUser()
  const images = imageContainer()

  return (
    <AppLayout title="Info MMPI-2" subtitle="Informasi Tes">
      <InfoView
        logoSrc={images.logoRsnd}
        profileHref="/profile"
        dashboardHref="/dashboard"
      />
    </AppLayout>
  )
}

export default InfoMmpiContainer