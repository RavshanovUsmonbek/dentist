import Button from '../ui/Button';

const Hero = () => {
  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-700 to-primary-900 text-white"
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          Your Smile, Our Priority
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
          Experience exceptional dental care with state-of-the-art technology and a compassionate team dedicated to your oral health.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="accent" onClick={scrollToContact}>
            Schedule Appointment
          </Button>
          <Button size="lg" variant="secondary" onClick={(e) => {
            e.preventDefault();
            document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Our Services
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
