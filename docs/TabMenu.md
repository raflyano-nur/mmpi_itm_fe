# 🗂️ TabMenu — Dokumentasi Komponen Tab Menu

> Komponen tab menu reusable untuk navigasi horizontal dengan dukungan klik langsung, dropdown sub-menu, animated indicator, badge, dan multiple visual variant.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [Komponen: TabMenu](#komponen-tabmenu)
- [Types & Interface](#types--interface)
- [Props Reference](#props-reference)
- [Variant](#variant)
- [Color Scheme](#color-scheme)
- [Size](#size)
- [Fitur Dropdown](#fitur-dropdown)
- [Fitur Badge](#fitur-badge)
- [Animated Indicator](#animated-indicator)
- [Design System & Warna](#design-system--warna)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Kustomisasi](#kustomisasi)
- [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                      Parent Component                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    TabMenu                              │  │
│  │  ┌──────────┐ ┌──────────────┐ ┌────────┐ ┌────────┐  │  │
│  │  │ Tab Item │ │ Tab + Dropdown│ │Tab Item│ │Tab+Badge│  │  │
│  │  │ (klik)   │ │  ▼ Sub Items │ │ (klik) │ │  (3)   │  │  │
│  │  └──────────┘ └──────┬───────┘ └────────┘ └────────┘  │  │
│  │                      │                                  │  │
│  │  ════════════════════╪══════════════════════════════════│  │
│  │  ▓▓▓▓▓▓▓▓▓▓ (animated indicator)                       │  │
│  └──────────────────────┼──────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │           DropdownPortal (via createPortal)              │  │
│  │  ┌────────────────────────────────┐                     │  │
│  │  │  ○ Daftar User                 │                     │  │
│  │  │  ● Role & Jabatan  (active)    │                     │  │
│  │  │  ○ Grup User                   │                     │  │
│  │  └────────────────────────────────┘                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Tab Content (rendered by parent)            │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Interaksi

```
User klik Tab biasa
    │
    ▼
onChange(key)  →  Parent update activeKey  →  UI update indicator + content

User klik Tab dengan dropdown
    │
    ▼
Dropdown terbuka (Portal ke document.body)
    │
    ▼
User pilih sub-item
    │
    ▼
onChange(subKey, parentKey)  →  Parent update activeKey  →  Label tab berubah + content update
```

---

## File & Struktur

| File                                       | Deskripsi                         |
| ------------------------------------------ | --------------------------------- |
| `src/Components/General/TabMenu.tsx`       | Komponen utama TabMenu (reusable) |
| `src/Components/index.ts`                  | Export barrel (termasuk TabMenu)  |
| `src/Components/Setting/MainSetting.tsx`   | Contoh implementasi TabMenu       |
| `src/Components/Setting/SettingLayout.tsx` | Layout wrapper halaman Pengaturan |

---

## Quick Start

Contoh paling sederhana untuk menampilkan tab menu:

```tsx
import React, { useState } from 'react'
import TabMenu, { type TabMenuItem } from '@/Components/General/TabMenu'

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('tab1')

  const items: TabMenuItem[] = [
    { key: 'tab1', label: 'Tab Pertama' },
    { key: 'tab2', label: 'Tab Kedua' },
    { key: 'tab3', label: 'Tab Ketiga' },
  ]

  return (
    <div>
      <TabMenu items={items} activeKey={activeTab} onChange={(key) => setActiveTab(key)} />

      {/* Render content berdasarkan activeTab */}
      {activeTab === 'tab1' && <div>Konten Tab 1</div>}
      {activeTab === 'tab2' && <div>Konten Tab 2</div>}
      {activeTab === 'tab3' && <div>Konten Tab 3</div>}
    </div>
  )
}
```

---

## Komponen: TabMenu

### Fitur

| Fitur                      | Deskripsi                                                         |
| -------------------------- | ----------------------------------------------------------------- |
| 🖱️ Klik Langsung           | Tab biasa langsung aktif saat diklik                              |
| 📂 Dropdown                | Tab dengan `children` menampilkan dropdown sub-menu               |
| 🎯 Animated Indicator      | Underline bergerak smooth antar tab (variant `underline`)         |
| 🔢 Badge                   | Menampilkan badge count pada tab (notifikasi, dll)                |
| 🎨 3 Variant               | `underline`, `pill`, `bordered`                                   |
| 🎨 3 Color Scheme          | `primary`, `secondary`, `neutral`                                 |
| 📏 3 Size                  | `sm`, `md`, `lg`                                                  |
| 🖼️ Icon Support            | Setiap tab/sub-item bisa memiliki icon (react-icons, dll)         |
| 📱 Responsive              | Horizontal scroll otomatis pada layar kecil                       |
| ♿ Accessible              | `role="tablist"`, `aria-selected`, `aria-disabled`                |
| 🔄 Controlled/Uncontrolled | Mendukung kedua mode state management                             |
| 🌀 Portal Dropdown         | Dropdown menggunakan `createPortal` agar tidak terpotong overflow |
| 🚫 Disabled State          | Tab dan sub-item bisa di-disable                                  |
| 🏷️ Dynamic Label           | Label tab dropdown berubah sesuai sub-item yang aktif             |

---

## Types & Interface

### TabMenuItem

```tsx
interface TabMenuItem {
  key: string // Unique identifier
  label: string // Display label
  icon?: React.ReactNode // Optional icon (react-icons, SVG, dll)
  children?: TabMenuSubItem[] // Sub-items untuk dropdown
  disabled?: boolean // Disabled state
  badge?: number // Badge count
}
```

### TabMenuSubItem

```tsx
interface TabMenuSubItem {
  key: string // Unique identifier
  label: string // Display label
  icon?: React.ReactNode // Optional icon
  disabled?: boolean // Disabled state
}
```

### TabMenuVariant

```tsx
type TabMenuVariant = 'underline' | 'pill' | 'bordered'
```

### TabMenuSize

```tsx
type TabMenuSize = 'sm' | 'md' | 'lg'
```

### TabMenuColorScheme

```tsx
type TabMenuColorScheme = 'primary' | 'secondary' | 'neutral'
```

---

## Props Reference

| Prop               | Tipe                                        | Default        | Wajib | Deskripsi                          |
| ------------------ | ------------------------------------------- | -------------- | ----- | ---------------------------------- |
| `items`            | `TabMenuItem[]`                             | -              | ✅    | Array menu items                   |
| `activeKey`        | `string`                                    | -              | ❌    | Tab aktif (controlled mode)        |
| `defaultActiveKey` | `string`                                    | `items[0].key` | ❌    | Tab aktif awal (uncontrolled mode) |
| `onChange`         | `(key: string, parentKey?: string) => void` | -              | ❌    | Callback saat tab berubah          |
| `variant`          | `'underline' \| 'pill' \| 'bordered'`       | `'underline'`  | ❌    | Visual variant                     |
| `size`             | `'sm' \| 'md' \| 'lg'`                      | `'md'`         | ❌    | Ukuran tab                         |
| `colorScheme`      | `'primary' \| 'secondary' \| 'neutral'`     | `'primary'`    | ❌    | Skema warna                        |
| `fullWidth`        | `boolean`                                   | `false`        | ❌    | Tab mengisi penuh lebar container  |
| `className`        | `string`                                    | `''`           | ❌    | Custom className untuk container   |
| `tabClassName`     | `string`                                    | `''`           | ❌    | Custom className untuk setiap tab  |
| `animated`         | `boolean`                                   | `true`         | ❌    | Animated underline indicator       |
| `scrollable`       | `boolean`                                   | `true`         | ❌    | Horizontal scroll saat overflow    |

### onChange Callback

```tsx
// Tab biasa (tanpa dropdown)
onChange(key: string)
// Contoh: onChange('main-setting')

// Sub-item dari dropdown
onChange(key: string, parentKey: string)
// Contoh: onChange('user-roles', 'user-management')
```

---

## Variant

### 1. Underline (Default)

Tab dengan garis bawah animated yang bergerak ke tab aktif.

```tsx
<TabMenu items={items} variant="underline" />
```

```
┌──────────────────────────────────────────────┐
│  Main Setting   User Management ▾   Hak Akses│
│  ═══════════                                  │
│  ▓▓▓▓▓▓▓▓▓▓▓ (animated indicator)            │
└──────────────────────────────────────────────┘
```

### 2. Pill

Tab dengan background rounded seperti pill/capsule.

```tsx
<TabMenu items={items} variant="pill" />
```

```
┌──────────────────────────────────────────────┐
│ ┌───────────────┐                             │
│ │ Main Setting  │  User Management   Hak Akses│
│ └───────────────┘  (bg rounded pill)          │
└──────────────────────────────────────────────┘
```

### 3. Bordered

Tab dengan border atas dan samping, mirip browser tab.

```tsx
<TabMenu items={items} variant="bordered" />
```

```
┌──────────────┐
│ Main Setting │  User Management   Hak Akses
├──────────────┴───────────────────────────────┤
```

---

## Color Scheme

### Primary (Default)

Menggunakan warna `primary-*` dari theme (`#0196fe` base).

```tsx
<TabMenu items={items} colorScheme="primary" />
```

| State     | Warna                          |
| --------- | ------------------------------ |
| Active    | `text-primary-600` (`#017fd6`) |
| Hover     | `bg-primary-50` (`#e6f4ff`)    |
| Indicator | `bg-primary-500` (`#0196fe`)   |
| Badge     | `bg-primary-500 text-white`    |

### Secondary

Menggunakan warna `secondary-*` dari theme (`#fe7f01` base).

```tsx
<TabMenu items={items} colorScheme="secondary" />
```

| State     | Warna                            |
| --------- | -------------------------------- |
| Active    | `text-secondary-600` (`#d66b01`) |
| Hover     | `bg-secondary-50` (`#fff4e6`)    |
| Indicator | `bg-secondary-500` (`#fe7f01`)   |
| Badge     | `bg-secondary-500 text-white`    |

### Neutral

Menggunakan warna `neutral-*` dari theme (grayscale).

```tsx
<TabMenu items={items} colorScheme="neutral" />
```

| State     | Warna                          |
| --------- | ------------------------------ |
| Active    | `text-neutral-800` (`#222536`) |
| Hover     | `bg-neutral-100` (`#eef0f7`)   |
| Indicator | `bg-neutral-700` (`#363a52`)   |
| Badge     | `bg-neutral-600 text-white`    |

---

## Size

### Small (`sm`)

```tsx
<TabMenu items={items} size="sm" />
```

| Property | Value                |
| -------- | -------------------- |
| Font     | `text-xs`            |
| Padding  | `px-3 py-1.5`        |
| Icon     | `text-sm`            |
| Badge    | `text-[10px] px-1.5` |

### Medium (`md`) — Default

```tsx
<TabMenu items={items} size="md" />
```

| Property | Value              |
| -------- | ------------------ |
| Font     | `text-sm`          |
| Padding  | `px-4 py-2.5`      |
| Icon     | `text-base`        |
| Badge    | `text-[11px] px-2` |

### Large (`lg`)

```tsx
<TabMenu items={items} size="lg" />
```

| Property | Value          |
| -------- | -------------- |
| Font     | `text-base`    |
| Padding  | `px-5 py-3`    |
| Icon     | `text-lg`      |
| Badge    | `text-xs px-2` |

---

## Fitur Dropdown

Tab yang memiliki property `children` akan otomatis menjadi dropdown.

### Definisi

```tsx
const items: TabMenuItem[] = [
  {
    key: 'user-management',
    label: 'User Management',
    icon: <HiUserGroup />,
    children: [
      { key: 'user-list', label: 'Daftar User' },
      { key: 'user-roles', label: 'Role & Jabatan' },
      { key: 'user-groups', label: 'Grup User' },
    ],
  },
]
```

### Perilaku

1. **Klik tab** → Dropdown terbuka/tertutup (toggle)
2. **Klik sub-item** → Tab aktif berubah, dropdown tertutup
3. **Label dinamis** → Label tab berubah sesuai sub-item yang aktif
4. **Arrow indicator** → Chevron berputar 180° saat dropdown terbuka
5. **Click outside** → Dropdown otomatis tertutup
6. **Portal rendering** → Dropdown di-render via `createPortal` ke `document.body` agar tidak terpotong oleh parent `overflow-hidden`

### Sub-item dengan Icon

```tsx
children: [
  { key: 'user-list', label: 'Daftar User', icon: <HiUsers /> },
  { key: 'user-roles', label: 'Role & Jabatan', icon: <HiShieldCheck /> },
  { key: 'user-groups', label: 'Grup User', icon: <HiUserGroup /> },
]
```

### Disabled Sub-item

```tsx
children: [
  { key: 'user-list', label: 'Daftar User' },
  { key: 'user-roles', label: 'Role & Jabatan', disabled: true },
]
```

---

## Fitur Badge

Menampilkan badge count pada tab, cocok untuk notifikasi atau counter.

```tsx
const items: TabMenuItem[] = [
  {
    key: 'notifications',
    label: 'Notifikasi',
    icon: <HiBell />,
    badge: 3, // Tampilkan badge "3"
  },
  {
    key: 'messages',
    label: 'Pesan',
    badge: 150, // Tampilkan badge "99+" (max 99)
  },
]
```

### Aturan Badge

- Badge hanya tampil jika `badge > 0`
- Nilai di atas 99 ditampilkan sebagai `99+`
- Warna badge mengikuti `colorScheme`

---

## Animated Indicator

Underline indicator yang bergerak smooth antar tab (hanya untuk variant `underline`).

### Mengaktifkan

```tsx
<TabMenu variant="underline" animated={true} />
```

### Menonaktifkan

```tsx
<TabMenu variant="underline" animated={false} />
```

### Cara Kerja

1. Menggunakan `getBoundingClientRect()` untuk menghitung posisi tab aktif
2. Indicator diposisikan dengan `position: absolute` + `left` dan `width`
3. Transisi menggunakan `transition-all duration-300 ease-in-out`
4. Auto-update saat window resize
5. Untuk tab dropdown, indicator mengikuti parent tab meskipun sub-item yang aktif

---

## Design System & Warna

Semua warna menggunakan **design token** dari `src/index.css` agar konsisten dengan seluruh aplikasi.

### Palet Warna yang Digunakan

| Token           | Hex       | Penggunaan                            |
| --------------- | --------- | ------------------------------------- |
| `primary-50`    | `#e6f4ff` | Hover background, dropdown active bg  |
| `primary-500`   | `#0196fe` | Indicator, pill active bg, badge      |
| `primary-600`   | `#017fd6` | Active text color                     |
| `primary-700`   | `#0165ac` | Active text (hover)                   |
| `secondary-50`  | `#fff4e6` | Hover background (secondary scheme)   |
| `secondary-500` | `#fe7f01` | Indicator, pill active (secondary)    |
| `secondary-600` | `#d66b01` | Active text (secondary)               |
| `neutral-100`   | `#eef0f7` | Pill container bg, hover bg (neutral) |
| `neutral-200`   | `#d9ddef` | Border, separator                     |
| `neutral-500`   | `#6b7092` | Inactive tab text                     |
| `neutral-600`   | `#4f5370` | Dropdown item text                    |
| `neutral-700`   | `#363a52` | Indicator (neutral scheme)            |
| `neutral-800`   | `#222536` | Active text (neutral scheme)          |

### Prinsip Desain

- **Minimalis** — Clean layout tanpa elemen dekoratif berlebihan
- **Modern** — Rounded corners, smooth transitions, subtle shadows
- **Responsive** — Horizontal scroll pada layar kecil, flex-wrap opsional
- **Accessible** — ARIA attributes, keyboard-friendly, focus states
- **Consistent** — Semua warna dari design token `@theme`

---

## Contoh Penggunaan

### 1. Basic — Tab Sederhana

```tsx
import TabMenu, { type TabMenuItem } from '@/Components/General/TabMenu'

const items: TabMenuItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'reports', label: 'Reports' },
]

<TabMenu items={items} onChange={(key) => console.log(key)} />
```

### 2. Dengan Icon

```tsx
import { HiHome, HiChartBar, HiDocumentText } from 'react-icons/hi2'

const items: TabMenuItem[] = [
  { key: 'overview', label: 'Overview', icon: <HiHome /> },
  { key: 'analytics', label: 'Analytics', icon: <HiChartBar /> },
  { key: 'reports', label: 'Reports', icon: <HiDocumentText /> },
]

<TabMenu items={items} activeKey={activeTab} onChange={setActiveTab} />
```

### 3. Dengan Dropdown

```tsx
const items: TabMenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'general', label: 'General' },
      { key: 'security', label: 'Security' },
      { key: 'notifications', label: 'Notifications' },
    ],
  },
  { key: 'help', label: 'Help' },
]

<TabMenu
  items={items}
  activeKey={activeTab}
  onChange={(key, parentKey) => {
    setActiveTab(key)
    if (parentKey) console.log(`Sub-item dari: ${parentKey}`)
  }}
/>
```

### 4. Pill Variant + Secondary Color

```tsx
<TabMenu items={items} variant="pill" colorScheme="secondary" size="sm" />
```

### 5. Bordered Variant + Full Width

```tsx
<TabMenu items={items} variant="bordered" fullWidth colorScheme="neutral" />
```

### 6. Dengan Badge

```tsx
const items: TabMenuItem[] = [
  { key: 'inbox', label: 'Inbox', badge: 12 },
  { key: 'sent', label: 'Sent' },
  { key: 'drafts', label: 'Drafts', badge: 3 },
  { key: 'trash', label: 'Trash' },
]

<TabMenu items={items} activeKey={activeTab} onChange={setActiveTab} />
```

### 7. Disabled Tab

```tsx
const items: TabMenuItem[] = [
  { key: 'active', label: 'Active' },
  { key: 'coming-soon', label: 'Coming Soon', disabled: true },
  { key: 'archive', label: 'Archive' },
]

<TabMenu items={items} activeKey={activeTab} onChange={setActiveTab} />
```

### 8. Uncontrolled Mode

```tsx
// Tanpa activeKey — state dikelola internal
<TabMenu items={items} defaultActiveKey="analytics" onChange={(key) => console.log('Tab changed:', key)} />
```

### 9. Custom Styling

```tsx
<TabMenu
  items={items}
  className="bg-white rounded-lg shadow-sm px-2"
  tabClassName="mx-1"
  activeKey={activeTab}
  onChange={setActiveTab}
/>
```

### 10. Implementasi Lengkap (Halaman Pengaturan)

```tsx
import React, { useState } from 'react'
import TabMenu, { type TabMenuItem } from '@/Components/General/TabMenu'
import { HiCog6Tooth, HiUserGroup, HiShieldCheck, HiKey, HiBell } from 'react-icons/hi2'

const MainSetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('main-setting')

  const tabItems: TabMenuItem[] = [
    {
      key: 'main-setting',
      label: 'Main Setting',
      icon: <HiCog6Tooth />,
    },
    {
      key: 'user-management',
      label: 'User Management',
      icon: <HiUserGroup />,
      children: [
        { key: 'user-list', label: 'Daftar User' },
        { key: 'user-roles', label: 'Role & Jabatan' },
        { key: 'user-groups', label: 'Grup User' },
      ],
    },
    {
      key: 'permissions',
      label: 'Hak Akses',
      icon: <HiShieldCheck />,
    },
    {
      key: 'security',
      label: 'Keamanan',
      icon: <HiKey />,
    },
    {
      key: 'notifications',
      label: 'Notifikasi',
      icon: <HiBell />,
      badge: 3,
    },
  ]

  return (
    <div className="w-full">
      <TabMenu
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        variant="underline"
        size="md"
        colorScheme="primary"
        animated
      />

      <div className="mt-6">
        {activeTab === 'main-setting' && <div>Konten Main Setting</div>}
        {activeTab === 'user-list' && <div>Konten Daftar User</div>}
        {activeTab === 'user-roles' && <div>Konten Role & Jabatan</div>}
        {/* ... dst */}
      </div>
    </div>
  )
}
```

---

## Kustomisasi

### Menambah Variant Baru

Edit `TabMenu.tsx`, tambahkan di `TabMenuVariant` type dan implementasi di `getContainerStyles()` serta `getTabStyles()`:

```tsx
// 1. Tambah type
export type TabMenuVariant = 'underline' | 'pill' | 'bordered' | 'minimal'

// 2. Tambah container style
case 'minimal':
  return `${base}`

// 3. Tambah tab style
case 'minimal':
  return `${base} ${
    active ? `${colors.active} font-semibold` : `text-neutral-400`
  }`
```

### Menambah Color Scheme Baru

Tambahkan entry baru di `colorMap`:

```tsx
const colorMap = {
  // ... existing schemes
  success: {
    active: 'text-emerald-600',
    activeText: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-50',
    hoverText: 'hover:text-emerald-600',
    indicator: 'bg-emerald-500',
    pillActive: 'bg-emerald-500',
    pillActiveText: 'text-white',
    borderedActive: 'border-emerald-500 bg-white',
    badge: 'bg-emerald-500 text-white',
    dropdownHover: 'hover:bg-emerald-50',
    dropdownActive: 'bg-emerald-50 text-emerald-600',
  },
}
```

### Mengubah Animasi Indicator

Edit style indicator di render section:

```tsx
{
  /* Ubah durasi dan easing */
}
;<div
  className={`
    absolute bottom-0 h-[3px] ${colors.indicator} rounded-full
    transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
  `}
  style={indicatorStyle}
/>
```

### Mengubah Dropdown Style

Edit `DropdownPortal` component:

```tsx
<div
  className="
    fixed z-[9999]
    min-w-[200px] bg-white rounded-xl shadow-2xl
    border border-neutral-100
    py-2 animate-fadeIn
    backdrop-blur-sm
  "
>
```

---

## FAQ & Troubleshooting

### Q: Dropdown tidak muncul / terpotong?

**A:** TabMenu menggunakan `createPortal` untuk render dropdown ke `document.body`. Pastikan:

- Tidak ada CSS global yang meng-override `z-index` di atas `9999`
- `document.body` accessible (bukan di iframe)

### Q: Animated indicator tidak bergerak?

**A:** Pastikan:

- `variant="underline"` (indicator hanya untuk variant underline)
- `animated={true}` (default sudah `true`)
- Tab container tidak di-hide/display-none saat render

### Q: Bagaimana cara menggunakan tanpa state management (uncontrolled)?

**A:** Jangan berikan prop `activeKey`, gunakan `defaultActiveKey`:

```tsx
<TabMenu items={items} defaultActiveKey="tab1" onChange={(key) => console.log(key)} />
```

### Q: Label dropdown tidak berubah saat sub-item dipilih?

**A:** Pastikan `activeKey` yang diberikan adalah key dari sub-item, bukan parent. Contoh:

```tsx
// ✅ Benar — activeKey = sub-item key
activeKey = 'user-roles'

// ❌ Salah — activeKey = parent key (label tidak berubah)
activeKey = 'user-management'
```

### Q: Bagaimana menambah divider di dropdown?

**A:** Saat ini belum didukung secara native. Workaround: tambahkan sub-item dengan `disabled: true` dan label berupa garis:

```tsx
children: [
  { key: 'item1', label: 'Item 1' },
  { key: 'divider', label: '───────────', disabled: true },
  { key: 'item2', label: 'Item 2' },
]
```

### Q: Apakah mendukung keyboard navigation?

**A:** Saat ini mendukung `aria-selected` dan `aria-disabled` untuk screen reader. Full keyboard navigation (Arrow keys, Enter, Escape) bisa ditambahkan di versi berikutnya.

---

## Referensi Import

```tsx
// Import component
import TabMenu from '@/Components/General/TabMenu'

// Import dari barrel export
import { TabMenu } from '@/Components'

// Import types
import type {
  TabMenuItem,
  TabMenuSubItem,
  TabMenuProps,
  TabMenuVariant,
  TabMenuSize,
  TabMenuColorScheme,
} from '@/Components/General/TabMenu'
```
