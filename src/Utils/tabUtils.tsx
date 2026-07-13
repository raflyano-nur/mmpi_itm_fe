/**
 * @file tabUtils.tsx
 * @description Utility untuk transformasi data menu dari API/Redux
 * menjadi format TabMenuItem yang digunakan komponen TabMenu.
 *
 * @module Utils/tabUtils
 */

import React from 'react'
import type { TabMenuItem } from '@/Components/General/TabMenu'
import Icon from '@/Components/General/Icon'

/**
 * Mencari menu yang sesuai dengan pathname saat ini.
 *
 * @param menus - Array menu dari Redux store
 * @param pathname - Pathname saat ini dari react-router
 * @returns Menu yang cocok, atau undefined jika tidak ditemukan
 */
export const findMenuByRoute = (menus: any[], pathname: string) => {
  return menus?.find((menu: any) => menu?.react_route === pathname)
}

/**
 * Mengubah data menu dari Redux store menjadi format TabMenuItem.
 * Mendukung nested menu (children/submenus).
 *
 * @param filteredMenu - Objek menu yang sudah difilter berdasarkan route
 * @returns Array TabMenuItem siap pakai untuk komponen TabMenu
 *
 * @example
 * const filteredMenu = findMenuByRoute(MenusData.menus, location.pathname)
 * const tabItems = mapMenusToTabItems(filteredMenu)
 */
export const mapMenusToTabItems = (filteredMenu: any): TabMenuItem[] => {
  if (!filteredMenu?.menus) return []

  return filteredMenu.menus.map(
    (menu: any): TabMenuItem => ({
      key: menu?.react_route,
      label: menu?.menu_name,
      icon: <Icon iconName={`${menu?.icon ?? 'ellipsis-horizontal-circle'}`} className="w-5 h-5" />,
      ...(Array.isArray(menu?.submenus) && menu.submenus.length
        ? {
            children: menu.submenus.map((submenu: any) => ({
              key: submenu?.react_route ?? submenu?.id,
              label: submenu?.name,
              icon: <Icon iconName={`${submenu?.icon ?? 'list-bullet'}`} className="w-4 h-4 text-blue-500" />,
            })),
          }
        : {}),
    }),
  )
}
