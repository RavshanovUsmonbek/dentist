import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';

const Footer = () => {
  const { settings, content, locations } = useSite();
  const currentYear = new Date().getFullYear();

  // Extract footer content
  const footerContent = content?.footer || {};
  const businessName = settings?.business_name || 'Smile Dental Care';
  const footerDescription = footerContent.footer_description || 'Providing exceptional dental care with compassion and expertise. Your smile is our priority.';
  const phone = settings?.business_phone || '(555) 123-4567';
  const email = settings?.business_email || 'info@smiledentalcare.com';
  const address = settings?.business_address || '123 Dental Street, Suite 100';
  const city = settings?.business_city || 'Your City, ST 12345';
  const facebookUrl = settings?.social_facebook || '#';
  const twitterUrl = settings?.social_twitter || '#';
  const instagramUrl = settings?.social_instagram || '#';
  const hoursWeekday = settings?.hours_weekday || 'Monday - Friday: 8:00 AM - 6:00 PM';
  const hoursSaturday = settings?.hours_saturday || 'Saturday: 9:00 AM - 3:00 PM';
  const hoursSunday = settings?.hours_sunday || 'Sunday: Closed';

  // Dynamic labels
  const hoursTitle = footerContent.hours_title || 'Hours';

  // Check if multi-location is enabled
  const multiLocationEnabled = settings?.features_multi_location === 'true' || settings?.features_multi_location === true;
  const hasLocations = locations && locations.length > 0;

  // Parse hours to separate label and time
  const parseHours = (hoursString) => {
    const parts = hoursString.split(':');
    if (parts.length === 2) {
      return { label: parts[0].trim(), time: parts[1].trim() };
    }
    return { label: hoursString, time: '' };
  };

  const weekday = parseHours(hoursWeekday);
  const saturday = parseHours(hoursSaturday);
  const sunday = parseHours(hoursSunday);

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{businessName}</h3>
            <p className="text-gray-300 mb-4">
              {footerDescription}
            </p>
            <div className="flex space-x-4">
              {facebookUrl && facebookUrl !== '#' && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors duration-200" aria-label="Facebook">
                  <FaFacebook className="text-2xl" />
                </a>
              )}
              {twitterUrl && twitterUrl !== '#' && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors duration-200" aria-label="Twitter">
                  <FaTwitter className="text-2xl" />
                </a>
              )}
              {instagramUrl && instagramUrl !== '#' && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors duration-200" aria-label="Instagram">
                  <FaInstagram className="text-2xl" />
                </a>
              )}
            </div>
          </div>

          {multiLocationEnabled && hasLocations ? (
            // Multi-location display
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Contact & Locations</h3>

              {/* Global Contact (from settings) */}
              <div className="mb-6 pb-4 border-b border-primary-700">
                {phone && phone.split(',').map((num, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <FaPhone className="text-accent-400" />
                    <span className="text-sm">{num.trim()}</span>
                  </div>
                ))}
                {email && (
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="text-accent-400" />
                    <span className="text-sm">{email}</span>
                  </div>
                )}
              </div>

              {/* Locations Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {locations.map((location) => {
                  const daysOfWeek = typeof location.days_of_week === 'string'
                    ? JSON.parse(location.days_of_week)
                    : location.days_of_week;
                  const daysDisplay = daysOfWeek && daysOfWeek.length > 0
                    ? daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                    : '';

                  return (
                    <div key={location.id} className="space-y-2">
                      <h4 className="font-semibold text-accent-400">{location.name}</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        {/* Address */}
                        <li className="flex items-start space-x-2">
                          <FaMapMarkerAlt className="text-accent-400 flex-shrink-0 mt-1" />
                          <span>{location.address}</span>
                        </li>

                        {/* Hours */}
                        {daysDisplay && (
                          <li className="flex items-start space-x-2">
                            <FaClock className="text-accent-400 flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-medium">{daysDisplay}</div>
                              {location.hours_weekday && <div>{location.hours_weekday}</div>}
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Single location display (default)
            <>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <FaPhone className="text-accent-400" />
                    <span>{phone}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FaEnvelope className="text-accent-400" />
                    <span>{email}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-accent-400" />
                    <span>{address}<br />{city}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">{hoursTitle}</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>{weekday.label}:</span>
                    <span>{weekday.time}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>{saturday.label}:</span>
                    <span>{saturday.time}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>{sunday.label}:</span>
                    <span>{sunday.time}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-primary-800 text-center text-gray-400">
          <p>&copy; {currentYear} {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
