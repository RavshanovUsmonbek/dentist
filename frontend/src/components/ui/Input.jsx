const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const inputClasses = `
    w-full px-4 py-3 border rounded-lg bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800
    transition-all duration-200 text-sm font-sans text-gray-800
    ${error ? 'border-red-400' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-xs font-sans font-medium text-gray-500 uppercase tracking-wide mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-sans">{error}</p>
      )}
    </div>
  );
};

export default Input;
