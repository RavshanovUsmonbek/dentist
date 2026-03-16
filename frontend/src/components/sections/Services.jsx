import { FaTooth, FaSmile, FaStethoscope, FaAmbulance } from 'react-icons/fa';
import Card from '../ui/Card';
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

  // Use API data if available, otherwise fallback to static data
  const displayServices = services && services.length > 0 ? services : fallbackServices;

  // Get dynamic content
  const servicesContent = content?.services || {};
  const title = servicesContent.title || 'Our Services';
  const subtitle = servicesContent.subtitle || 'Comprehensive professional services tailored to your needs';

  if (loading) {
    return (
      <section id="services" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">{title}</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {displayServices.map((service) => {
            const IconComponent = iconMap[service.icon] || FaTooth;

            return (
              <Card key={service.id} hover={true} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                    <IconComponent className="text-3xl text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
