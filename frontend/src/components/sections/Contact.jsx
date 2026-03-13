import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { submitContactForm } from '../../services/api';

const Contact = () => {
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
                variant="primary"
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

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaPhone className="text-primary-600 text-xl" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                  <p className="text-gray-600">(555) 123-4567</p>
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
                  <p className="text-gray-600">info@smiledentalcare.com</p>
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
                  <p className="text-gray-600">123 Dental Street, Suite 100</p>
                  <p className="text-gray-600">Your City, ST 12345</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaClock className="text-primary-600 text-xl" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Office Hours</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 3:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Emergency Care</h4>
                <p className="text-gray-600 text-sm">
                  If you have a dental emergency outside of our regular hours, please call our emergency line at <strong>(555) 999-8888</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
