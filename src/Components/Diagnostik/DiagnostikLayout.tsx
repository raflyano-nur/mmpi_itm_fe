import React from 'react'
import AppLayout from '../Layout/AppLayout'
import MainDiagnostik from './MainDiagnostik'

export const DiagnostikLayout = () => {
  return (
    <AppLayout title="Diagnostik" subtitle="Data Pasien & Hasil Diagnostik">
      <MainDiagnostik />
    </AppLayout>
  )
}
