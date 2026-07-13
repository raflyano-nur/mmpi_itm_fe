import React from 'react'
import { HiUserGroup, HiCheckCircle, HiClock, HiClipboardDocumentList } from 'react-icons/hi2'

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
}

interface RecentMember {
  id: string | number
  name: string
  status: string
  date: string
}

interface AdminDashboardViewProps {
  adminName?: string
  stats: StatCard[]
  recentMembers: RecentMember[]
  isLoading?: boolean
  onViewAllMembers: () => void
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Terverifikasi: 'bg-green-100 text-green-700',
    'Belum Verifikasi': 'bg-yellow-100 text-yellow-700',
    Nonaktif: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminName,
  stats,
  recentMembers,
  isLoading = false,
  onViewAllMembers,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Halo Admin, {adminName || '...'} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Berikut ringkasan aktivitas MMPI-2 hari ini.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`${stat.bgColor} p-3 rounded-lg flex-shrink-0`}>{stat.icon}</div>
            <div className="min-w-0">
              {isLoading ? (
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              )}
              <p className="text-sm text-gray-500 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Peserta Terbaru</h2>
          <button onClick={onViewAllMembers} className="text-sm text-primary hover:underline">
            Lihat semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">ID Number</th>
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : recentMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-400">
                    Belum ada data peserta.
                  </td>
                </tr>
              ) : (
                recentMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">{m.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{m.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardView