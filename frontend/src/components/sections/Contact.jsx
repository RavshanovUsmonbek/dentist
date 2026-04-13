import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';
import { submitContactForm } from '../../services/api';

const Contact = () => {
  const { t } = useTranslation();
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: false });
    try {
      await submitContactForm(formData);
      setFormStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setFormStatus({ loading: false, error: null, success: false }), 5000);
    } catch (error) {
      setFormStatus({ loading: false, error: error.message || 'Failed to send message. Please try again.', success: false });
    }
  };

  const contactContent = content?.contact || {};
  const contactTitle    = contactContent.title        || t('contact.title');
  const contactSubtitle = contactContent.subtitle     || t('contact.subtitle');
  const formTitle       = contactContent.form_title   || t('contact.formTitle');
  const successMessage  = contactContent.success_message || t('contact.success');
  const phone = settings?.business_phone;
  const phoneSecondary = settings?.business_phone_secondary;
  const email = settings?.business_email;
  const multiLocationEnabled = settings?.features_multi_location === 'true' || settings?.features_multi_location === true;
  const hasLocations = locations && locations.length > 0;

  if (loading) {
    return (
      <section id="contact" className="section-padding bg-cream-50">
        <div className="container-custom">
          <p className="text-gray-400 text-center text-sm">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section-padding bg-cream-50">
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-16">
          <div className="section-title-bar" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-800">
              {contactTitle}
            </h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-sans">
              {contactSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-sm border border-gray-200/60">

          {/* Form column */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-10 md:p-14">
            <h3 className="font-display text-2xl font-semibold text-primary-800 mb-8">{formTitle}</h3>

            {formStatus.success && (
              <div className="mb-8 p-4 bg-primary-50 border-l-4 border-primary-800 text-primary-800 rounded-r-lg text-sm font-sans">
                {successMessage}
              </div>
            )}

            {formStatus.error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-sans">
                {formStatus.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="floating-label-group">
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label htmlFor="contact-name">
                  {t('contact.name')} *
                </label>
              </div>

              <div className="floating-label-group">
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label htmlFor="contact-email">
                  {t('contact.email')} *
                </label>
              </div>

              <div className="floating-label-group">
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="contact-phone">
                  {t('contact.phone')}
                </label>
              </div>

              <div className="floating-label-group">
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder=" "
                  style={{ resize: 'none' }}
                />
                <label htmlFor="contact-message">
                  {t('contact.message')} *
                </label>
              </div>

              <button
                type="submit"
                disabled={formStatus.loading}
                className="w-full bg-primary-800 text-white py-4 rounded-lg font-sans font-medium text-sm hover:bg-primary-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : t('contact.send')}
              </button>
            </form>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 bg-primary-800 p-6 sm:p-10 md:p-14 text-white">
            <h3 className="font-display text-2xl font-semibold text-white mb-8">{t('contact.infoTitle')}</h3>

            {multiLocationEnabled && hasLocations ? (
              <div className="space-y-8">
                {/* Global contact */}
                {(phone || phoneSecondary || email) && (
                  <div className="pb-6 border-b border-white/10">
                    {phone && (
                      <div className="flex items-center gap-3 mb-3">
                        <FaPhone className="text-gold-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm font-sans">{phone}</span>
                      </div>
                    )}
                    {phoneSecondary && (
                      <div className="flex items-center gap-3 mb-3">
                        <FaPhone className="text-gold-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm font-sans">{phoneSecondary}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-gold-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm font-sans">{email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Locations */}
                {locations.map((location) => {
                  const daysOfWeek = typeof location.days_of_week === 'string'
                    ? JSON.parse(location.days_of_week)
                    : location.days_of_week;
                  const daysDisplay = daysOfWeek && daysOfWeek.length > 0
                    ? daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                    : '';

                  return (
                    <div key={location.id} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                      <p className="text-gold-400 text-xs font-sans font-medium uppercase tracking-widest mb-3">{location.name}</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-white/40 flex-shrink-0 mt-0.5" />
                          <span className="text-white/70 text-sm font-sans">{location.address}</span>
                        </div>
                        {daysDisplay && (
                          <div className="flex items-start gap-3">
                            <FaClock className="text-white/40 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-white/70 text-sm font-sans">{daysDisplay}</p>
                              {location.hours_weekday && <p className="text-white/50 text-xs font-sans mt-0.5">{location.hours_weekday}</p>}
                              {location.hours_saturday && <p className="text-white/50 text-xs font-sans">Sat: {location.hours_saturday}</p>}
                              {location.hours_sunday && <p className="text-white/50 text-xs font-sans">Sun: {location.hours_sunday}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-gold-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-widest mb-1">{t('contact.phone')}</p>
                      <p className="text-white/80 text-sm font-sans">{phone}</p>
                      {phoneSecondary && <p className="text-white/80 text-sm font-sans">{phoneSecondary}</p>}
                      <p className="text-white/40 text-xs font-sans mt-1">{t('contact.callHours')}</p>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="text-gold-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-medium text-white/40 uppercase tracking-widest mb-1">{t('contact.email')}</p>
                      <p className="text-white/80 text-sm font-sans">{email}</p>
                      <p className="text-white/40 text-xs font-sans mt-1">{t('contact.emailResponse')}</p>
                    </div>
                  </div>
                )}

                {!phone && !phoneSecondary && !email && (
                  <p className="text-white/40 text-sm font-sans">
                    Contact information not configured. Please use the admin panel to add contact details.
                  </p>
                )}
              </div>
            )}

            {/* Decorative gold line */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="w-8 h-px bg-gold-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
