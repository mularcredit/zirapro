import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = ''
}: GlowButtonProps) {
  const baseClasses = 'inline-flex text-xs items-center justify-center font-medium rounded-lg transition-all duration-200 border backdrop-blur-sm';

  const variantClasses = {
    primary: 'bg-green-500  text-white hover:bg-green-400  hover:text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] focus:shadow-[0_0_25px_rgba(34,197,94,0.6)]',
    secondary: 'bg-gray-50 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 hover:shadow-[0_0_20px_rgba(107,114,128,0.5)]',
    danger: 'bg-rose-500  text-white hover:bg-rose-400  hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] focus:shadow-[0_0_25px_rgba(244,63,94,0.6)]'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] space-x-1',
    sm: 'px-3 py-1.5 text-xs space-x-1.5',
    md: 'px-4 py-2 text-xs space-x-2',
    lg: 'px-6 py-3 text-base space-x-2'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:shadow-none';

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? disabledClasses : ''} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </motion.button>
  );
}