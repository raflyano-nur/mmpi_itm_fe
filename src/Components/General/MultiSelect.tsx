// src/Components/General/MultiSelect.tsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HiCheck, HiChevronDown, HiPlus, HiXMark } from "react-icons/hi2";

export interface MultiSelectOption<TMeta = unknown> {
  value: string;
  label: string;
  subLabel?: string;
  description?: string;
  meta?: TMeta;
}

export type MultiSelectSizePreset = "xs" | "sm" | "md" | "lg";

export interface MultiSelectSizeConfig {
  /** Tailwind class, contoh: 'min-h-[36px]' */
  minHeight: string;
  /** Tailwind class, contoh: 'px-2.5 py-1.5' */
  padding: string;
  /** Tailwind class untuk teks trigger, contoh: 'text-sm' */
  textSize: string;
  /** Tailwind class padding chip (multi-select), contoh: 'px-2 py-0.5' */
  chipPadding: string;
  /** Tailwind class ukuran teks chip, contoh: 'text-[11px]' */
  chipText: string;
  /** Tailwind class gap antar chip/konten, contoh: 'gap-1.5' */
  gap: string;
}

const SIZE_PRESETS: Record<MultiSelectSizePreset, MultiSelectSizeConfig> = {
  xs: {
    minHeight: "min-h-[30px]",
    padding: "px-2 py-1",
    textSize: "text-xs",
    chipPadding: "px-1.5 py-0.5",
    chipText: "text-[10px]",
    gap: "gap-1",
  },
  sm: {
    minHeight: "min-h-[36px]",
    padding: "px-2.5 py-1.5",
    textSize: "text-sm",
    chipPadding: "px-2 py-0.5",
    chipText: "text-[11px]",
    gap: "gap-1.5",
  },
  md: {
    minHeight: "min-h-[48px]",
    padding: "px-3 py-2",
    textSize: "text-sm",
    chipPadding: "px-2.5 py-1",
    chipText: "text-xs",
    gap: "gap-2",
  },
  lg: {
    minHeight: "min-h-[56px]",
    padding: "px-4 py-2.5",
    textSize: "text-base",
    chipPadding: "px-3 py-1.5",
    chipText: "text-sm",
    gap: "gap-2",
  },
};

/** Breakpoint lebar container (px) -> preset. Diurutkan dari terkecil. Dipakai kalau `autoSize` aktif. */
export interface AutoSizeBreakpoint {
  maxWidth: number;
  size: MultiSelectSizePreset;
}

const DEFAULT_AUTO_SIZE_BREAKPOINTS: AutoSizeBreakpoint[] = [
  { maxWidth: 160, size: "xs" },
  { maxWidth: 240, size: "sm" },
  { maxWidth: 360, size: "md" },
];

// ---------------------------------------------------------------------------
// Color theming
// ---------------------------------------------------------------------------
// Semua warna aksen di komponen ini (border fokus, ring, chip, checkbox, dll)
// diambil dari CSS custom properties, bukan class Tailwind hardcoded.
// Ini supaya warnanya bisa di-custom per-pemakaian lewat prop `colorScheme`
// (preset bawaan) atau `colorTokens` (custom hex), tanpa perlu edit component.

export interface MultiSelectColorTokens {
  /** Dipakai untuk background chip, hover halus, highlight opsi terpilih */
  50: string;
  /** Dipakai untuk border chip, ring saat fokus */
  100: string;
  /** Dipakai untuk hover chip/tombol create yang lebih pekat sedikit */
  200: string;
  /** Dipakai untuk border trigger & search input saat fokus/terbuka */
  400: string;
  /** Dipakai untuk checkbox terisi (border+bg) */
  500: string;
  /** Dipakai untuk teks tombol "create" & icon hapus chip */
  600: string;
  /** Dipakai untuk teks chip & teks nilai terpilih (mode single) */
  700: string;
}

export type MultiSelectColorPreset =
  | "cyan"
  | "orange"
  | "blue"
  | "emerald"
  | "rose"
  | "violet"
  | "slate";

const COLOR_PRESETS: Record<MultiSelectColorPreset, MultiSelectColorTokens> = {
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
  },
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
  },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
  },
};

const resolveColorTokens = (
  colorScheme: MultiSelectColorPreset,
  colorTokens?: Partial<MultiSelectColorTokens>,
): MultiSelectColorTokens => ({
  ...COLOR_PRESETS[colorScheme],
  ...colorTokens,
});

const buildColorCssVars = (
  tokens: MultiSelectColorTokens,
): React.CSSProperties =>
  ({
    "--ms-50": tokens[50],
    "--ms-100": tokens[100],
    "--ms-200": tokens[200],
    "--ms-400": tokens[400],
    "--ms-500": tokens[500],
    "--ms-600": tokens[600],
    "--ms-700": tokens[700],
  }) as React.CSSProperties;

interface MultiSelectBaseProps<TMeta = unknown> {
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  options?: MultiSelectOption<TMeta>[];
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Izinkan user mengetik nilai baru yang tidak ada di `options` */
  creatable?: boolean;
  /** Custom label untuk opsi "tambah baru", default: `Tambah "..."` */
  formatCreateLabel?: (inputValue: string) => string;
  rememberCreated?: boolean;
  rememberKey?: string;
  /**
   * Preset ukuran trigger. Diabaikan kalau `autoSize` aktif (size akan
   * ditentukan otomatis dari lebar container).
   * Default: 'md'
   */
  size?: MultiSelectSizePreset;
  /**
   * Override sebagian/semua nilai dari preset yang dipakai, buat kebutuhan
   * custom di luar 4 preset yang ada. Di-merge di atas preset.
   */
  sizeConfig?: Partial<MultiSelectSizeConfig>;
  /**
   * Kalau `true`, ukuran trigger otomatis menyesuaikan lebar container
   * (pakai ResizeObserver) berdasarkan `DEFAULT_AUTO_SIZE_BREAKPOINTS`.
   * Bisa juga dikasih array breakpoint custom.
   */
  autoSize?: boolean | AutoSizeBreakpoint[];
  /**
   * Preset warna aksen (border fokus, chip, checkbox, dll). Default: 'cyan'.
   */
  colorScheme?: MultiSelectColorPreset;
  /**
   * Override sebagian/semua token warna di luar preset (hex/rgb/nama warna CSS apapun).
   * Di-merge di atas `colorScheme`.
   */
  colorTokens?: Partial<MultiSelectColorTokens>;
}

export interface MultiSelectMultiProps<
  TMeta = unknown,
> extends MultiSelectBaseProps<TMeta> {
  type?: "multi" | "multiple";
  value?: MultiSelectOption<TMeta>[];
  onChange?: (newValue: MultiSelectOption<TMeta>[]) => void;
}

export interface MultiSelectSingleProps<
  TMeta = unknown,
> extends MultiSelectBaseProps<TMeta> {
  type: "single";
  value?: MultiSelectOption<TMeta> | null;
  onChange?: (newValue: MultiSelectOption<TMeta> | null) => void;
}

export type MultiSelectProps<TMeta = unknown> =
  | MultiSelectMultiProps<TMeta>
  | MultiSelectSingleProps<TMeta>;

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  /** Buka ke atas trigger (kalau ruang di bawah gak cukup) */
  openUp: boolean;
  maxHeight: number;
}

const MENU_GAP = 8;
const MENU_MAX_HEIGHT = 320;

/**
 * Cari batas visual paling ketat di antara semua ancestor yang men-clip atau
 * men-scroll kontennya (modal card, panel scroll, dll). Dropdown harus
 * dibatasi sama intersection dari SEMUA itu, bukan cuma ancestor pertama yang
 * ketemu — karena modal biasanya: card luar (overflow-hidden, max-height) >
 * div scroll di dalamnya (overflow-y-auto). Footer modal ada di luar div
 * scroll tapi masih di dalam card, jadi batas yang benar adalah card, bukan
 * div scroll itu sendiri.
 */
const getScrollClipBoundary = (node: HTMLElement | null): DOMRect => {
  let current = node?.parentElement ?? null;
  let bounds = {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight;
    const isClippingContainer =
      overflowY === "hidden" &&
      (style.maxHeight !== "none" || style.height !== "auto");

    if (isScrollable || isClippingContainer) {
      const rect = current.getBoundingClientRect();
      bounds = {
        top: Math.max(bounds.top, rect.top),
        left: Math.max(bounds.left, rect.left),
        right: Math.min(bounds.right, rect.right),
        bottom: Math.min(bounds.bottom, rect.bottom),
      };
    }

    current = current.parentElement;
  }

  return new DOMRect(
    bounds.left,
    bounds.top,
    bounds.right - bounds.left,
    bounds.bottom - bounds.top,
  );
};

/** Pilih preset berdasarkan lebar container & daftar breakpoint (urut menaik berdasar maxWidth). */
const resolveAutoSize = (
  width: number,
  breakpoints: AutoSizeBreakpoint[],
): MultiSelectSizePreset => {
  const sorted = [...breakpoints].sort((a, b) => a.maxWidth - b.maxWidth);
  const match = sorted.find((bp) => width <= bp.maxWidth);
  return match ? match.size : "lg";
};

const MultiSelect = <TMeta,>(props: MultiSelectProps<TMeta>) => {
  const {
    placeholder = "Pilih...",
    isLoading = false,
    isDisabled = false,
    options = [],
    closeMenuOnSelect,
    hideSelectedOptions = false,
    className,
    triggerClassName,
    creatable = false,
    formatCreateLabel,
    rememberCreated = false,
    rememberKey,
    size = "md",
    sizeConfig,
    autoSize = false,
    colorScheme = "cyan",
    colorTokens,
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [autoResolvedSize, setAutoResolvedSize] =
    useState<MultiSelectSizePreset>(size);

  // Resolve warna sekali per render berdasarkan preset + override.
  const resolvedColorTokens = useMemo(
    () => resolveColorTokens(colorScheme, colorTokens),
    [colorScheme, colorTokens],
  );
  const colorCssVars = useMemo(
    () => buildColorCssVars(resolvedColorTokens),
    [resolvedColorTokens],
  );

  // ResizeObserver buat autoSize: ukur lebar root container, lalu pilih preset.
  useEffect(() => {
    if (!autoSize) return;
    const node = rootRef.current;
    if (!node) return;

    const breakpoints = Array.isArray(autoSize)
      ? autoSize
      : DEFAULT_AUTO_SIZE_BREAKPOINTS;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (typeof width !== "number") return;
      setAutoResolvedSize(resolveAutoSize(width, breakpoints));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [autoSize]);

  const effectiveSizeKey: MultiSelectSizePreset = autoSize
    ? autoResolvedSize
    : size;
  const effectiveSizeConfig: MultiSelectSizeConfig = useMemo(
    () => ({ ...SIZE_PRESETS[effectiveSizeKey], ...sizeConfig }),
    [effectiveSizeKey, sizeConfig],
  );

  const selectionType =
    props.type === "multiple" ? "multi" : (props.type ?? "multi");
  const value = useMemo(() => {
    if (selectionType === "single") {
      const singleValue = (props as MultiSelectSingleProps<TMeta>).value;
      return singleValue ? [singleValue] : [];
    }

    return (props as MultiSelectMultiProps<TMeta>).value ?? [];
  }, [props, selectionType]);

  const shouldCloseMenuOnSelect =
    closeMenuOnSelect ?? selectionType === "single";

  // Load remembered options from localStorage
  const rememberedOptions = useMemo(() => {
    if (!rememberCreated || !rememberKey) return [];

    try {
      const raw = localStorage.getItem(rememberKey);
      return raw ? (JSON.parse(raw) as MultiSelectOption<TMeta>[]) : [];
    } catch {
      return [];
    }
  }, [rememberCreated, rememberKey, refreshKey]);

  // Hitung posisi menu relatif ke viewport (bukan relatif ke parent),
  // supaya menu bisa "lepas" dari overflow/stacking context manapun.
  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const boundary = getScrollClipBoundary(trigger);

    // boundary sudah jadi intersection antara viewport dan semua ancestor
    // yang men-clip/scroll (termasuk modal card), jadi tinggal pakai langsung.
    const spaceBelow = boundary.bottom - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - boundary.top - MENU_GAP;

    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

    setMenuPosition({
      top: openUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: rect.left,
      width: rect.width,
      openUp,
      maxHeight: Math.max(
        160,
        Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
      ),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updateMenuPosition();

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = rootRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const selectedValues = useMemo(
    () => new Set(value.map((item) => item.value)),
    [value],
  );

  const emitChange = (nextValue: MultiSelectOption<TMeta>[]) => {
    if (selectionType === "single") {
      (props as MultiSelectSingleProps<TMeta>).onChange?.(nextValue[0] ?? null);
      return;
    }

    (props as MultiSelectMultiProps<TMeta>).onChange?.(nextValue);
  };

  const normalizedQuery = query.trim();

  // Gabungkan options dan rememberedOptions untuk pengecekan duplikat
  const mergedOptions = useMemo(() => {
    const allOptions = [...options];

    // Tambahkan remembered options yang tidak ada di options
    rememberedOptions.forEach((remembered) => {
      if (!allOptions.some((opt) => opt.value === remembered.value)) {
        allOptions.push(remembered);
      }
    });

    return allOptions;
  }, [options, rememberedOptions]);

  const filteredOptions = useMemo(() => {
    const lowerQuery = normalizedQuery.toLowerCase();

    return options.filter((option) => {
      if (hideSelectedOptions && selectedValues.has(option.value)) return false;
      if (!lowerQuery) return true;

      return [option.label, option.description, option.subLabel]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(lowerQuery));
    });
  }, [hideSelectedOptions, options, normalizedQuery, selectedValues]);

  const filteredRememberedOptions = useMemo(() => {
    const lowerQuery = normalizedQuery.toLowerCase();

    return rememberedOptions.filter((option) => {
      // Jangan tampilkan remembered options yang sudah dipilih
      if (selectedValues.has(option.value)) return false;
      // Jangan tampilkan remembered options yang sudah ada di options
      if (options.some((opt) => opt.value === option.value)) return false;
      if (!lowerQuery) return true;

      return option.label.toLowerCase().includes(lowerQuery);
    });
  }, [rememberedOptions, normalizedQuery, selectedValues, options]);

  const canCreate = useMemo(() => {
    if (!creatable || !normalizedQuery) return false;

    const lowerQuery = normalizedQuery.toLowerCase();
    const existsInOptions = options.some(
      (option) => option.label.toLowerCase() === lowerQuery,
    );
    const existsInValue = value.some(
      (item) => item.label.toLowerCase() === lowerQuery,
    );
    const existsInRemembered = rememberedOptions.some(
      (item) => item.label.toLowerCase() === lowerQuery,
    );

    return !existsInOptions && !existsInValue && !existsInRemembered;
  }, [creatable, normalizedQuery, options, value, rememberedOptions]);

  const handleToggleOption = (option: MultiSelectOption<TMeta>) => {
    const exists = selectedValues.has(option.value);
    const nextValue = exists
      ? value.filter((item) => item.value !== option.value)
      : selectionType === "single"
        ? [option]
        : [...value, option];

    emitChange(nextValue);
    setQuery("");

    if (shouldCloseMenuOnSelect) {
      setIsOpen(false);
    }
  };

  const handleCreateOption = (label: string) => {
    const newOption: MultiSelectOption<TMeta> = { value: label, label };

    if (rememberCreated && rememberKey) {
      try {
        const raw = localStorage.getItem(rememberKey);
        const items = raw
          ? (JSON.parse(raw) as MultiSelectOption<TMeta>[])
          : [];

        if (!items.some((item) => item.value === label)) {
          items.unshift(newOption);
          localStorage.setItem(rememberKey, JSON.stringify(items.slice(0, 20)));
          setRefreshKey((prev) => prev + 1); // Trigger refresh
        }
      } catch {
        // Handle error
      }
    }

    const nextValue =
      selectionType === "single" ? [newOption] : [...value, newOption];

    emitChange(nextValue);
    setQuery("");

    if (shouldCloseMenuOnSelect) {
      setIsOpen(false);
    }
  };

  const handleRemoveRemembered = (valueToRemove: string) => {
    if (!rememberKey) return;

    try {
      const raw = localStorage.getItem(rememberKey);
      const items = raw ? (JSON.parse(raw) as MultiSelectOption<TMeta>[]) : [];

      localStorage.setItem(
        rememberKey,
        JSON.stringify(items.filter((item) => item.value !== valueToRemove)),
      );
      setRefreshKey((prev) => prev + 1); // Trigger refresh
    } catch {
      // Handle error
    }
  };

  const handleClearRemembered = () => {
    if (!rememberKey) return;

    localStorage.removeItem(rememberKey);
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  const handleRemove = (optionValue: string) => {
    emitChange(value.filter((item) => item.value !== optionValue));
  };

  const handleClearSingle = () => {
    emitChange([]);
  };

  const hasRememberedOptions = filteredRememberedOptions.length > 0;

  const menu =
    isOpen && !isDisabled && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.openUp ? undefined : menuPosition.top,
              bottom: menuPosition.openUp
                ? window.innerHeight - menuPosition.top
                : undefined,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 9999,
              // CSS vars di-set ulang di sini karena portal me-render ke document.body,
              // jadi gak ikut cascade dari rootRef di tree React.
              ...colorCssVars,
            }}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 p-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canCreate) {
                    event.preventDefault();
                    handleCreateOption(normalizedQuery);
                  }
                }}
                placeholder={
                  creatable
                    ? "Cari atau ketik nilai baru..."
                    : "Cari pilihan..."
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--ms-400)] focus:outline-none focus:ring-4 focus:ring-[var(--ms-100)]"
                autoFocus
              />
            </div>

            <div
              className="overflow-y-auto p-2"
              style={{ maxHeight: menuPosition.maxHeight }}
            >
              {isLoading ? (
                <p className="px-3 py-2 text-sm text-slate-500">Memuat...</p>
              ) : (
                <>
                  {/* Create new option */}
                  {canCreate ? (
                    <button
                      type="button"
                      onClick={() => handleCreateOption(normalizedQuery)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[var(--ms-600)] transition hover:bg-[var(--ms-50)]"
                    >
                      <HiPlus className="h-4 w-4" />
                      {formatCreateLabel
                        ? formatCreateLabel(normalizedQuery)
                        : `Tambah "${normalizedQuery}"`}
                    </button>
                  ) : null}

                  {/* History section - separated from main options */}
                  {hasRememberedOptions && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between px-3 py-1.5">
                        <span className="text-xs font-semibold uppercase text-slate-400">
                          Riwayat
                        </span>
                        <button
                          type="button"
                          onClick={handleClearRemembered}
                          className="text-xs text-red-500 transition hover:text-red-700"
                        >
                          Hapus semua
                        </button>
                      </div>

                      {filteredRememberedOptions.map((option) => {
                        const isSelected = selectedValues.has(option.value);

                        return (
                          <div
                            key={option.value}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 transition hover:bg-slate-50"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleOption(option)}
                              className={[
                                "flex flex-1 items-start justify-between gap-3 text-left",
                                isSelected ? "bg-[var(--ms-50)]" : "",
                              ].join(" ")}
                            >
                              <div className="flex min-w-0 items-start gap-2.5">
                                <span
                                  className={[
                                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                    isSelected
                                      ? "border-[var(--ms-500)] bg-[var(--ms-500)] text-white"
                                      : "border-slate-300 bg-white text-transparent",
                                  ].join(" ")}
                                >
                                  <HiCheck className="text-[10px]" />
                                </span>

                                <div className="min-w-0">
                                  <p className="truncate text-sm text-slate-800">
                                    {option.label}
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRemembered(option.value)
                              }
                              className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <HiXMark className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Main options */}
                  {filteredOptions.length > 0 && (
                    <div
                      className={
                        hasRememberedOptions
                          ? "border-t border-slate-100 pt-2"
                          : ""
                      }
                    >
                      {hasRememberedOptions && (
                        <span className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-400">
                          Pilihan Utama
                        </span>
                      )}

                      {filteredOptions.map((option) => {
                        const isSelected = selectedValues.has(option.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleToggleOption(option)}
                            className={[
                              "flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition",
                              isSelected
                                ? "bg-[var(--ms-50)]"
                                : "hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="flex min-w-0 items-start gap-2.5">
                              <span
                                className={[
                                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                  isSelected
                                    ? "border-[var(--ms-500)] bg-[var(--ms-500)] text-white"
                                    : "border-slate-300 bg-white text-transparent",
                                ].join(" ")}
                              >
                                <HiCheck className="text-[10px]" />
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {option.label}
                                </p>
                                {option.description ? (
                                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                    {option.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            {option.subLabel ? (
                              <span className="shrink-0 text-xs font-semibold text-slate-500">
                                {option.subLabel}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!filteredOptions.length &&
                    !canCreate &&
                    !hasRememberedOptions && (
                      <p className="px-3 py-2 text-sm text-slate-400">
                        Tidak ada pilihan
                      </p>
                    )}
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={className} style={colorCssVars}>
      <div
        ref={triggerRef}
        className={[
          effectiveSizeConfig.minHeight,
          effectiveSizeConfig.padding,
          isDisabled
            ? "cursor-not-allowed bg-slate-50 text-slate-400"
            : "cursor-pointer",
          isOpen ? "border-[var(--ms-400)] ring-4 ring-[var(--ms-100)]" : "",
          triggerClassName
            ? triggerClassName
            : "flex items-center rounded-lg border border-slate-200 bg-white transition",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (!isDisabled) setIsOpen((prev) => !prev);
        }}
      >
        <div className="flex w-full items-center justify-between gap-2">
          {selectionType === "single" ? (
            <div className="flex min-w-0 flex-1 items-center">
              {value.length ? (
                <span
                  className={[
                    "truncate rounded-lg bg-[var(--ms-100)] px-2.5 py-1 text-[var(--ms-700)]",
                    effectiveSizeConfig.textSize,
                  ].join(" ")}
                >
                  {value[0].label}
                </span>
              ) : (
                <span
                  className={[
                    "truncate text-slate-400",
                    effectiveSizeConfig.textSize,
                  ].join(" ")}
                >
                  {placeholder}
                </span>
              )}
            </div>
          ) : (
            <div
              className={[
                "flex min-h-[20px] flex-1 flex-wrap items-center",
                effectiveSizeConfig.gap,
              ].join(" ")}
            >
              {value.length ? (
                value.map((item) => (
                  <span
                    key={item.value}
                    className={[
                      "inline-flex items-center gap-1 rounded-full border border-[var(--ms-200)] bg-[var(--ms-50)] font-semibold text-[var(--ms-700)]",
                      effectiveSizeConfig.chipPadding,
                      effectiveSizeConfig.chipText,
                    ].join(" ")}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.label}
                    {!isDisabled ? (
                      <button
                        type="button"
                        className="rounded-full p-0.5 text-[var(--ms-600)] transition hover:bg-[var(--ms-100)]"
                        onClick={() => handleRemove(item.value)}
                      >
                        <HiXMark className="h-3 w-3" />
                      </button>
                    ) : null}
                  </span>
                ))
              ) : (
                <span
                  className={[
                    "text-slate-400",
                    effectiveSizeConfig.textSize,
                  ].join(" ")}
                >
                  {placeholder}
                </span>
              )}
            </div>
          )}

          <HiChevronDown
            className={[
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </div>

      {menu}
    </div>
  );
};

export default MultiSelect;
