import { FaMapMarkerAlt, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';

const Locations = () => {
  const { t } = useTranslation();
  const { locations, loading } = useSite();

  const handleOpenInMaps = (latitude, longitude) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return null;
  }

  if (!locations || locations.length === 0) {
    return null;
  }

  return (
    <section id="locations" className="section-padding bg-cream-50">
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-16">
          <div className="section-title-bar" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-800">
              {t('sections.locations.title')}
            </h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-sans">
              {t('sections.locations.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <div
              key={location.id}
              className="group bg-white border border-gray-200/80 rounded-2xl p-8 hover:border-gold-300 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Number + Name */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-sans font-medium text-gold-600 uppercase tracking-widest mb-2">
                    {t('sections.locations.location')} {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-primary-800">{location.name}</h3>
                </div>
                <FaMapMarkerAlt className="text-gold-400 text-xl flex-shrink-0 mt-1" />
              </div>

              {/* Address */}
              <p className="text-gray-500 text-sm font-sans mb-6">{location.address}</p>

              {/* Hours */}
              <div className="flex items-start gap-2.5 mb-8 flex-1">
                <FaClock className="text-gold-400 flex-shrink-0 mt-0.5 text-sm" />
                <div className="flex-1">
                  <p className="text-xs font-sans font-medium text-gray-500 uppercase tracking-wide mb-2">{t('sections.locations.hours')}</p>
                  <div className="text-sm font-sans text-gray-600 space-y-1">
                    {location.business_hours && Object.keys(location.business_hours).length > 0 ? (
                      Object.entries(location.business_hours).map(([day, hours]) => (
                        hours && hours.start && hours.end && (
                          <div key={day} className="flex justify-between gap-4">
                            <span className="capitalize text-gray-400">{day}</span>
                            <span className="text-gray-600">{hours.start} – {hours.end}</span>
                          </div>
                        )
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-xs">{t('admin.locations.hoursNotSet')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Open in Maps */}
              {location.latitude && location.longitude && (
                <button
                  onClick={() => handleOpenInMaps(location.latitude, location.longitude)}
                  className="mt-auto flex items-center justify-center gap-2 bg-primary-800 text-white px-4 py-3 rounded-lg hover:bg-primary-900 transition-colors duration-200 text-sm font-sans font-medium"
                >
                  <FaMapMarkerAlt className="text-xs" />
                  <span>{t('sections.locations.openInMaps')}</span>
                  <FaExternalLinkAlt className="text-xs" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;
