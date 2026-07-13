import { useMemo, useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import DataTable from '@/Components/General/Datatable'
import FilterPanel from '@/Components/General/FilterPanel'
import DeleteModal from '@/Components/General/DeleteModal'
import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'
import { useNotification } from '@/Components/General/Notification'
import {
  useGetMembersQuery,
  useUpdateMemberStatusMutation,
  useBulkActionMembersMutation,
  useDeleteMemberMutation,
} from '@/Services/Modules/members'
import type { Member } from '@/Services/Modules/members/getMembers'
import { memberFilterFields, memberFilterDefaults } from '@/Config/memberFilterConfig'
import { buildAdminColumns } from '@/Components/AdminList/adminColumns'
import AdminBulkActionsBar from '@/Components/AdminList/AdminBulkActionsBar'
import AdminFormModal from '@/Components/AdminList/AdminFormModal'

const PAGE_SIZE = 10

export default function AdminListContainer() {
  const { showNotification, contextHolder } = useNotification()

  // ===== FILTER STATE =====
  const [filterInput, setFilterInput] = useState<Record<string, string>>(memberFilterDefaults)
  const [appliedFilter, setAppliedFilter] = useState<Record<string, string>>(memberFilterDefaults)

  // ===== PAGINATION STATE =====
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGE_SIZE)

  // ===== SELECTION STATE (untuk bulk action) =====
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])

  // ===== PER-ROW LOADING STATE =====
  const [togglingId, setTogglingId] = useState<string | number | null>(null)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  // ===== DELETE MODAL STATE =====
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Aksi bulk yang sedang berjalan, supaya loading hanya muncul di tombol yang diklik
  const [pendingBulkAction, setPendingBulkAction] = useState<
    'verifikasi' | 'batalkan_verifikasi' | 'hapus' | null
  >(null)

  const { data, isFetching } = useGetMembersQuery({
    role: 'admin',
    page,
    per_page: perPage,
    q: appliedFilter.q || undefined,
    start_date: appliedFilter.start_date || undefined,
    end_date: appliedFilter.end_date || undefined,
  })

  const [updateStatus] = useUpdateMemberStatusMutation()
  const [bulkAction, { isLoading: isBulkLoading }] = useBulkActionMembersMutation()
  const [deleteMember] = useDeleteMemberMutation()

  const items = data?.data?.items ?? []
  const meta = data?.meta

  // ===== FILTER HANDLERS =====
  const handleFilterChange = (key: string, value: string) => {
    setFilterInput((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = () => {
    setAppliedFilter(filterInput)
    setPage(1)
  }

  const handleResetFilter = () => {
    setFilterInput(memberFilterDefaults)
    setAppliedFilter(memberFilterDefaults)
    setPage(1)
  }

  // ===== SELECTION HANDLERS =====
  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.IDNumber))

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selected) => selected !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = items.map((item) => item.IDNumber)
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      const pageIds = items.map((item) => item.IDNumber)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const clearSelection = () => setSelectedIds([])

  // ===== ROW ACTION HANDLERS =====
  const handleToggleActive = async (admin: Member) => {
    setTogglingId(admin.IDNumber)
    try {
      const action = admin.is_active ? 'batalkan_verifikasi' : 'verifikasi'
      const res = await updateStatus({
        idnumber: admin.IDNumber,
        action,
      }).unwrap()
      showNotification({
        title: 'Berhasil',
        description: res.message,
        type: 'success',
      })
    } catch (error: any) {
      showNotification({
        title: 'Gagal memperbarui status',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    } finally {
      setTogglingId(null)
    }
  }

  // Klik tombol "Hapus" di baris tabel hanya membuka DeleteModal.
  const handleDelete = (admin: Member) => {
    setDeleteTarget(admin)
  }

  const confirmDeleteAdmin = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.IDNumber)
    try {
      const res = await deleteMember(deleteTarget.IDNumber).unwrap()
      showNotification({
        title: 'Berhasil',
        description: res.message,
        type: 'success',
      })
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.IDNumber))
      setDeleteTarget(null)
    } catch (error: any) {
      showNotification({
        title: 'Gagal menghapus admin',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    } finally {
      setDeletingId(null)
    }
  }

  // ===== BULK ACTION HANDLERS =====
  const runBulkAction = async (action: 'verifikasi' | 'batalkan_verifikasi' | 'hapus') => {
    if (selectedIds.length === 0) return

    const selectedAdminsOnPage = items.filter((item) => selectedIds.includes(item.IDNumber))

    if (selectedAdminsOnPage.length > 0) {
      // 1) Semua admin terpilih harus berstatus sama (berlaku untuk aktifkan,
      //    nonaktifkan, maupun hapus).
      const firstStatus = !!selectedAdminsOnPage[0].is_active
      const allSameStatus = selectedAdminsOnPage.every((item) => !!item.is_active === firstStatus)

      if (!allSameStatus) {
        showNotification({
          title: 'Status berbeda',
          description: 'Admin yang dipilih memiliki status berbeda! Pilih admin dengan status yang sama.',
          type: 'warning',
        })
        return
      }

      // 2) Cegah aksi yang tidak sesuai status (hanya relevan untuk aktifkan/nonaktifkan).
      const allActive = firstStatus
      if (action === 'verifikasi' && allActive) {
        showNotification({
          title: 'Tidak ada perubahan',
          description: 'Semua admin yang dipilih sudah terverifikasi.',
          type: 'info',
        })
        return
      }
      if (action === 'batalkan_verifikasi' && !allActive) {
        showNotification({
          title: 'Tidak ada perubahan',
          description: 'Admin yang dipilih belum terverifikasi.',
          type: 'info',
        })
        return
      }
    }

    // Aksi hapus massal dikonfirmasi lewat DeleteModal
    if (action === 'hapus') {
      setIsBulkDeleteOpen(true)
      return
    }

    setPendingBulkAction(action)
    try {
      const res = await bulkAction({
        selected_ids: selectedIds,
        action,
      }).unwrap()
      showNotification({
        title: 'Berhasil',
        description: res.message,
        type: 'success',
      })
      clearSelection()
    } catch (error: any) {
      showNotification({
        title: 'Gagal memproses aksi massal',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    } finally {
      setPendingBulkAction(null)
    }
  }

  const confirmBulkDelete = async () => {
    setPendingBulkAction('hapus')
    try {
      const res = await bulkAction({
        selected_ids: selectedIds,
        action: 'hapus',
      }).unwrap()
      showNotification({
        title: 'Berhasil',
        description: res.message,
        type: 'success',
      })
      clearSelection()
      setIsBulkDeleteOpen(false)
    } catch (error: any) {
      showNotification({
        title: 'Gagal memproses aksi massal',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    } finally {
      setPendingBulkAction(null)
    }
  }

  // ===== COLUMNS =====
  const columns = useMemo(
    () =>
      buildAdminColumns({
        selectedIds,
        onToggleSelect: toggleSelect,
        onToggleSelectAll: toggleSelectAll,
        isAllSelected,
        onToggleActive: handleToggleActive,
        onDelete: handleDelete,
        togglingId,
        deletingId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, items, togglingId, deletingId],
  )

  // ===== PAGINATION INFO UNTUK DataTable =====
  const total = meta?.total ?? 0
  const apiFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const apiTo = total === 0 ? 0 : Math.min(page * perPage, total)

  return (
    <AppLayout title="Daftar Admin" subtitle="Kelola data admin sistem, aktivasi akun, dan hapus data.">
      <div className="p-4 md:p-6">
        {contextHolder}

        <FilterPanel
          filters={memberFilterFields}
          values={filterInput}
          onChange={handleFilterChange}
          onReset={handleResetFilter}
          onApply={handleApplyFilter}
          isLoading={isFetching}
        />

        <div className="mb-4 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            icon={<Icon iconName="plus" className="w-4 h-4" />}
          >
            Tambah Admin
          </Button>
        </div>

        <AdminBulkActionsBar
          selectedCount={selectedIds.length}
          onActivate={() => runBulkAction('verifikasi')}
          onDeactivate={() => runBulkAction('batalkan_verifikasi')}
          onDelete={() => runBulkAction('hapus')}
          onClear={clearSelection}
          loadingAction={pendingBulkAction}
        />

        <DataTable<Member>
          data={items}
          columns={columns}
          isLoading={isFetching}
          showSearch={false}
          emptyMessage="Belum ada admin terdaftar."
          totalData={total}
          currentPage={page}
          lastPage={meta?.total_pages || 1}
          apiFrom={apiFrom}
          apiTo={apiTo}
          onPageChange={(zeroBasedPage) => setPage(zeroBasedPage + 1)}
          onPageSizeChange={(newSize) => {
            setPerPage(newSize)
            setPage(1)
          }}
        />

        {/* Konfirmasi hapus 1 admin */}
        <DeleteModal
          isOpen={!!deleteTarget}
          title="Hapus Admin"
          description="Apakah Anda yakin ingin menghapus admin berikut?"
          infoLines={[
            { label: 'Nama', value: deleteTarget?.Name },
            {
              label: 'ID Number',
              value: deleteTarget ? String(deleteTarget.IDNumber) : undefined,
            },
            { label: 'Username', value: deleteTarget?.username },
          ]}
          isDeleting={!!deleteTarget && deletingId === deleteTarget.IDNumber}
          confirmLabel="Hapus"
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteAdmin}
        />

        {/* Konfirmasi hapus massal */}
        <DeleteModal
          isOpen={isBulkDeleteOpen}
          title="Hapus Admin Terpilih"
          description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} admin yang dipilih?`}
          infoLines={[{ label: '', value: `${selectedIds.length} admin terpilih` }]}
          isDeleting={isBulkLoading}
          confirmLabel="Hapus Semua"
          onClose={() => setIsBulkDeleteOpen(false)}
          onConfirm={confirmBulkDelete}
        />

        <AdminFormModal
          isOpen={isCreateOpen}
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            clearSelection()
            setPage(1)
          }}
        />
      </div>
    </AppLayout>
  )
}
