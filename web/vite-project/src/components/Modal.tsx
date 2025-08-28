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

  const headerBg = tone === 'error' ? 'var(--error-50)' : 'var(--blue-50)';
  const headerBorder = tone === 'error' ? 'var(--error-600)' : 'var(--blue-200)';
  const headerText = tone === 'error' ? 'var(--error-500)' : 'var(--blue-600)';

  return (
    <div
      className="flex items-center justify-center px-4"
      style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'auto' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(17,24,39,0.45)', pointerEvents: 'auto' }}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200"
        style={{ position: 'relative', width: '100%', maxWidth: 360, pointerEvents: 'auto', overflow: 'hidden' }}
      >
        <div
          className={`border-b ${toneClasses[tone]}`}
          style={{ background: headerBg, borderColor: headerBorder, color: headerText, padding: '12px 16px' }}
        >
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        <div style={{ padding: '16px 16px' }}>
          {actions ? (
            <div className="flex items-center justify-end gap-2">
              {actions}
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <button onClick={onClose} className="px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">OK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


