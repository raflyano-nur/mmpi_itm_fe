import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  preview?: string;
  date?: string;
  gradient?: string;
  onClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  preview,
  date,
  gradient = 'from-blue-500 to-blue-600',
  onClick,
  onMoreClick,
  className = '',
  hoverable = true,
}) => {
  return (
    <div
      className={`
        bg-[#1e1e1e] rounded-xl p-4 border border-gray-800 transition-all
        ${hoverable ? 'hover:bg-[#252525] hover:border-gray-700 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="flex items-start justify-between mb-3">
          {icon && (
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0`}>
              {icon}
            </div>
          )}
          {onMoreClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoreClick();
              }}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-gray-400 hover:text-white"
            >
              ⋯
            </button>
          )}
        </div>
      )}
      
      {title && (
        <h3 className="text-sm font-medium mb-2 truncate">{title}</h3>
      )}
      
      {preview && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{preview}</p>
      )}
      
      {children}
      
      {date && (
        <p className="text-xs text-gray-500 mt-3">{date}</p>
      )}
    </div>
  );
};

export default Card;