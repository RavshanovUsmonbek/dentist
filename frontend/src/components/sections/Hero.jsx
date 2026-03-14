import Button from '../ui/Button';
import { useSite } from '../../context/SiteContext';
import heroImage from '../../assets/hero.png';

const Hero = () => {
  const { content, loading } = useSite();

  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Default content with fallbacks
  const heroContent = content?.hero || {};
  const title = heroContent.hero_title || 'Your Smile, Our Priority';
  const subtitle = heroContent.hero_subtitle || 'Experience exceptional dental care with state-of-the-art technology and a compassionate team dedicated to your oral health.';
  const primaryButtonText = heroContent.hero_button_primary || 'Schedule Appointment';
  const secondaryButtonText = heroContent.hero_button_secondary || 'Our Services';

  if (loading) {
    return (
      <section id="hero" className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500" />
        <div className="relative z-10 text-center">
          <p className="text-white">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center"
    >
      {/* Blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500" />

      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="primary" onClick={scrollToContact}>
            {primaryButtonText}
          </Button>
          <Button size="lg" variant="secondary" onClick={(e) => {
            e.preventDefault();
            document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            {secondaryButtonText}
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
