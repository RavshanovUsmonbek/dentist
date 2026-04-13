import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaTooth } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { settings, content, locations } = useSite();
  const currentYear = new Date().getFullYear();

  const footerContent = content?.footer || {};
  const businessName = settings?.business_name || 'Smile Dental Care';

  const lang = i18n.language;
  const pickLang = (obj) => (typeof obj === 'object' && obj !== null)
    ? (obj[lang] || obj.uz || obj.ru || obj.en || '')
    : (obj || '');

  const footerDescription = pickLang(footerContent.description) || 'Providing exceptional dental care with compassion and expertise. Your smile is our priority.';
  const copyrightText = pickLang(footerContent.copyright_text);
  const phone = settings?.business_phone;
  const phoneSecondary = settings?.business_phone_secondary;
  const email = settings?.business_email;
  const facebookUrl = settings?.social_facebook;
  const twitterUrl = settings?.social_twitter;
  const instagramUrl = settings?.social_instagram;
  const multiLocationEnabled = settings?.features_multi_location === 'true' || settings?.features_multi_location === true;
  const hasLocations = locations && locations.length > 0;

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <FaTooth className="text-gold-500 text-lg flex-shrink-0" />
              <span className="font-display text-xl font-semibold text-white tracking-wide">{businessName}</span>
            </div>
            <p className="text-white/50 text-sm font-sans leading-relaxed mb-6">
              {footerDescription}
            </p>
            <div className="flex items-center gap-4">
              {facebookUrl && facebookUrl !== '#' && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold-400 transition-colors duration-200" aria-label="Facebook">
                  <FaFacebook className="text-lg" />
                </a>
              )}
              {twitterUrl && twitterUrl !== '#' && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold-400 transition-colors duration-200" aria-label="Twitter">
                  <FaTwitter className="text-lg" />
                </a>
              )}
              {instagramUrl && instagramUrl !== '#' && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold-400 transition-colors duration-200" aria-label="Instagram">
                  <FaInstagram className="text-lg" />
                </a>
              )}
            </div>
          </div>

          {multiLocationEnabled && hasLocations ? (
            <div className="md:col-span-2">
              <p className="text-gold-500 text-xs font-sans font-medium uppercase tracking-widest mb-5">{t('footer.contactLocations')}</p>

              {/* Global contact */}
              {(phone || phoneSecondary || email) && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  {phone && (
                    <div className="flex items-center gap-3 mb-2">
                      <FaPhone className="text-gold-500 text-xs flex-shrink-0" />
                      <span className="text-white/60 text-sm font-sans">{phone}</span>
                    </div>
                  )}
                  {phoneSecondary && (
                    <div className="flex items-center gap-3 mb-2">
                      <FaPhone className="text-gold-500 text-xs flex-shrink-0" />
                      <span className="text-white/60 text-sm font-sans">{phoneSecondary}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gold-500 text-xs flex-shrink-0" />
                      <span className="text-white/60 text-sm font-sans">{email}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {locations.map((location) => {
                  const daysOfWeek = typeof location.days_of_week === 'string'
                    ? JSON.parse(location.days_of_week)
                    : location.days_of_week;
                  const daysDisplay = daysOfWeek && daysOfWeek.length > 0
                    ? daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                    : '';

                  return (
                    <div key={location.id}>
                      <p className="text-gold-500 text-xs font-sans font-medium mb-3">{location.name}</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5">
                          <FaMapMarkerAlt className="text-white/30 flex-shrink-0 mt-0.5 text-xs" />
                          <span className="text-white/50 text-sm font-sans">{location.address}</span>
                        </li>
                        {daysDisplay && (
                          <li className="flex items-start gap-2.5">
                            <FaClock className="text-white/30 flex-shrink-0 mt-0.5 text-xs" />
                            <div>
                              <p className="text-white/50 text-sm font-sans">{daysDisplay}</p>
                              {location.hours_weekday && <p className="text-white/40 text-xs font-sans">{location.hours_weekday}</p>}
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
            <div>
              <p className="text-gold-500 text-xs font-sans font-medium uppercase tracking-widest mb-5">{t('footer.contactInfo')}</p>
              <ul className="space-y-3">
                {phone && (
                  <li className="flex items-center gap-3">
                    <FaPhone className="text-white/30 text-xs flex-shrink-0" />
                    <span className="text-white/60 text-sm font-sans">{phone}</span>
                  </li>
                )}
                {phoneSecondary && (
                  <li className="flex items-center gap-3">
                    <FaPhone className="text-white/30 text-xs flex-shrink-0" />
                    <span className="text-white/60 text-sm font-sans">{phoneSecondary}</span>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-3">
                    <FaEnvelope className="text-white/30 text-xs flex-shrink-0" />
                    <span className="text-white/60 text-sm font-sans">{email}</span>
                  </li>
                )}
                {!phone && !phoneSecondary && !email && (
                  <li className="text-white/30 text-sm font-sans">
                    Contact information not configured.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-white/30 text-xs font-sans">{copyrightText || `© ${currentYear} ${businessName}. ${t('footer.allRightsReserved')}`}</p>
          <div className="w-8 h-px bg-gold-500/40" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
