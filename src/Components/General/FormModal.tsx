/**
 * @file FormModal.tsx
 * @description Generic modal form untuk tambah / edit record pasien.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  HiXMark,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiExclamationTriangle,
} from "react-icons/hi2";
import { joinClassNames } from "@/Utils/laboratorium";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "radio"
  | "date"
  | "textarea"
  | "time"
  | "datetime-local"
  | "switch"
  | "custom";

export interface FormFieldActionContext<T = Record<string, any>> {
  key: keyof T;
  value: any;
  formData: Partial<T>;
}

export interface FormFieldConfig<T = Record<string, any>> {
  key: keyof T;
  label: string;
  type: FieldType;
  render?: (props: {
    value: any;
    onChange: (val: any) => void;
    formData: T;
    errors: Record<string, string>;
    setFieldValue: (key: keyof T, value: any) => void;
    setValues: (values: Partial<T>) => void;
  }) => React.ReactNode;
  placeholder?: string;
  required?: boolean;
  colSpan?: 1 | 2;
  options?: { label: string; value: string | number }[];
  readOnly?: boolean;
  disabled?: boolean;
  actionLabel?: string;
  onAction?: (context: FormFieldActionContext<T>) => void;
  validate?: (value: any, formData: Partial<T>) => string | undefined;
  /** Error keys (e.g. nested fields rendered inside this field's `render`) that should also
   * scroll to this field when they fail validation, even though they aren't their own FormFieldConfig entry. */
  relatedErrorKeys?: string[];
  helperText?: string | ((formData: Partial<T>) => string | undefined);
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  rows?: number;
  // ── Switch-specific ──
  switchOnLabel?: string;
  switchOffLabel?: string;
}

interface Props<T extends Record<string, any>> {
  isOpen: boolean;
  mode: "create" | "edit";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  fields: FormFieldConfig<T>[];
  initialData?: Partial<T>;
  externalValues?: Partial<T>;
  externalErrors?: Partial<Record<keyof T | string, string>>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: T, id?: string | number) => void;
  onFormDataChange?: (data: Partial<T>) => void;
  itemId?: string | number;
  headerAction?: React.ReactNode;
  gridClassName?: string;
}

function FormModal<T extends Record<string, any>>({
  isOpen,
  mode,
  title,
  subtitle,
  icon,
  fields,
  initialData,
  externalValues,
  externalErrors,
  isSubmitting = false,
  onClose,
  onSubmit,
  onFormDataChange,
  itemId,
  headerAction,
  gridClassName,
}: Props<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onFormDataChangeRef = useRef(onFormDataChange);
  const isInitializedRef = useRef(false);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToFirstErrorField = (errorKeys: string[]) => {
    const errorKeySet = new Set(errorKeys);
    const target = fields.find((f) => {
      const ownKeys = [f.key as string, ...(f.relatedErrorKeys ?? [])];
      return ownKeys.some((k) => errorKeySet.has(k));
    });
    if (!target) return;
    fieldRefs.current[target.key as string]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  useEffect(() => {
    onFormDataChangeRef.current = onFormDataChange;
  }, [onFormDataChange]);

  // ONLY initialize form when modal first opens
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      return;
    }

    // Only initialize if not initialized yet
    if (!isInitializedRef.current) {
      const mergedInitial = {
        ...initialData,
        ...externalValues,
      };

      const defaults: Record<string, any> = {};
      fields.forEach((f) => {
        const key = f.key as string;
        if (f.type === "switch") {
          defaults[key] = mergedInitial[key] ?? false;
        } else {
          defaults[key] = mergedInitial[key] ?? "";
        }
      });

      setFormData(defaults);
      onFormDataChangeRef.current?.(defaults as Partial<T>);
      setErrors({});
      isInitializedRef.current = true;
    }
  }, [isOpen, initialData, fields, externalValues]); // externalValues tetap di sini untuk initial load

  // Update formData when externalValues change (but don't reset other fields)
  useEffect(() => {
    if (!isOpen || !externalValues || !isInitializedRef.current) return;

    setFormData((prev) => {
      const next = { ...prev };
      let hasChanges = false;

      // Only update fields that exist in externalValues
      Object.keys(externalValues).forEach((key) => {
        if (prev[key] !== externalValues[key]) {
          next[key] = externalValues[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        onFormDataChangeRef.current?.(next as Partial<T>);
        return next;
      }
      return prev;
    });
  }, [externalValues, isOpen]);

  useEffect(() => {
    if (!isOpen || !externalErrors) return;
    setErrors((prev) => ({ ...prev, ...externalErrors }));
    const errorKeys = Object.keys(externalErrors).filter(
      (key) => externalErrors[key as keyof typeof externalErrors],
    );
    if (errorKeys.length > 0) scrollToFirstErrorField(errorKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalErrors, isOpen]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      onFormDataChangeRef.current?.(next as Partial<T>);
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const setFieldValue = (key: keyof T, value: any) => {
    handleChange(key as string, value);
  };

  const setValues = (values: Partial<T>) => {
    setFormData((prev) => {
      const next = { ...prev, ...values };
      onFormDataChangeRef.current?.(next as Partial<T>);
      return next;
    });

    setErrors((prev) => {
      const nextErrors = { ...prev };
      Object.keys(values as Record<string, unknown>).forEach((key) => {
        if (nextErrors[key]) delete nextErrors[key];
      });
      return nextErrors;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const fieldKey = f.key as string;
      const value = formData[fieldKey];

      if (f.type !== "switch" && f.required && !value?.toString().trim()) {
        newErrors[f.key as string] = `${f.label} wajib diisi`;
        return;
      }

      const customError = f.validate?.(value, formData as Partial<T>);
      if (customError) {
        newErrors[fieldKey] = customError;
      }
    });
    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) scrollToFirstErrorField(errorKeys);
    return errorKeys.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData as T, itemId);
  };

  if (!isOpen) return null;

  const inputBase = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white focus:outline-none
     focus:ring-2 transition-all placeholder:text-neutral-400
     ${
       hasError
         ? "border-red-400 focus:ring-red-200 focus:border-red-400"
         : "border-neutral-200 focus:ring-blue-500/20 focus:border-blue-500"
     }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
              {icon ??
                (mode === "create" ? (
                  <HiOutlinePlusCircle className="w-5 h-5 text-blue-600" />
                ) : (
                  <HiOutlinePencilSquare className="w-5 h-5 text-blue-600" />
                ))}
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

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
            <div
              className={joinClassNames(
                "grid grid-cols-1 gap-4 sm:grid-cols-2",
                gridClassName,
              )}
            >
              {fields.map((field) => {
                const key = field.key as string;
                const hasError = !!errors[key];
                const value =
                  field.type === "switch"
                    ? !!formData[key]
                    : (formData[key] ?? "");
                const fieldDisabled =
                  isSubmitting || field.readOnly || field.disabled;

                return (
                  <div
                    key={key}
                    ref={(el) => {
                      fieldRefs.current[key] = el;
                    }}
                    className={joinClassNames(
                      field.colSpan === 2 ? "md:col-span-2" : "",
                      field.className,
                    )}
                  >
                    {field.type !== "switch" && (
                      <label
                        className={joinClassNames(
                          "mb-1.5 block text-sm font-medium text-neutral-700",
                          field.labelClassName,
                        )}
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </label>
                    )}

                    {field.type === "custom" && field.render ? (
                      field.render({
                        value,
                        onChange: (val: any) => handleChange(key, val),
                        formData: formData as T,
                        errors,
                        setFieldValue,
                        setValues,
                      })
                    ) : field.type === "switch" ? (
                      <label
                        className={joinClassNames(
                          "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-all",
                          fieldDisabled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer",
                          hasError ? "border-red-300" : "border-neutral-200",
                        )}
                      >
                        <span
                          className={joinClassNames(
                            "text-sm font-medium text-neutral-700",
                            field.labelClassName,
                          )}
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </span>

                        <span className="flex items-center gap-2">
                          {(value
                            ? field.switchOnLabel
                            : field.switchOffLabel) && (
                            <span className="text-xs text-neutral-400">
                              {value
                                ? field.switchOnLabel
                                : field.switchOffLabel}
                            </span>
                          )}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={value}
                            disabled={fieldDisabled}
                            onClick={() => handleChange(key, !value)}
                            className={joinClassNames(
                              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed",
                              value ? "bg-blue-500" : "bg-neutral-200",
                            )}
                          >
                            <span
                              className={joinClassNames(
                                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                value ? "translate-x-6" : "translate-x-1",
                              )}
                            />
                          </button>
                        </span>
                      </label>
                    ) : field.type === "select" ? (
                      <select
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={fieldDisabled}
                        className={joinClassNames(
                          inputBase(hasError),
                          field.inputClassName,
                        )}
                      >
                        <option value="">
                          {field.placeholder ?? "Pilih..."}
                        </option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "radio" ? (
                      <div className="flex flex-wrap gap-3">
                        {field.options?.map((opt) => {
                          const checked = String(value) === String(opt.value);

                          return (
                            <label
                              key={opt.value}
                              className={joinClassNames(
                                "flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-all",
                                fieldDisabled
                                  ? "cursor-not-allowed opacity-60"
                                  : "hover:border-blue-300 hover:bg-blue-50/50",
                                hasError
                                  ? "border-red-300"
                                  : checked
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-neutral-200 bg-white text-neutral-700",
                              )}
                            >
                              <input
                                type="radio"
                                name={key}
                                value={opt.value}
                                checked={checked}
                                onChange={(e) =>
                                  handleChange(key, e.target.value)
                                }
                                disabled={fieldDisabled}
                                className="h-4 w-4 border-neutral-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={fieldDisabled}
                        rows={field.rows ?? 3}
                        className={joinClassNames(
                          inputBase(hasError),
                          "resize-none",
                          field.inputClassName,
                        )}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type={field.type}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={field.placeholder}
                          disabled={fieldDisabled}
                          readOnly={field.readOnly}
                          className={joinClassNames(
                            inputBase(hasError),
                            field.inputClassName,
                          )}
                        />
                        {field.onAction && (
                          <button
                            type="button"
                            onClick={() =>
                              field.onAction?.({
                                key: field.key,
                                value,
                                formData: formData as Partial<T>,
                              })
                            }
                            disabled={isSubmitting}
                            className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {field.actionLabel ?? "Pilih"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* {hasError && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>} */}
                    {hasError ? (
                      <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
                    ) : (
                      (() => {
                        const helper =
                          typeof field.helperText === "function"
                            ? field.helperText(formData as Partial<T>)
                            : field.helperText;
                        return helper ? (
                          <p
                            className={joinClassNames(
                              "mt-1 text-xs text-neutral-400",
                              field.helperTextClassName,
                            )}
                          >
                            {helper}
                          </p>
                        ) : null;
                      })()
                    )}
                  </div>
                );
              })}
            </div>

            {mode === "edit" && (
              <div className="mt-4 px-3.5 py-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Info:</span> Perubahan akan
                  langsung disimpan ke sistem.
                </p>
              </div>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 px-6 py-3 border-t border-red-100 bg-red-50">
              <HiExclamationTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-xs text-red-600">
                Terdapat kolom yang belum valid. Periksa kembali data yang
                ditandai merah di atas.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
            {headerAction && <div>{headerAction}</div>}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
              )}
              {isSubmitting
                ? "Menyimpan..."
                : mode === "create"
                  ? "Simpan"
                  : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormModal;
