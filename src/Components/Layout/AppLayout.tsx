// Components/Layout/AppLayout.tsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerRightSide?: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle = '',
  headerRightSide,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="app-shell flex min-h-screen h-dvh bg-linear-to-br from-gray-50 to-gray-100">
      {/* Overlay untuk mobile ketika sidebar terbuka */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden di mobile, tampil di desktop */}
      <div className="hidden min-h-0 md:flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Sidebar mobile - fixed overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-30 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setIsMobileSidebarOpen(false)}
          isMobile={true}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          rightSide={headerRightSide}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <div className="app-shell__content flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

export default AppLayout
