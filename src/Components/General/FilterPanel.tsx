import React from 'react';
import { FilterFieldConfig } from '@/Config/columnMap';

interface FilterPanelProps {
  filters: FilterFieldConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onApply?: () => void;
  isLoading?: boolean;
}

const baseInputClass =
  'w-full bg-gradient-to-r from-orange-600/20 to-orange-300/10 border border-orange-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-600 transition-colors placeholder-orange-300/60 text-gray-800';

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  onApply,
  isLoading = false,
}) => {
  const hasActiveFilter = Object.values(values).some((v) => v !== '');

  return (
    <div className="bg-white border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filter
          {hasActiveFilter && (
            <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
              Aktif
            </span>
          )}
        </h3>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filters.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">{field.label}</label>

            {field.type === 'select' && field.options ? (
              <select
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={isLoading}
                className={baseInputClass}
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'date' ? (
              <input
                type="date"
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={isLoading}
                className={baseInputClass}
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={isLoading}
                className={baseInputClass}
              />
            )}
          </div>
        ))}
      </div>

      {onApply && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                />
              </svg>
            )}
            Terapkan Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
