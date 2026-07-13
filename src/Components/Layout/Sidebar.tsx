import React, { useEffect, useCallback } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { HiUserGroup } from 'react-icons/hi2'
import { RiLogoutCircleLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setRoute } from '@/Store/redux/Sidebar'
import { useLogoutMutation, useMeQuery, useGetMenuQuery } from '@/Services/Modules/auth'
import Icon from '@/Components/General/Icon'
import { api } from '@/Services/api'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  onMobileClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile = false, onMobileClose }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Polling setiap 30 detik untuk data user
  const { data: meData } = useMeQuery(undefined, {
    pollingInterval: 30000, // Polling setiap 30 detik
    refetchOnMountOrArgChange: true, // Refetch saat komponen mount
    refetchOnReconnect: true, // Refetch saat koneksi kembali
    refetchOnFocus: true, // Refetch saat window focus
  })

  // Polling setiap 1 menit untuk menu
  const { data: menuData } = useGetMenuQuery(undefined, {
    pollingInterval: 60000, // Polling setiap 1 menit
    refetchOnMountOrArgChange: true,
  })

  const user = meData?.data?.user
  const isAdmin = user?.role === 'admin'
  const isActive = user?.is_active === 1 // 1 = aktif, 0 = nonaktif

  const menuItems = menuData?.data?.menu ?? []

  const SidebarRoute = useSelector((state: any) => state?.SidebarSlicer?.Route)

  const [logout] = useLogoutMutation()

  const goTo = (route: string) => {
    navigate(route)
    dispatch(setRoute(route))
    if (isMobile) onMobileClose?.()
  }

  // Fungsi logout yang aman dari infinite loop
  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Reset semua cache RTK Query
      dispatch(api.util.resetApiState())
      // Hapus token dari localStorage jika ada
      localStorage.removeItem('token')
      // Navigasi ke login
      navigate('/login', { replace: true })
    }
  }, [logout, dispatch, navigate])

  // Cek status is_active user
  useEffect(() => {
    if (user && user.is_active === 0) {
      console.warn('User is inactive, logging out...')
      handleLogout()
    }
  }, [user?.is_active, handleLogout])

  return (
    <div
      className={`flex h-full min-h-0 flex-col bg-white border-r border-gray-800 transition-all duration-300 ease-in-out ${
        isMobile ? 'w-72' : isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center min-w-0 gap-2 overflow-hidden">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-primary-400 rounded">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-sm font-semibold leading-tight truncate whitespace-nowrap">
              MMPI-2 System
            </span>
          )}
        </div>

        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="flex-shrink-0 p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-200"
            title="Tutup sidebar"
          >
            <FiX size={18} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-2 transition-colors rounded-lg hover:bg-gray-200"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 px-2 overflow-x-hidden overflow-y-auto">
        {/* Expanded Menu */}
        {(!isCollapsed || isMobile) && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-3 py-2 text-base font-semibold text-primary-600">
              <span>Menu</span>
            </div>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.route}
                  onClick={() => goTo(item.route)}
                  className={`w-full px-3 py-2.5 rounded-lg hover:bg-primary-100 hover:text-primary-600 transition-colors flex items-center gap-3 cursor-pointer ${
                    item.route === SidebarRoute ? 'bg-gradient-to-r from-yellow-400/10 to-primary-500/10' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="bg-primary-400 p-1.5 rounded">
                      <Icon iconName={item.icon} className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span
                    className={`truncate text-sm text-left ${item.route === SidebarRoute ? 'font-medium' : ''}`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}

              {/* PROFILE */}
              {/* <button
                onClick={() => goTo('/profile')}
                className={`w-full px-3 py-2.5 rounded-lg hover:bg-primary-100 hover:text-primary-600 transition-colors flex items-center gap-3 cursor-pointer ${
                  '/profile' === SidebarRoute ? 'bg-gradient-to-r from-yellow-400/10 to-primary-500/10' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="bg-primary-400 p-1.5 rounded">
                    <HiUserGroup color="white" size={15} />
                  </div>
                </div>
                <span className={`truncate text-sm ${'/profile' === SidebarRoute ? 'font-medium' : ''}`}>
                  Profile
                </span>
              </button> */}
            </div>
          </div>
        )}

        {/* Collapsed Menu */}
        {isCollapsed && !isMobile && (
          <div className="mb-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.route}
                onClick={() => goTo(item.route)}
                className="flex items-center justify-center w-full p-2 transition-colors rounded-lg hover:bg-gray-200"
                title={item.label}
              >
                <div className="bg-primary-400 p-1.5 rounded">
                  <Icon iconName={item.icon} className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}

            <button
              onClick={() => goTo('/profile')}
              className="flex items-center justify-center w-full p-2 transition-colors rounded-lg hover:bg-gray-200"
              title={user?.Name || 'Profile'}
            >
              <div className="bg-primary-400 p-1.5 rounded">
                <HiUserGroup color="white" size={15} />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="app-shell__footer shrink-0 border-t border-gray-300">
        {(!isCollapsed || isMobile) && user && (
          <div className="px-3 py-2 text-xs text-gray-500 truncate flex items-center gap-2">
            <span>{user.username}</span>
            <span>·</span>
            <span className="capitalize">{user.role}</span>
            {/* Indikator status aktif/nonaktif */}
            <span
              className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
              title={isActive ? 'Akun Aktif' : 'Akun Nonaktif'}
            />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full py-2.5 hover:bg-gray-300 cursor-pointer transition-colors flex items-center ${
            isCollapsed && !isMobile ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <RiLogoutCircleLine size={16} />
          {(!isCollapsed || isMobile) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
