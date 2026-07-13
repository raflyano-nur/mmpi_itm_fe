import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown } from 'react-icons/hi2'

// ==================== TYPES ====================

export interface TabMenuItem {
  /** Unique key identifier */
  key: string
  /** Display label */
  label: string
  /** Optional icon (react-icons or any ReactNode) */
  icon?: React.ReactNode
  /** If provided, tab becomes a dropdown with sub-items */
  children?: TabMenuSubItem[]
  /** Disabled state */
  disabled?: boolean
  /** Optional badge count */
  badge?: number
}

export interface TabMenuSubItem {
  key: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export type TabMenuVariant = 'underline' | 'pill' | 'bordered'
export type TabMenuSize = 'sm' | 'md' | 'lg'
export type TabMenuColorScheme = 'primary' | 'secondary' | 'neutral'

export interface TabMenuProps {
  /** Array of tab items */
  items: TabMenuItem[]
  /** Currently active tab key */
  activeKey?: string
  /** Default active tab key (uncontrolled) */
  defaultActiveKey?: string
  /** Callback when tab changes */
  onChange?: (key: string, parentKey?: string) => void
  /** Visual variant */
  variant?: TabMenuVariant
  /** Size preset */
  size?: TabMenuSize
  /** Color scheme based on theme */
  colorScheme?: TabMenuColorScheme
  /** Full width tabs */
  fullWidth?: boolean
  /** Additional className for container */
  className?: string
  /** Additional className for each tab item */
  tabClassName?: string
  /** Show animated indicator (underline variant) */
  animated?: boolean
  /** Scrollable when overflow */
  scrollable?: boolean
}

// ==================== DROPDOWN PORTAL ====================

interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({ anchorRef, children, isOpen, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, anchorRef])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    // Delay to avoid immediate close on the same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={dropdownRef}
      className="
        fixed z-[9999]
        min-w-[180px] bg-white rounded-lg shadow-lg
        border border-neutral-200
        py-1 animate-fadeIn
      "
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body,
  )
}

// ==================== COMPONENT ====================

const TabMenu: React.FC<TabMenuProps> = ({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  onChange,
  variant = 'underline',
  size = 'md',
  colorScheme = 'primary',
  fullWidth = false,
  className = '',
  tabClassName = '',
  animated = true,
  scrollable = true,
}) => {
  // State
  const [internalActiveKey, setInternalActiveKey] = useState<string>(defaultActiveKey || items[0]?.key || '')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  const activeKey = controlledActiveKey ?? internalActiveKey
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // ==================== COLOR MAPS ====================

  const colorMap: Record<
    TabMenuColorScheme,
    {
      active: string
      activeText: string
      hoverBg: string
      hoverText: string
      indicator: string
      pillActive: string
      pillActiveText: string
      borderedActive: string
      badge: string
      dropdownHover: string
      dropdownActive: string
    }
  > = {
    primary: {
      active: 'text-primary-600',
      activeText: 'text-primary-700',
      hoverBg: 'hover:bg-primary-50',
      hoverText: 'hover:text-primary-600',
      indicator: 'bg-primary-500',
      pillActive: 'bg-primary-500',
      pillActiveText: 'text-white',
      borderedActive: 'border-primary-500 bg-white',
      badge: 'bg-primary-500 text-white',
      dropdownHover: 'hover:bg-primary-50',
      dropdownActive: 'bg-primary-50 text-primary-600',
    },
    secondary: {
      active: 'text-secondary-600',
      activeText: 'text-secondary-700',
      hoverBg: 'hover:bg-secondary-50',
      hoverText: 'hover:text-secondary-600',
      indicator: 'bg-secondary-500',
      pillActive: 'bg-secondary-500',
      pillActiveText: 'text-white',
      borderedActive: 'border-secondary-500 bg-white',
      badge: 'bg-secondary-500 text-white',
      dropdownHover: 'hover:bg-secondary-50',
      dropdownActive: 'bg-secondary-50 text-secondary-600',
    },
    neutral: {
      active: 'text-neutral-800',
      activeText: 'text-neutral-900',
      hoverBg: 'hover:bg-neutral-100',
      hoverText: 'hover:text-neutral-700',
      indicator: 'bg-neutral-700',
      pillActive: 'bg-neutral-700',
      pillActiveText: 'text-white',
      borderedActive: 'border-neutral-500 bg-white',
      badge: 'bg-neutral-600 text-white',
      dropdownHover: 'hover:bg-neutral-100',
      dropdownActive: 'bg-neutral-100 text-neutral-800',
    },
  }

  const colors = colorMap[colorScheme]

  // ==================== SIZE MAPS ====================

  const sizeMap: Record<
    TabMenuSize,
    {
      text: string
      padding: string
      gap: string
      iconSize: string
      badgeSize: string
      dropdownPadding: string
    }
  > = {
    sm: {
      text: 'text-xs',
      padding: 'px-3 py-1.5',
      gap: 'gap-1.5',
      iconSize: 'text-sm',
      badgeSize: 'text-[10px] px-1.5 py-0.5',
      dropdownPadding: 'px-3 py-1.5',
    },
    md: {
      text: 'text-sm',
      padding: 'px-4 py-2.5',
      gap: 'gap-2',
      iconSize: 'text-base',
      badgeSize: 'text-[11px] px-2 py-0.5',
      dropdownPadding: 'px-4 py-2',
    },
    lg: {
      text: 'text-base',
      padding: 'px-5 py-3',
      gap: 'gap-2.5',
      iconSize: 'text-lg',
      badgeSize: 'text-xs px-2 py-0.5',
      dropdownPadding: 'px-5 py-2.5',
    },
  }

  const sizeStyles = sizeMap[size]

  // ==================== INDICATOR ====================

  const updateIndicator = useCallback(() => {
    if (variant !== 'underline' || !animated) return

    const activeTab = tabRefs.current.get(activeKey)
    // If activeKey is a child, find the parent tab
    let targetTab = activeTab
    if (!targetTab) {
      for (const item of items) {
        if (item.children?.some((child) => child.key === activeKey)) {
          targetTab = tabRefs.current.get(item.key)
          break
        }
      }
    }

    const container = tabsRef.current

    if (targetTab && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = targetTab.getBoundingClientRect()

      setIndicatorStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      })
    }
  }, [activeKey, variant, animated, items])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  // ==================== HANDLERS ====================

  const handleTabClick = (item: TabMenuItem) => {
    if (item.disabled) return

    if (item.children && item.children.length > 0) {
      setOpenDropdown(openDropdown === item.key ? null : item.key)
    } else {
      setInternalActiveKey(item.key)
      onChange?.(item.key)
      setOpenDropdown(null)
    }
  }

  const handleSubItemClick = (parentKey: string, subItem: TabMenuSubItem) => {
    if (subItem.disabled) return
    setInternalActiveKey(subItem.key)
    onChange?.(subItem.key, parentKey)
    setOpenDropdown(null)
  }

  // ==================== CHECK ACTIVE ====================

  const isTabActive = (item: TabMenuItem): boolean => {
    if (item.key === activeKey) return true
    if (item.children) {
      return item.children.some((child) => child.key === activeKey)
    }
    return false
  }

  const getActiveLabel = (item: TabMenuItem): string => {
    if (item.children) {
      const activeChild = item.children.find((child) => child.key === activeKey)
      if (activeChild) return activeChild.label
    }
    return item.label
  }

  // ==================== VARIANT STYLES ====================

  const getContainerStyles = (): string => {
    const base = 'flex items-center relative'

    switch (variant) {
      case 'underline':
        return `${base} border-b border-neutral-200`
      case 'pill':
        return `${base} bg-neutral-100 rounded-xl p-1`
      case 'bordered':
        return `${base} border-b border-neutral-200`
      default:
        return base
    }
  }

  const getTabStyles = (item: TabMenuItem): string => {
    const active = isTabActive(item)
    const disabled = item.disabled

    const base = `
      inline-flex items-center ${sizeStyles.gap} ${sizeStyles.text} ${sizeStyles.padding}
      font-medium transition-all duration-200 cursor-pointer select-none
      whitespace-nowrap relative
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      ${fullWidth ? 'flex-1 justify-center' : ''}
      ${tabClassName}
    `

    switch (variant) {
      case 'underline':
        return `${base} ${
          active ? `${colors.active} font-semibold` : `text-neutral-500 ${colors.hoverText} ${colors.hoverBg}`
        } rounded-t-lg`

      case 'pill':
        return `${base} rounded-lg ${
          active
            ? `${colors.pillActive} ${colors.pillActiveText} shadow-sm`
            : `text-neutral-500 ${colors.hoverText} hover:bg-neutral-200`
        }`

      case 'bordered':
        return `${base} border border-transparent -mb-px rounded-t-lg ${
          active
            ? `${colors.borderedActive} border-neutral-200 border-b-white`
            : `text-neutral-500 ${colors.hoverText} ${colors.hoverBg}`
        }`

      default:
        return base
    }
  }

  // ==================== RENDER ====================

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={tabsRef}
        className={`
          ${getContainerStyles()}
          ${scrollable ? 'overflow-x-auto scrollbar-none' : 'flex-wrap'}
        `}
        role="tablist"
      >
        {items.map((item) => {
          const buttonRef = React.createRef<HTMLButtonElement>()

          // Store ref in map
          const setRef = (el: HTMLButtonElement | null) => {
            if (el) {
              tabRefs.current.set(item.key, el)
              ;(buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
            }
          }

          return (
            <div key={item.key} className="relative">
              <button
                ref={setRef}
                role="tab"
                aria-selected={isTabActive(item)}
                aria-disabled={item.disabled}
                className={getTabStyles(item)}
                onClick={() => handleTabClick(item)}
              >
                {/* Icon */}
                {item.icon && <span className={`${sizeStyles.iconSize} flex-shrink-0`}>{item.icon}</span>}

                {/* Label */}
                <span>{item.children ? getActiveLabel(item) : item.label}</span>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`
                      ${sizeStyles.badgeSize} ${colors.badge}
                      rounded-full font-semibold leading-none min-w-[18px] text-center
                    `}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Dropdown Arrow */}
                {item.children && item.children.length > 0 && (
                  <HiChevronDown
                    className={`
                      ${sizeStyles.iconSize} flex-shrink-0 transition-transform duration-200
                      ${openDropdown === item.key ? 'rotate-180' : ''}
                    `}
                  />
                )}
              </button>

              {/* Dropdown Menu via Portal */}
              {item.children && (
                <DropdownPortalWrapper
                  itemKey={item.key}
                  tabRefs={tabRefs}
                  isOpen={openDropdown === item.key}
                  onClose={() => setOpenDropdown(null)}
                >
                  {item.children.map((subItem) => (
                    <button
                      key={subItem.key}
                      className={`
                        w-full text-left flex items-center ${sizeStyles.gap}
                        ${sizeStyles.text} ${sizeStyles.dropdownPadding}
                        transition-colors duration-150
                        ${subItem.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        ${
                          subItem.key === activeKey
                            ? `${colors.dropdownActive} font-semibold`
                            : `text-neutral-600 ${colors.dropdownHover}`
                        }
                      `}
                      onClick={() => handleSubItemClick(item.key, subItem)}
                      disabled={subItem.disabled}
                    >
                      {subItem.icon && (
                        <span className={`${sizeStyles.iconSize} flex-shrink-0`}>{subItem.icon}</span>
                      )}
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </DropdownPortalWrapper>
              )}
            </div>
          )
        })}

        {/* Animated Indicator (underline variant) */}
        {variant === 'underline' && animated && (
          <div
            className={`
              absolute bottom-0 h-[2.5px] ${colors.indicator} rounded-full
              transition-all duration-300 ease-in-out
            `}
            style={indicatorStyle}
          />
        )}
      </div>
    </div>
  )
}

// ==================== DROPDOWN PORTAL WRAPPER ====================

interface DropdownPortalWrapperProps {
  itemKey: string
  tabRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const DropdownPortalWrapper: React.FC<DropdownPortalWrapperProps> = ({
  itemKey,
  tabRefs,
  isOpen,
  onClose,
  children,
}) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    anchorRef.current = tabRefs.current.get(itemKey) || null
  }, [itemKey, tabRefs])

  return (
    <DropdownPortal
      anchorRef={anchorRef as React.RefObject<HTMLButtonElement | null>}
      isOpen={isOpen}
      onClose={onClose}
    >
      {children}
    </DropdownPortal>
  )
}

export default TabMenu
