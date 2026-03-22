import { FaTooth, FaSmile, FaStethoscope, FaAmbulance } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';
import { services as fallbackServices } from '../../data/services';

const iconMap = {
  FaTooth: FaTooth,
  FaSmile: FaSmile,
  FaTeeth: FaTooth,
  FaStethoscope: FaStethoscope,
  FaAmbulance: FaAmbulance,
};

const Services = () => {
  const { services, content, loading } = useSite();

  const displayServices = services && services.length > 0 ? services : fallbackServices;

  const servicesContent = content?.services || {};
  const title = servicesContent.title || 'Our Services';
  const subtitle = servicesContent.subtitle || 'Comprehensive professional services tailored to your needs';

  if (loading) {
    return (
      <section id="services" className="section-padding bg-cream-50">
        <div className="container-custom">
          <p className="text-gray-400 text-center text-sm">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding bg-cream-50">
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-16">
          <div className="section-title-bar" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-800">
              {title}
            </h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200/60">
          {displayServices.map((service, index) => {
            const IconComponent = iconMap[service.icon] || FaTooth;
            const number = String(index + 1).padStart(2, '0');

            return (
              <div
                key={service.id}
                className="group relative bg-cream-50 p-8 hover:bg-white transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Watermark number */}
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-display text-8xl font-bold text-primary-100 select-none pointer-events-none transition-colors duration-300 group-hover:text-primary-200">
                  {number}
                </span>

                {/* Gold left accent line */}
                <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 mb-5 group-hover:bg-gold-100 transition-colors duration-300">
                    <IconComponent className="text-lg text-primary-600 group-hover:text-gold-600 transition-colors duration-300" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary-800 mb-3 group-hover:text-primary-900 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-sans">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
