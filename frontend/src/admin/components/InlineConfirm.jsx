import { useState, useRef, useEffect } from 'react';

const InlineConfirm = ({
  onConfirm,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  className = '',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  // Cancel if user clicks outside
  useEffect(() => {
    if (!isConfirming) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsConfirming(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isConfirming]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-amber-500 hover:bg-amber-600 text-white';

  if (!isConfirming) {
    return (
      <span
        ref={containerRef}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsConfirming(true);
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center gap-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Sure?</span>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${confirmBtnClass}`}
      >
        {isLoading ? '...' : confirmLabel}
      </button>
      <button
        onClick={() => setIsConfirming(false)}
        disabled={isLoading}
        className="px-2 py-1 text-xs font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </button>
    </span>
  );
};

export default InlineConfirm;
