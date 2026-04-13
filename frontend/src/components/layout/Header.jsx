import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaTooth } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const { settings } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const businessName = settings?.business_name || 'Smile Dental Care';

  const navItems = [
    { name: t('nav.home'), href: '#hero' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.gallery'), href: '#gallery' },
    { name: t('nav.testimonials'), href: '#testimonials' },
    { name: t('nav.locations'), href: '#locations' },
    { name: t('nav.contact'), href: '#contact' },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream-50/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <FaTooth className="text-gold-500 text-xl flex-shrink-0" />
            <span className={`font-display text-xl font-semibold tracking-wide transition-colors duration-300 ${
              scrolled ? 'text-primary-800' : 'text-white'
            }`}>
              {businessName}
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-7">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`relative text-xs font-sans font-medium tracking-wide uppercase transition-colors duration-200 group ${
                    scrolled ? 'text-gray-600 hover:text-primary-800' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </a>
              ))}
            </nav>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className={`text-xl ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <FaBars className={`text-xl ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cream-50 border-t border-gray-200">
            <nav className="flex flex-col px-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="px-4 py-3 text-sm font-sans text-gray-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
              <div className="px-4 py-3">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
