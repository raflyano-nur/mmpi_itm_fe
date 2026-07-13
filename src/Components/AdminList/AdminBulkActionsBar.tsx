import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'

type BulkAction = 'verifikasi' | 'batalkan_verifikasi' | 'hapus'

interface AdminBulkActionsBarProps {
  selectedCount: number
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
  onClear: () => void
  /** Aksi yang sedang diproses. Hanya tombol terkait yang akan menampilkan loading. */
  loadingAction?: BulkAction | null
}

export default function AdminBulkActionsBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
  loadingAction = null,
}: AdminBulkActionsBarProps) {
  if (selectedCount === 0) return null

  const isBusy = loadingAction !== null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-primary-50/70 border border-primary-200 rounded-xl px-4 py-3 mb-4 animate-fadeIn">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-semibold shrink-0">
          {selectedCount}
        </span>
        <p className="text-sm font-medium text-primary-700">admin dipilih</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={onActivate}
          loading={loadingAction === 'verifikasi'}
          disabled={isBusy && loadingAction !== 'verifikasi'}
          icon={<Icon iconName="check" className="w-3.5 h-3.5" />}
        >
          Verifikasi
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDeactivate}
          loading={loadingAction === 'batalkan_verifikasi'}
          disabled={isBusy && loadingAction !== 'batalkan_verifikasi'}
          icon={<Icon iconName="arrow-uturn-left" className="w-3.5 h-3.5" />}
          className="!text-neutral-600 !border-neutral-300 hover:!bg-neutral-100 hover:!border-neutral-400"
        >
          Batalkan Verifikasi
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          loading={loadingAction === 'hapus'}
          disabled={isBusy && loadingAction !== 'hapus'}
          icon={<Icon iconName="trash" className="w-3.5 h-3.5" />}
          className="!text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-400"
        >
          Hapus
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isBusy}
          icon={<Icon iconName="x-mark" className="w-3.5 h-3.5" />}
          className="!text-neutral-500 hover:!text-neutral-700 hover:!bg-neutral-100"
        >
          Batal
        </Button>
      </div>
    </div>
  )
}
