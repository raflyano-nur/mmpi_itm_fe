import React from 'react';

/**
 * Reusable Badge Component
 * 
 * @param {string} variant - Variant warna (success, warning, danger, info, default)
 * @param {ReactNode} children - Content badge
 * @param {string} size - Ukuran badge (sm, md, lg)
 */

type BadgeProps = {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const variants = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-orange-50 text-orange-600 border-orange-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

export default function Badge({ variant = 'default', children, size = 'md' } : BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}