import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'

interface BulkActionsBarProps {
  selectedCount: number
  onVerify: () => void
  onUnverify: () => void
  onDelete: () => void
  onClear: () => void
  isLoading?: boolean
}

export default function BulkActionsBar({
  selectedCount,
  onVerify,
  onUnverify,
  onDelete,
  onClear,
  isLoading = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-primary-50/70 border border-primary-200 rounded-xl px-4 py-3 mb-4 animate-fadeIn">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-semibold shrink-0">
          {selectedCount}
        </span>
        <p className="text-sm font-medium text-primary-700">
          peserta dipilih
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={onVerify}
          loading={isLoading}
          icon={<Icon iconName="check" className="w-3.5 h-3.5" />}
        >
          Verifikasi
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onUnverify}
          loading={isLoading}
          icon={<Icon iconName="arrow-uturn-left" className="w-3.5 h-3.5" />}
          className="!text-neutral-600 !border-neutral-300 hover:!bg-neutral-100 hover:!border-neutral-400"
        >
          Batalkan Verifikasi
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          loading={isLoading}
          icon={<Icon iconName="trash" className="w-3.5 h-3.5" />}
          className="!text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-400"
        >
          Hapus
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isLoading}
          icon={<Icon iconName="x-mark" className="w-3.5 h-3.5" />}
          className="!text-neutral-500 hover:!text-neutral-700 hover:!bg-neutral-100"
        >
          Batal
        </Button>
      </div>
    </div>
  )
}