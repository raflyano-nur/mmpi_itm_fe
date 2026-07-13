/**
 * @file DetailModal.tsx
 * @description Generic modal untuk menampilkan detail record pasien.
 * Bisa dipakai untuk Rawat Jalan, IGD, Rawat Inap, Telemedik, dll.
 */

import React from "react";
import { HiXMark, HiInformationCircle } from "react-icons/hi2";
import TabMenu, { TabMenuItem } from "./TabMenu";

// ─── Types ────────────────────────────────────────────────────
export interface DetailField {
  label: string;
  value: string | number | null | undefined;
  colSpan?: 2 | 1;
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "info" | "default";
  };
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
}

interface Props {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  sections: DetailSection[];
  onClose: () => void;
  tabs?: TabMenuItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  extraActions?: React.ReactNode;
}

// ─── Badge variant styles ─────────────────────────────────────
const badgeStyles: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  default: "bg-neutral-100 text-neutral-700",
};

// ─── Component ────────────────────────────────────────────────
const DetailModal: React.FC<Props> = ({
  isOpen,
  title,
  subtitle,
  icon,
  sections,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  extraActions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      {/*
        FIX: wrapper dijadikan flex-col agar header, tab, dan footer
        (termasuk tombol "Discharge Pasien" di extraActions) tetap
        shrink-0 / selalu terlihat penuh. Sebelumnya konten dikasih
        max-h-[70vh] sendiri sementara wrapper cuma max-h-[90vh] +
        overflow-hidden, jadi kalau section-nya banyak, total tinggi
        (header + tab + 70vh konten + footer) bisa melebihi 90vh dan
        footer-nya ikut ke-clip / "tenggelam".
      */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
              {icon ?? (
                <HiInformationCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-neutral-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-neutral-100"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* TAB MENU (optional) */}
        {tabs && tabs.length > 0 && (
          <div className="px-6 pt-3 shrink-0">
            <TabMenu
              items={tabs}
              activeKey={activeTab}
              onChange={onTabChange}
              variant="underline"
            />
          </div>
        )}

        {/* Content: flex-1 + min-h-0 supaya area ini yang menyusut & discroll,
            bukan max-h tetap seperti sebelumnya. Ini kunci agar footer selalu
            dapat tempat. */}
        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section heading */}
              <h4 className="pb-2 mb-3 text-xs font-semibold tracking-wider uppercase border-b text-neutral-400 border-neutral-100">
                {section.title}
              </h4>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {section.fields.map((field, fIdx) => (
                  <div
                    key={fIdx}
                    className={`flex items-start gap-3 p-3 bg-neutral-50 rounded-lg ${
                      field.colSpan === 2 ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs text-neutral-500">
                        {field.label}
                      </p>
                      {field.badge ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            badgeStyles[field.badge.variant]
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              field.badge.variant === "success"
                                ? "bg-green-500"
                                : field.badge.variant === "warning"
                                  ? "bg-yellow-500"
                                  : field.badge.variant === "danger"
                                    ? "bg-red-500"
                                    : field.badge.variant === "info"
                                      ? "bg-blue-500"
                                      : "bg-neutral-400"
                            }`}
                          />
                          {field.badge.text}
                        </span>
                      ) : (
                        <p className="text-sm font-medium text-neutral-800">
                          {field.value?.toString() || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: shrink-0 memastikan bagian ini tidak pernah ikut terpotong
            oleh overflow-hidden di wrapper, walau konten di atas sangat panjang. */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 bg-neutral-50/40 shrink-0">
          {extraActions && (
            <div className="flex items-center gap-2 mr-auto">
              {extraActions}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
