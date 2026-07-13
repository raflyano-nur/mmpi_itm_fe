import React from "react";
import { HiExclamationTriangle, HiXMark } from "react-icons/hi2";

interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
  infoLines: { label: string; value: string | null | undefined }[];
  isDeleting?: boolean;
  confirmLabel?: string;
  warningText?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<Props> = ({
  isOpen,
  title = "Hapus Data",
  description = "Apakah Anda yakin ingin menghapus data berikut?",
  infoLines,
  isDeleting = false,
  confirmLabel = "Hapus",
  warningText = "Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak bisa dikembalikan.",
  children,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <HiExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-neutral-100"
          >
            <HiXMark className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-neutral-600">{description}</p>

          <div className="mt-3 space-y-1 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            {infoLines.map((line, index) => (
              <p
                key={index}
                className={`text-xs text-neutral-500 ${index === 0 ? "text-sm font-semibold text-neutral-800" : "mt-0.5"}`}
              >
                {index === 0
                  ? line.value || "-"
                  : `${line.label}: ${line.value || "-"}`}
              </p>
            ))}
          </div>

          {children}

          <p className="mt-3 text-xs text-red-500">{warningText}</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 bg-neutral-50/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
