import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaTooth } from 'react-icons/fa';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-primary-700'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <FaTooth className={`text-2xl ${scrolled ? 'text-primary-600' : 'text-white'}`} />
            <span className={`text-xl font-bold ${scrolled ? 'text-primary-700' : 'text-white'}`}>
              Smile Dental Care
            </span>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`font-medium hover:text-accent-500 transition-colors duration-200 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className={`text-2xl ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <FaBars className={`text-2xl ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
