import { FaMapMarkerAlt, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';

const Locations = () => {
  const { locations, loading } = useSite();

  const handleOpenInMaps = (latitude, longitude) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return null; // Don't show loading state for locations
  }

  // Don't render section if no active locations
  if (!locations || locations.length === 0) {
    return null;
  }

  return (
    <section id="locations" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">Our Locations</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visit us at any of our convenient locations. We're here to serve you!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              {/* Location Name */}
              <div className="flex items-start gap-3 mb-4">
                <FaMapMarkerAlt className="text-primary-600 text-2xl flex-shrink-0 mt-1" />
                <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
              </div>

              {/* Address */}
              <div className="mb-4">
                <p className="text-gray-600">{location.address}</p>
              </div>

              {/* Business Hours */}
              <div className="mb-6 flex items-start gap-2">
                <FaClock className="text-accent-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Hours</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    {location.business_hours && Object.keys(location.business_hours).length > 0 ? (
                      Object.entries(location.business_hours).map(([day, hours]) => (
                        hours && hours.start && hours.end && (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize font-medium">{day}:</span>
                            <span>{hours.start} - {hours.end}</span>
                          </div>
                        )
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Hours not specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Open in Maps Button - Only show if coordinates exist */}
              {location.latitude && location.longitude && (
                <button
                  onClick={() => handleOpenInMaps(location.latitude, location.longitude)}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 mt-auto"
                >
                  <FaMapMarkerAlt />
                  <span>Open in Maps</span>
                  <FaExternalLinkAlt className="text-sm" />
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
