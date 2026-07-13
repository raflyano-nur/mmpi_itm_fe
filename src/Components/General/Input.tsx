import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rows?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  keyboard?: string;
  // Props baru untuk button
  button?: React.ReactNode;
  buttonPosition?: 'left' | 'right';
  onButtonClick?: () => void;
  buttonClassName?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  iconPosition = 'left',
  rows = 1,
  disabled = false,
  fullWidth = true,
  className = '',
  keyboard,
  button,
  buttonPosition = 'right',
  onButtonClick,
  buttonClassName = '',
}) => {
  const baseStyles = 'bg-linear-to-r from-orange-600/30 to-orange-300/20 border border-orange-500 rounded-lg outline-none focus:border-orange-760 transition-colors text-sm';
  
  // Adjust padding berdasarkan icon dan button position
  let paddingLeft = 'px-4';
  let paddingRight = 'px-4';
  
  if (icon && iconPosition === 'left') {
    paddingLeft = 'pl-10';
  }
  if (icon && iconPosition === 'right') {
    paddingRight = 'pr-10';
  }
  if (button && buttonPosition === 'left') {
    paddingLeft = 'pl-12';
  }
  if (button && buttonPosition === 'right') {
    paddingRight = 'pr-12';
  }
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
  };
  
  return (
    <div className={`relative ${widthClass}`}>
      {/* Icon di sebelah kiri */}
      {icon && iconPosition === 'left' && !button && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-900">
          {icon}
        </div>
      )}
      
      {/* Button di sebelah kiri */}
      {button && buttonPosition === 'left' && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-900 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          {button}
        </button>
      )}
      
      {/* Input Field */}
      {type === 'textarea' ? (
        <textarea
          className={`${baseStyles} ${paddingLeft} ${paddingRight} py-2 resize-none ${widthClass} ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className={`${baseStyles} ${paddingLeft} ${paddingRight} py-2 ${widthClass} ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
      
      {/* Icon di sebelah kanan */}
      {icon && iconPosition === 'right' && !button && !keyboard && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-900">
          {icon}
        </div>
      )}
      
      {/* Button di sebelah kanan */}
      {button && buttonPosition === 'right' && !keyboard && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-900 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          {button}
        </button>
      )}
      
      {/* Keyboard shortcut indicator */}
      {keyboard && (
        <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-[#2a2a2a] border border-gray-700 rounded text-xs text-gray-400">
          {keyboard}
        </kbd>
      )}
    </div>
  );
};

export default Input;