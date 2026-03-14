import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { submitContactForm } from '../../services/api';

const Contact = () => {
  const { settings, content, locations, loading } = useSite();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: false });

    try {
      await submitContactForm(formData);
      setFormStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: '', phone: '', message: '' });

      setTimeout(() => {
        setFormStatus({ loading: false, error: null, success: false });
      }, 5000);
    } catch (error) {
      setFormStatus({
        loading: false,
        error: error.message || 'Failed to send message. Please try again.',
        success: false,
      });
    }
  };

  // Extract contact information from settings and content
  const contactContent = content?.contact || {};
  const phone = settings?.business_phone || '(555) 123-4567';
  const email = settings?.business_email || 'info@smiledentalcare.com';
  const address = settings?.business_address || '123 Dental Street, Suite 100';
  const city = settings?.business_city || 'Your City, ST 12345';
  const hoursWeekday = settings?.hours_weekday || 'Monday - Friday: 8:00 AM - 6:00 PM';
  const hoursSaturday = settings?.hours_saturday || 'Saturday: 9:00 AM - 3:00 PM';
  const hoursSunday = settings?.hours_sunday || 'Sunday: Closed';
  const emergencyPhone = contactContent.contact_emergency_phone || '(555) 999-8888';
  const emergencyMessage = contactContent.contact_emergency_message || 'If you have a dental emergency outside of our regular hours, please call our emergency line at';

  // Dynamic labels
  const hoursTitle = contactContent.hours_title || 'Business Hours';
  const emergencyTitle = contactContent.emergency_title || 'Emergency Contact';
  const emergencyText = contactContent.emergency_text || 'For urgent matters, please call us directly.';

  // Check if multi-location is enabled
  const multiLocationEnabled = settings?.features_multi_location === 'true' || settings?.features_multi_location === true;
  const hasLocations = locations && locations.length > 0;

  if (loading) {
    return (
      <section id="contact" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">Contact Us</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or want to schedule an appointment? We'd love to hear from you.
            Fill out the form below or give us a call.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>

            {formStatus.success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Thank you for contacting us! We'll get back to you soon.
              </div>
            )}

            {formStatus.error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {formStatus.error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />

              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />

              <Textarea
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help you..."
                rows={5}
                required
              />

              <Button
                type="submit"
                variant="accent"
                size="lg"
                loading={formStatus.loading}
                className="w-full"
              >
                Send Message
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>

            {multiLocationEnabled && hasLocations ? (
              // Multi-location display
              <div className="space-y-8">
                {/* Global Contact Info (from settings) */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    {/* Phone numbers (comma-separated) */}
                    {phone && phone.split(',').map((num, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <FaPhone className="text-primary-600 mt-1" />
                        <p className="text-gray-600">{num.trim()}</p>
                      </div>
                    ))}

                    {/* Email */}
                    {email && (
                      <div className="flex items-start space-x-3">
                        <FaEnvelope className="text-primary-600 mt-1" />
                        <p className="text-gray-600">{email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Locations (address + hours only) */}
                {locations.map((location) => {
                  const daysOfWeek = typeof location.days_of_week === 'string'
                    ? JSON.parse(location.days_of_week)
                    : location.days_of_week;
                  const daysDisplay = daysOfWeek && daysOfWeek.length > 0
                    ? daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                    : '';

                  return (
                    <div key={location.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">{location.name}</h4>
                      <div className="space-y-3">
                        {/* Address */}
                        <div className="flex items-start space-x-3">
                          <FaMapMarkerAlt className="text-primary-600 mt-1" />
                          <p className="text-gray-600">{location.address}</p>
                        </div>

                        {/* Hours */}
                        {daysDisplay && (
                          <div className="flex items-start space-x-3">
                            <FaClock className="text-primary-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{daysDisplay}</p>
                              {location.hours_weekday && <p className="text-sm text-gray-600">{location.hours_weekday}</p>}
                              {location.hours_saturday && <p className="text-sm text-gray-600">Sat: {location.hours_saturday}</p>}
                              {location.hours_sunday && <p className="text-sm text-gray-600">Sun: {location.hours_sunday}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Single location display (default)
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaPhone className="text-primary-600 text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                    <p className="text-gray-600">{phone}</p>
                    <p className="text-sm text-gray-500">Call us during business hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaEnvelope className="text-primary-600 text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                    <p className="text-gray-600">{email}</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-primary-600 text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Address</h4>
                    <p className="text-gray-600">{address}</p>
                    <p className="text-gray-600">{city}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaClock className="text-primary-600 text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{hoursTitle}</h4>
                    <div className="space-y-1 text-gray-600">
                      <p>{hoursWeekday}</p>
                      <p>{hoursSaturday}</p>
                      <p>{hoursSunday}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{emergencyTitle}</h4>
                  <p className="text-gray-600 text-sm">
                    {emergencyText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
