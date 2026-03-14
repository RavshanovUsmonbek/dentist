import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import Card from '../ui/Card';
import { useSite } from '../../context/SiteContext';
import { testimonials as fallbackTestimonials } from '../../data/testimonials';

const Testimonials = () => {
  const { testimonials, content, loading } = useSite();

  // Use API data if available, otherwise fallback to static data
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

  // Get dynamic content
  const testimonialsContent = content?.testimonials || {};
  const title = testimonialsContent.title || 'Client Testimonials';
  const subtitle = testimonialsContent.subtitle || 'Hear what our clients have to say about their experience';

  if (loading) {
    return (
      <section id="testimonials" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">{title}</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} hover={true}>
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {testimonial.initials}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex-grow">
                  <FaQuoteLeft className="absolute top-0 left-0 text-4xl text-primary-100" />
                  <p className="text-gray-600 italic pl-10 pt-2">{testimonial.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
