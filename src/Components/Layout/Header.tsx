// Header.tsx - Modern Version
import React from 'react'
import { BellOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { Badge, Avatar, Dropdown, Menu } from 'antd'
import { FiMenu } from 'react-icons/fi'

type HeaderProps = {
  title?: string
  subtitle?: string
  rightSide?: React.ReactNode
  onMobileMenuToggle?: () => void
}

const Header = (props: HeaderProps) => {
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" danger>
        Logout
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="bg-white border-b sticky top-0 z-10 backdrop-blur-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {/* Tombol hamburger - hanya tampil di mobile */}
          {props.onMobileMenuToggle && (
            <button
              onClick={props.onMobileMenuToggle}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Buka menu"
            >
              <FiMenu size={20} className="text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="xl:text-xl lg:text-lg md:text-lg text-sm font-bold bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {props.title || ''}
            </h1>
            {props.subtitle && <p className="text-sm text-gray-500 mt-0.5">{props.subtitle}</p>}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">{props.rightSide}</div>
      </div>
    </div>
  )
}

export default Header
