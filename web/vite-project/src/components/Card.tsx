import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  hover = false
}) => {
  const cardClasses = `
    bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden
    ${hover ? 'card-hover' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-green-light">
          {title && (
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
