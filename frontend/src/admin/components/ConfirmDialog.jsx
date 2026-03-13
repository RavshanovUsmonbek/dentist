import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    primary: 'bg-cyan-600 hover:bg-cyan-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-4">
        <p className="text-gray-600">{message}</p>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${variantClasses[variant]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
