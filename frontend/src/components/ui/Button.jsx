const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'font-sans font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-white text-primary-800 hover:bg-cream-50 focus:ring-white shadow-md hover:shadow-lg',
    secondary: 'bg-transparent text-white border-2 border-white/60 hover:border-white hover:bg-white/10 focus:ring-white',
    accent: 'bg-primary-800 text-white hover:bg-primary-700 focus:ring-primary-800/50 shadow-md hover:shadow-lg',
    outline: 'bg-transparent text-primary-800 border-2 border-primary-800 hover:bg-primary-800 hover:text-white focus:ring-primary-800/50',
    gold: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500/50 shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
