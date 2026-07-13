import { useMemo, useState } from "react";
import AppLayout from "@/Components/Layout/AppLayout";
import DataTable from "@/Components/General/Datatable";
import FilterPanel from "@/Components/General/FilterPanel";
import DeleteModal from "@/Components/General/DeleteModal";
import { useNotification } from "@/Components/General/Notification";
import {
  useGetMembersQuery,
  useUpdateMemberStatusMutation,
  useBulkActionMembersMutation,
  useDeleteMemberMutation,
} from "@/Services/Modules/members";
import type { Member } from "@/Services/Modules/members/getMembers";
import {
  memberFilterFields,
  memberFilterDefaults,
} from "@/Config/memberFilterConfig";
import { buildMemberColumns } from "@/Components/Members/memberColumns";
import BulkActionsBar from "@/Components/Members/BulkActionsBar";

const PAGE_SIZE = 5;

export default function AdminMembersContainer() {
  const { showNotification, contextHolder } = useNotification();

  // ===== FILTER STATE =====
  // `filterInput` = nilai mentah di form, `appliedFilter` = nilai yang benar-benar dikirim ke API
  const [filterInput, setFilterInput] =
    useState<Record<string, string>>(memberFilterDefaults);
  const [appliedFilter, setAppliedFilter] =
    useState<Record<string, string>>(memberFilterDefaults);

  // ===== PAGINATION STATE =====
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);

  // ===== SELECTION STATE (untuk bulk action) =====
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // ===== PER-ROW LOADING STATE =====
  const [togglingId, setTogglingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // ===== DELETE MODAL STATE =====
  // Menggantikan window.confirm() dengan DeleteModal dari src/Components/General
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Aksi bulk yang sedang berjalan, supaya loading hanya muncul di tombol yang diklik
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "verifikasi" | "batalkan_verifikasi" | "hapus" | null
  >(null);

  const { data, isFetching } = useGetMembersQuery({
    role: "user",
    page,
    per_page: perPage,
    q: appliedFilter.q || undefined,
    start_date: appliedFilter.start_date || undefined,
    end_date: appliedFilter.end_date || undefined,
  });

  const [updateStatus] = useUpdateMemberStatusMutation();
  const [bulkAction, { isLoading: isBulkLoading }] =
    useBulkActionMembersMutation();
  const [deleteMember] = useDeleteMemberMutation();

  const items = data?.data?.items ?? [];
  const meta = data?.meta;

  // ===== FILTER HANDLERS =====
  const handleFilterChange = (key: string, value: string) => {
    setFilterInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = () => {
    setAppliedFilter(filterInput);
    setPage(1);
  };

  const handleResetFilter = () => {
    setFilterInput(memberFilterDefaults);
    setAppliedFilter(memberFilterDefaults);
    setPage(1);
  };

  // ===== SELECTION HANDLERS =====
  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedIds.includes(item.IDNumber));

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selected) => selected !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = items.map((item) => item.IDNumber);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = items.map((item) => item.IDNumber);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // ===== ROW ACTION HANDLERS =====
  const handleToggleVerify = async (member: Member) => {
    setTogglingId(member.IDNumber);
    try {
      const action = member.is_active ? "batalkan_verifikasi" : "verifikasi";
      const res = await updateStatus({
        idnumber: member.IDNumber,
        action,
      }).unwrap();
      showNotification({
        title: "Berhasil",
        description: res.message,
        type: "success",
      });
    } catch (error: any) {
      showNotification({
        title: "Gagal memperbarui status",
        description: error?.data?.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Klik tombol "Hapus" di baris tabel hanya membuka DeleteModal.
  // Proses hapus sesungguhnya dijalankan di confirmDeleteMember() saat modal dikonfirmasi.
  const handleDelete = (member: Member) => {
    setDeleteTarget(member);
  };

  const confirmDeleteMember = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.IDNumber);
    try {
      const res = await deleteMember(deleteTarget.IDNumber).unwrap();
      showNotification({
        title: "Berhasil",
        description: res.message,
        type: "success",
      });
      setSelectedIds((prev) =>
        prev.filter((id) => id !== deleteTarget.IDNumber),
      );
      setDeleteTarget(null);
    } catch (error: any) {
      showNotification({
        title: "Gagal menghapus peserta",
        description: error?.data?.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ===== BULK ACTION HANDLERS =====
  const runBulkAction = async (
    action: "verifikasi" | "batalkan_verifikasi" | "hapus",
  ) => {
    if (selectedIds.length === 0) return;

    // Validasi status: hanya bisa cek peserta terpilih yang datanya ada di halaman ini.
    const selectedMembersOnPage = items.filter((item) =>
      selectedIds.includes(item.IDNumber),
    );

    if (selectedMembersOnPage.length > 0) {
      // 1) Semua peserta terpilih harus berstatus sama (berlaku untuk verifikasi,
      //    batalkan verifikasi, MAUPUN hapus — samakan dengan logika lama).
      const firstStatus = !!selectedMembersOnPage[0].is_active;
      const allSameStatus = selectedMembersOnPage.every(
        (item) => !!item.is_active === firstStatus,
      );

      if (!allSameStatus) {
        showNotification({
          title: "Status berbeda",
          description:
            "Peserta yang dipilih memiliki status berbeda! Pilih peserta dengan status yang sama.",
          type: "warning",
        });
        return;
      }

      // 2) Cegah aksi yang tidak sesuai status (hanya relevan untuk verifikasi/batalkan).
      const allVerified = firstStatus;
      if (action === "verifikasi" && allVerified) {
        showNotification({
          title: "Tidak ada perubahan",
          description: "Semua peserta yang dipilih sudah terverifikasi.",
          type: "info",
        });
        return;
      }
      if (action === "batalkan_verifikasi" && !allVerified) {
        showNotification({
          title: "Tidak ada perubahan",
          description: "Peserta yang dipilih belum terverifikasi.",
          type: "info",
        });
        return;
      }
    }

    // Aksi hapus massal juga dikonfirmasi lewat DeleteModal, bukan window.confirm()
    if (action === "hapus") {
      setIsBulkDeleteOpen(true);
      return;
    }

    setPendingBulkAction(action);
    try {
      const res = await bulkAction({
        selected_ids: selectedIds,
        action,
      }).unwrap();
      showNotification({
        title: "Berhasil",
        description: res.message,
        type: "success",
      });
      clearSelection();
    } catch (error: any) {
      showNotification({
        title: "Gagal memproses aksi massal",
        description: error?.data?.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setPendingBulkAction(null);
    }
  };

  const confirmBulkDelete = async () => {
    setPendingBulkAction("hapus");
    try {
      const res = await bulkAction({
        selected_ids: selectedIds,
        action: "hapus",
      }).unwrap();
      showNotification({
        title: "Berhasil",
        description: res.message,
        type: "success",
      });
      clearSelection();
      setIsBulkDeleteOpen(false);
    } catch (error: any) {
      showNotification({
        title: "Gagal memproses aksi massal",
        description: error?.data?.message || "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setPendingBulkAction(null);
    }
  };

  // ===== COLUMNS =====
  const columns = useMemo(
    () =>
      buildMemberColumns({
        selectedIds,
        onToggleSelect: toggleSelect,
        onToggleSelectAll: toggleSelectAll,
        isAllSelected,
        onToggleVerify: handleToggleVerify,
        onDelete: handleDelete,
        togglingId,
        deletingId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, items, togglingId, deletingId],
  );

  // ===== PAGINATION INFO UNTUK DataTable =====
  const total = meta?.total ?? 0;
  const apiFrom = total === 0 ? 0 : (page - 1) * perPage + 1;
  const apiTo = total === 0 ? 0 : Math.min(page * perPage, total);

  return (
    <AppLayout
      title="Daftar Peserta"
      subtitle="Kelola data peserta, verifikasi akun, dan hapus data."
    >
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

        <BulkActionsBar
          selectedCount={selectedIds.length}
          onVerify={() => runBulkAction("verifikasi")}
          onUnverify={() => runBulkAction("batalkan_verifikasi")}
          onDelete={() => runBulkAction("hapus")}
          onClear={clearSelection}
          loadingAction={pendingBulkAction}
        />

        <DataTable<Member>
          data={items}
          columns={columns}
          isLoading={isFetching}
          showSearch={false}
          emptyMessage="Belum ada peserta terdaftar."
          totalData={total}
          currentPage={page}
          lastPage={meta?.total_pages || 1}
          apiFrom={apiFrom}
          apiTo={apiTo}
          onPageChange={(zeroBasedPage) => setPage(zeroBasedPage + 1)}
          onPageSizeChange={(newSize) => {
            setPerPage(newSize);
            setPage(1);
          }}
        />

        {/* Konfirmasi hapus 1 peserta */}
        <DeleteModal
          isOpen={!!deleteTarget}
          title="Hapus Peserta"
          description="Apakah Anda yakin ingin menghapus peserta berikut?"
          infoLines={[
            { label: "Nama", value: deleteTarget?.Name },
            {
              label: "ID Number",
              value: deleteTarget ? String(deleteTarget.IDNumber) : undefined,
            },
            { label: "Username", value: deleteTarget?.username },
          ]}
          isDeleting={!!deleteTarget && deletingId === deleteTarget.IDNumber}
          confirmLabel="Hapus"
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteMember}
        />

        {/* Konfirmasi hapus massal */}
        <DeleteModal
          isOpen={isBulkDeleteOpen}
          title="Hapus Peserta Terpilih"
          description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} peserta yang dipilih?`}
          infoLines={[
            { label: "", value: `${selectedIds.length} peserta terpilih` },
          ]}
          isDeleting={isBulkLoading}
          confirmLabel="Hapus Semua"
          onClose={() => setIsBulkDeleteOpen(false)}
          onConfirm={confirmBulkDelete}
        />
      </div>
    </AppLayout>
  );
}
