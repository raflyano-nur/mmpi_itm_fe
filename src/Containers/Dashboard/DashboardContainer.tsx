import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '@/Components/Layout/AppLayout'
import { UserDashboardView, AdminDashboardView } from '@/Components'
import { useMeQuery } from '@/Services/Modules/auth'
import { useGetDashboardSummaryQuery } from '@/Services/Modules/dashboard'
import { HiUserGroup, HiCheckCircle, HiClock, HiClipboardDocumentList } from 'react-icons/hi2'

const DashboardContainer = () => {
  const navigate = useNavigate()
  const { data: meData } = useMeQuery()
  const user = meData?.data?.user
  const isAdmin = user?.role === 'admin'

  // ─── State untuk User Dashboard ───
  const [testPurpose, setTestPurpose] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isSubmittingTest, setIsSubmittingTest] = useState(false)

  const handleStartTest = async () => {
    setIsSubmittingTest(true)
    try {
      console.log('Starting test with purpose:', testPurpose)
      navigate(`/test/${user?.IDNumber}/1`)
    } finally {
      setIsSubmittingTest(false)
    }
  }

  // ─── Data Summary Admin — dari backend, bukan hardcode ───
  const { data: summaryData, isLoading: isSummaryLoading } = useGetDashboardSummaryQuery(undefined, {
    skip: !isAdmin,
  })

  const rawStats = summaryData?.data?.stats
  const stats = [
    {
      label: 'Total Peserta',
      value: rawStats?.total_peserta ?? 0,
      icon: <HiUserGroup size={22} className="text-white" />,
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Tes Selesai',
      value: rawStats?.tes_selesai ?? 0,
      icon: <HiCheckCircle size={22} className="text-white" />,
      bgColor: 'bg-green-500',
    },
    {
      label: 'Belum Verifikasi',
      value: rawStats?.belum_verifikasi ?? 0,
      icon: <HiClock size={22} className="text-white" />,
      bgColor: 'bg-yellow-500',
    },
    {
      label: 'Total Laporan',
      value: rawStats?.total_laporan ?? 0,
      icon: <HiClipboardDocumentList size={22} className="text-white" />,
      bgColor: 'bg-purple-500',
    },
  ]

  const recentMembers = summaryData?.data?.recent_members ?? []

  return (
    <AppLayout
      title={isAdmin ? 'Dashboard Admin' : 'Dashboard'}
      subtitle={isAdmin ? `Halo Admin, ${user?.Name || ''}!` : 'Selamat datang kembali'}
    >
      {isAdmin ? (
        <AdminDashboardView
          adminName={user?.Name}
          stats={stats}
          recentMembers={recentMembers}
          isLoading={isSummaryLoading}
          onViewAllMembers={() => navigate('/admin/members')}
        />
      ) : (
        <UserDashboardView
          userName={user?.Name}
          userId={user?.IDNumber}
          testPurpose={testPurpose}
          agreed={agreed}
          isSubmitting={isSubmittingTest}
          onTestPurposeChange={setTestPurpose}
          onAgreedChange={setAgreed}
          onSubmit={handleStartTest}
          onNavigateProfile={() => navigate('/profile')}
          onNavigateTestInfo={() => navigate('/test/info')}
        />
      )}
    </AppLayout>
  )
}

export default DashboardContainer