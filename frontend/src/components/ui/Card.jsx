const Card = ({ children, className = '', hover = true }) => {
  const hoverClass = hover ? 'hover:shadow-card-hover hover:-translate-y-1' : '';

  return (
    <div className={`bg-white rounded-lg shadow-card p-6 transition-all duration-300 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
