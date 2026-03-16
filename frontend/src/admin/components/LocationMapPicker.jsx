import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaCrosshairs } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tashkent, Uzbekistan coordinates
const TASHKENT_CENTER = [41.2995, 69.2401];

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to update map center when coordinates change
const MapCenterUpdater = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);

  return null;
};

const LocationMapPicker = ({ latitude, longitude, onLocationSelect, onAddressGenerated }) => {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const center = (latitude && longitude) ? [latitude, longitude] : TASHKENT_CENTER;

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DentistWebsite/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.display_name && onAddressGenerated) {
          // Format the address nicely
          const address = data.display_name;
          onAddressGenerated(address);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Don't show error to user - address can still be entered manually
    }
  };

  const handleUseMyLocation = () => {
    setLocating(true);
    setLocationError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Got geolocation:', lat, lng);
          onLocationSelect(lat, lng);

          // Get address from coordinates
          await reverseGeocode(lat, lng);

          setLocating(false);
        },
        (error) => {
          setLocating(false);
          setLocationError('Unable to get your location. Please select manually on the map.');
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocating(false);
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaCrosshairs className={locating ? 'animate-spin' : ''} />
          {locating ? 'Getting location...' : 'Use My Location'}
        </button>
        {locationError && (
          <span className="text-xs text-red-600">{locationError}</span>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onLocationSelect} />
          <MapCenterUpdater latitude={latitude} longitude={longitude} />
          {latitude && longitude && (
            <Marker position={[latitude, longitude]} />
          )}
        </MapContainer>
      </div>
      <div className="text-sm text-gray-600">
        {latitude && longitude ? (
          <p>
            <span className="font-medium">Selected coordinates:</span> {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        ) : (
          <p className="italic">Click on the map to select a location or use your current location</p>
        )}
      </div>
    </div>
  );
};

export default LocationMapPicker;
