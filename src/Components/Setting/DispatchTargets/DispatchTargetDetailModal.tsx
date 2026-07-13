import React from 'react'
import {
  HiArrowTopRightOnSquare,
  HiBolt,
  HiKey,
  HiLockClosed,
  HiShieldCheck,
  HiXMark,
} from 'react-icons/hi2'
import {
  DISPATCH_TARGET_AUTH_META,
  formatDispatchTargetDateTime,
  maskSecretValue,
  type DispatchTargetItem,
} from './types'

interface DispatchTargetDetailModalProps {
  isOpen: boolean
  item?: DispatchTargetItem | null
  isLoading?: boolean
  canUpdate?: boolean
  onClose: () => void
  onEdit: () => void
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-lg border border-neutral-100 bg-neutral-50/60 p-3">
    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
    <div className="mt-1 text-sm text-neutral-700 break-all">{value}</div>
  </div>
)

const DispatchTargetDetailModal: React.FC<DispatchTargetDetailModalProps> = ({
  isOpen,
  item,
  isLoading = false,
  canUpdate = false,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null

  const authMeta = item ? DISPATCH_TARGET_AUTH_META[item.auth_type] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 animate-fadeIn overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <HiBolt className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Detail Dispatch Target</h2>
              <p className="text-xs text-neutral-400">
                {item?.name || 'Memuat data target pengiriman'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading && !item ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-neutral-500">Memuat detail dispatch target...</p>
            </div>
          ) : item && authMeta ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50 via-white to-amber-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${authMeta.badgeClassName}`}>
                      <HiShieldCheck className="w-3.5 h-3.5" />
                      {authMeta.label}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-neutral-500">
                        {item.description || 'Tidak ada deskripsi tambahan untuk target ini.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Buka endpoint
                    <HiArrowTopRightOnSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="Endpoint URL" value={item.url} />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        item.deleted_at
                          ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          : item.is_active
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.deleted_at ? 'bg-neutral-400' : item.is_active ? 'bg-success' : 'bg-warning'
                        }`}
                      />
                      {item.deleted_at ? 'Terhapus' : item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  }
                />
                <DetailRow label="Tipe Auth" value={authMeta.description} />
                <DetailRow
                  label="Nama Header"
                  value={
                    item.auth_type === 'api_key_header' ? (
                      <span className="inline-flex items-center gap-2">
                        <HiKey className="w-4 h-4 text-amber-500" />
                        {item.auth_header_name || '-'}
                      </span>
                    ) : (
                      '-'
                    )
                  }
                />
                <DetailRow
                  label="Credential"
                  value={
                    item.auth_type === 'none' ? (
                      'Tidak menggunakan autentikasi'
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <HiLockClosed className="w-4 h-4 text-neutral-400" />
                        {maskSecretValue(item.auth_value)}
                      </span>
                    )
                  }
                />
                <DetailRow label="Dibuat" value={formatDispatchTargetDateTime(item.created_at)} />
                <DetailRow label="Terakhir Diupdate" value={formatDispatchTargetDateTime(item.updated_at)} />
                {item.deleted_at && (
                  <DetailRow label="Waktu Dihapus" value={formatDispatchTargetDateTime(item.deleted_at)} />
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-neutral-500">Data dispatch target tidak ditemukan.</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
          >
            Tutup
          </button>
          {item && !item.deleted_at && canUpdate && (
            <button
              type="button"
              onClick={onEdit}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer"
            >
              Edit Target
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DispatchTargetDetailModal
