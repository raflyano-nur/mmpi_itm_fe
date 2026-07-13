/**
 * @file MainDiagnostik.tsx
 * @description Komponen utama halaman Diagnostik dengan TabMenu.
 *
 * Terdiri dari dua tab:
 * - List Diagnostik: Tabel daftar hasil diagnostik pasien
 * - Laporan Diagnostik: Laporan dan statistik diagnostik
 *
 * @module Diagnostik/MainDiagnostik
 */

import React, { useState } from 'react'
import TabMenu, { type TabMenuItem } from '@/Components/General/TabMenu'
import DiagnostikList from './List/DiagnostikList'
import DiagnostikReport from './Report/DiagnostikReport'
import { HiDocumentText, HiChartBar } from 'react-icons/hi2'
import { RootState } from '@/Store'
import { useSelector } from 'react-redux'
import { findMenuByRoute, mapMenusToTabItems } from '@/Utils/tabUtils'

// ===================================================================
// MAIN COMPONENT
// ===================================================================

const MainDiagnostik: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('/diagnostic/list')
  // ===================================================================
  // TAB CONFIGURATION
  // ===================================================================
  const MenusData = useSelector((state: RootState) => state?.AuthSlicer?.defaultData)
  const filteredMenu = findMenuByRoute(MenusData?.modules, location.pathname)
  const tabItems = mapMenusToTabItems(filteredMenu)

  // Handle tab change
  const handleTabChange = (key: string, parentKey?: string) => {
    setActiveTab(key)
    console.log('Active tab:', key, parentKey ? `(parent: ${parentKey})` : '')
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case '/diagnostic/list':
        return <DiagnostikList />
      case '/diagnostic/report':
        return <DiagnostikReport />
      default:
        return <DiagnostikList />
    }
  }

  return (
    <div className="w-full">
      <TabMenu
        items={tabItems}
        activeKey={activeTab}
        onChange={handleTabChange}
        variant="underline"
        size="md"
        colorScheme="primary"
        className="sticky top-0 z-10 bg-white"
        animated
      />

      {/* Tab Content */}
      <div className="mt-6 mx-3 animate-fadeIn">{renderContent()}</div>
    </div>
  )
}

export default MainDiagnostik
