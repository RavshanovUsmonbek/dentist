import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCopy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LocationMapPicker from '../components/LocationMapPicker';

const BUSINESS_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Locations = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    business_hours: {},
    latitude: null,
    longitude: null,
    active: true
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await adminApi.getLocations();
      setLocations(response.data || []);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting location with formData:', formData);
    try {
      if (selectedLocation) {
        await adminApi.updateLocation(selectedLocation.id, formData);
      } else {
        await adminApi.createLocation(formData);
      }
      setIsModalOpen(false);
      resetForm();
      loadLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      business_hours: location.business_hours || {},
      latitude: location.latitude || null,
      longitude: location.longitude || null,
      active: location.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteLocation(selectedLocation.id);
      loadLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const resetForm = () => {
    setSelectedLocation(null);
    setFormData({
      name: '',
      address: '',
      business_hours: {},
      latitude: null,
      longitude: null,
      active: true
    });
  };

  const handleHoursChange = (day, field, value) => {
    const currentHours = formData.business_hours || {};
    const dayHours = currentHours[day] || { start: '', end: '' };

    // If both fields become empty, remove the day entry
    if (!value && !dayHours[field === 'start' ? 'end' : 'start']) {
      const { [day]: removed, ...rest } = currentHours;
      setFormData({ ...formData, business_hours: rest });
    } else {
      setFormData({
        ...formData,
        business_hours: {
          ...currentHours,
          [day]: { ...dayHours, [field]: value }
        }
      });
    }
  };

  const handleCopyHours = (toDay, fromDay) => {
    if (!fromDay) return;

    const currentHours = formData.business_hours || {};
    const sourceHours = currentHours[fromDay];

    if (sourceHours && sourceHours.start && sourceHours.end) {
      setFormData({
        ...formData,
        business_hours: {
          ...currentHours,
          [toDay]: { start: sourceHours.start, end: sourceHours.end }
        }
      });
    }
  };

  // Get days that have hours set (for the copy dropdown)
  const getDaysWithHours = (excludeDay) => {
    const currentHours = formData.business_hours || {};
    return BUSINESS_DAYS.filter(day =>
      day !== excludeDay &&
      currentHours[day] &&
      currentHours[day].start &&
      currentHours[day].end
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.locations.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> {t('admin.locations.addLocation')}
        </button>
      </div>

      <div className="grid gap-6">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FaMapMarkerAlt className="text-cyan-600 text-xl" />
                  <h3 className="text-xl font-semibold text-gray-800">{location.name}</h3>
                  <span className={`px-3 py-1 text-xs rounded-full ${location.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {location.active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">{t('admin.locations.address')}</p>
                    <p>{location.address}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700 mb-1">{t('admin.locations.businessHours')}</p>
                    {location.business_hours && Object.keys(location.business_hours).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(location.business_hours).map(([day, hours]) => (
                          hours && hours.start && hours.end && (
                            <p key={day} className="text-sm">
                              <span className="capitalize">{day}:</span> {hours.start} - {hours.end}
                            </p>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">{t('admin.locations.hoursNotSet')}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(location)} className="text-blue-600 hover:text-blue-800 p-2">
                  <FaEdit className="text-xl" />
                </button>
                <button onClick={() => { setSelectedLocation(location); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-2">
                  <FaTrash className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaMapMarkerAlt className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('admin.locations.noLocations')}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedLocation ? t('admin.locations.editLocation') : t('admin.locations.addLocation')}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.locations.locationName')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
              placeholder="Main Office, West Side Clinic, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.locations.address')} *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={2}
              required
              placeholder="123 Main Street, Tashkent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Full address including city and region
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.locations.selectOnMap')}</label>
            <LocationMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationSelect={(lat, lng) => {
                console.log('onLocationSelect called with:', lat, lng);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              }}
              onAddressGenerated={(address) => {
                console.log('onAddressGenerated called with:', address);
                setFormData(prev => ({ ...prev, address: address }));
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Click "Use My Location" to auto-fill address, or click on the map to select the exact location manually.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('admin.locations.businessHours')}</label>
            <div className="space-y-3">
              {BUSINESS_DAYS.map(day => {
                const daysWithHours = getDaysWithHours(day);
                return (
                  <div key={day} className="grid grid-cols-12 gap-2 items-center">
                    {/* Day label */}
                    <div className="col-span-2">
                      <span className="text-sm font-medium capitalize text-gray-700">{t(`admin.locations.${day}`)}</span>
                    </div>

                    {/* Start time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={formData.business_hours?.[day]?.start || ''}
                        onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Separator */}
                    <div className="col-span-1 text-center">
                      <span className="text-gray-500 font-medium">-</span>
                    </div>

                    {/* End time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={formData.business_hours?.[day]?.end || ''}
                        onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Copy from dropdown */}
                    <div className="col-span-3">
                      {daysWithHours.length > 0 && (
                        <select
                          onChange={(e) => handleCopyHours(day, e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs text-gray-600"
                          value=""
                        >
                          <option value="">{t('admin.locations.copyFrom')}</option>
                          {daysWithHours.map(sourceDay => (
                            <option key={sourceDay} value={sourceDay}>
                              {t(`admin.locations.${sourceDay}`)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave blank for days the location is closed. Times are in 24-hour format. Use "Copy from" to duplicate hours from other days.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">{t('common.active')}</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
              {selectedLocation ? t('common.edit') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default Locations;
