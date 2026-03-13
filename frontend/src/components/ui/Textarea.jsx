const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const textareaClasses = `
    w-full px-4 py-3 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all duration-200
    resize-none
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={textareaClasses}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
