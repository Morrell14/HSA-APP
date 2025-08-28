import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  tone?: 'info' | 'success' | 'error';
  onClose: () => void;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, description, tone = 'info', onClose, actions }) => {
  if (!open) return null;

  const toneClasses = {
    info: 'text-blue-700 bg-blue-50 border-blue-200',
    success: 'text-blue-700 bg-blue-50 border-blue-200',
    error: 'text-error-500 bg-error-50 border-error-600'
  } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900" style={{ opacity: 0.35 }} onClick={onClose} aria-hidden="true"></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className={`px-6 py-4 border-b ${toneClasses[tone]} rounded-t-2xl`}>
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        <div className="px-6 py-5">
          {actions ? (
            <div className="flex items-center justify-end gap-2">
              {actions}
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">OK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


