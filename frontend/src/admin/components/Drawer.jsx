import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const widthClasses = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
};

const Drawer = ({ isOpen, onClose, title, subtitle, children, size = 'md', footer }) => {
  const panelRef = useRef(null);
  // Keep a stable ref to onClose so the effect doesn't re-run on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Body scroll lock + Escape key — only re-runs when isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleEsc = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleEsc);

    // Focus the panel for accessibility
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="drawer-backdrop fixed inset-0 bg-primary-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — anchored to the right */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`drawer-panel relative ml-auto flex flex-col h-full bg-white shadow-2xl ${widthClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-primary-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 text-gray-400 hover:text-primary-800 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Optional sticky footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
