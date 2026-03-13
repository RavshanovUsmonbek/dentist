import { FaTooth, FaSmile, FaStethoscope, FaAmbulance } from 'react-icons/fa';
import Card from '../ui/Card';
import { services } from '../../data/services';

const iconMap = {
  FaTooth: FaTooth,
  FaSmile: FaSmile,
  FaTeeth: FaTooth,
  FaStethoscope: FaStethoscope,
  FaAmbulance: FaAmbulance,
};

const Services = () => {
  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">Our Services</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a comprehensive range of dental services to meet all your oral health needs,
            from preventive care to advanced cosmetic procedures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || FaTooth;

            return (
              <Card key={service.id} hover={true}>
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
