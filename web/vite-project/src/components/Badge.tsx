import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default' | 'green';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    error: 'bg-error-100 text-error-800 border border-error-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    green: 'bg-green-500 text-white border border-green-600'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};
