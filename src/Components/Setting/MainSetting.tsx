import React, { useState } from 'react'
import TabMenu, { type TabMenuItem } from '@/Components/General/TabMenu'
import { HiCog6Tooth, HiUserGroup, HiShieldCheck, HiBuildingOffice2, HiCpuChip } from 'react-icons/hi2'
import MainInstitution from './Institution/MainInstitution'
import MainDeviceManagement from './DeviceManagement/MainDeviceManagement'
import MainPermissions from './Permissions/MainPermissions'
import MainUser from './User/MainUser'
import MainRole from './Role/MainRole'
import MainAppConfig from './AppConfig/MainAppConfig'
import MainDispatchTargets from './DispatchTargets/MainDispatchTargets'
import { RootState } from '@/Store'
import { useSelector } from 'react-redux'
import { findMenuByRoute, mapMenusToTabItems } from '@/Utils/tabUtils'

const MainSetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => location.pathname || '')
  const MenusData = useSelector((state: RootState) => state?.AuthSlicer?.defaultData)
  const filteredMenu = findMenuByRoute(MenusData?.modules, location.pathname)
  const tabItems = mapMenusToTabItems(filteredMenu)
  console.log('FilteredMenu : ', filteredMenu.parents)
  console.log('TAB ITEMS : ', MenusData)

  // const tabItems: TabMenuItem[] = [
  //   {
  //     key: 'main-setting',
  //     label: 'Main Setting',
  //     icon: <HiCog6Tooth />,
  //   },
  //   {
  //     key: 'user-management',
  //     label: 'User Management',
  //     icon: <HiUserGroup />,
  //     children: [
  //       { key: 'user-list', label: 'Manajemen User' },
  //       { key: 'user-roles', label: 'Manajemen Role' },
  //     ],
  //   },
  //   {
  //     key: 'permissions',
  //     label: 'Hak Akses',
  //     icon: <HiShieldCheck />,
  //   },
  //   {
  //     key: 'institution',
  //     label: 'Institusi',
  //     icon: <HiBuildingOffice2 />,
  //   },
  //   {
  //     key: 'device-management',
  //     label: 'Manajemen Alat',
  //     icon: <HiCpuChip />,
  //   },
  // ]

  const handleTabChange = (key: string, parentKey?: string) => {
    setActiveTab(key)
    console.log('Active tab:', key, parentKey ? `(parent: ${parentKey})` : '')
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case '/dispatch-targets':
        return <MainDispatchTargets />
      case '/main-setting':
        return <MainAppConfig />
      // return <ContentPlaceholder title="Main Setting" description="Konfigurasi utama aplikasi" />
      case '/user-management/user':
        return <MainUser />
      case '/user-management/role':
        return <MainRole />
      case '/permissions':
        return <MainPermissions />
      case '/institution':
        return <MainInstitution />
      case '/device-management':
        return <MainDeviceManagement />
      default:
        return <ContentPlaceholder title="Pilih Menu" description="Pilih Salah Satu Menu Diatas!" />
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

// Placeholder component for tabs that are not yet implemented
const ContentPlaceholder: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white rounded-xl border border-neutral-200 p-6">
    <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
    <p className="text-sm text-neutral-500 mt-1">{description}</p>
    {/* <div className="mt-4 h-40 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
      <span className="text-neutral-400 text-sm">Konten {title}</span>
    </div> */}
  </div>
)

export default MainSetting
