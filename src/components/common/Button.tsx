import { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'pink' | 'mint' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button = memo(function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const variantClasses = {
    primary: 'btn-primary-kawaii',
    secondary: 'btn-secondary-kawaii',
    pink: 'btn-pink-kawaii',
    mint: 'btn-mint-kawaii',
    ghost: 'btn-ghost-kawaii',
  };

  const sizeClasses = {
    small: 'px-5 py-2 text-sm',
    medium: 'px-7 py-3 text-base',
    large: 'px-9 py-4 text-lg',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        btn-kawaii
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.button>
  );
});

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  ariaLabel: string;
}

export const IconButton = memo(function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  ariaLabel,
}: IconButtonProps) {
  const iconSizes = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        nav-btn
        ${iconSizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={!disabled ? { scale: 1.1, rotate: 3 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
    >
      {icon}
    </motion.button>
  );
});
