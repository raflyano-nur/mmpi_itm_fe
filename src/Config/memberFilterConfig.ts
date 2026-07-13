import type { FilterFieldConfig } from '@/Config/columnMap'

export const memberFilterFields: FilterFieldConfig[] = [
  {
    key: 'q',
    label: 'Cari Peserta',
    type: 'text',
    placeholder: 'Nama / ID Number / Username',
  },
  {
    key: 'start_date',
    label: 'Tgl Daftar Dari',
    type: 'date',
  },
  {
    key: 'end_date',
    label: 'Tgl Daftar Sampai',
    type: 'date',
  },
]

export const memberFilterDefaults: Record<string, string> = {
  q: '',
  start_date: '',
  end_date: '',
}
