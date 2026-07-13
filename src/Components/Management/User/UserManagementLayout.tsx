import React from 'react'
import AppLayout from '../../Layout/AppLayout'
import MainUserManagement from './MainUserManagement'

export const UserManagementLayout = () => {
  return (
    <AppLayout title="Management Data" subtitle="Data User">
      <MainUserManagement />
    </AppLayout>
  )
}
