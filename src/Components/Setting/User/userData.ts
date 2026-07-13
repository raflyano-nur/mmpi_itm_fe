import { UserItem } from './types'

export const dummyUserData: any[] = [
  {
    id: '1',
    name: 'Budi Santoso', // ← pakai 'name' bukan 'nama'
    username: 'budi.s',
    email: 'budi@rsudwonosari.go.id',
    role: 'admin',
    institutionId: 'INS-001',
    institutionName: 'RSUD Wonosari',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Siti Aminah',
    username: 'siti.a',
    email: 'siti@rsudwonosari.go.id',
    role: 'it',
    institutionId: 'INS-001',
    institutionName: 'RSUD Wonosari',
    status: 'active',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Super Admin',
    username: 'super.admin',
    email: 'super@admin.go.id',
    role: 'super_admin',
    institutionId: 'INS-001',
    institutionName: 'RSUD Wonosari',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]
