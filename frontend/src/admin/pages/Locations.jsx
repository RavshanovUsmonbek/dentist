import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import LocationMapPicker from '../components/LocationMapPicker';
import Toast, { useToast } from '../components/Toast';

const BUSINESS_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Locations = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
    try {
      if (selectedLocation) {
        await adminApi.updateLocation(selectedLocation.id, formData);
      } else {
        await adminApi.createLocation(formData);
      }
      setIsDrawerOpen(false);
      resetForm();
      loadLocations();
      showToast(selectedLocation ? 'Location updated' : 'Location created');
    } catch (error) {
      console.error('Failed to save location:', error);
      showToast('Failed to save location', 'error');
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
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteLocation(id);
      loadLocations();
      showToast('Location deleted');
    } catch (error) {
      console.error('Failed to delete location:', error);
      showToast('Failed to delete location', 'error');
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

    if (!value && !dayHours[field === 'start' ? 'end' : 'start']) {
      const { [day]: _, ...rest } = currentHours;
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.locations.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsDrawerOpen(true); }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="text-xs" /> {t('admin.locations.addLocation')}
        </button>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FaMapMarkerAlt className="text-primary-600 text-lg" />
                  <h3 className="text-base font-semibold text-gray-800">{location.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${location.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {location.active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.locations.address')}</p>
                    <p>{location.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.locations.businessHours')}</p>
                    {location.business_hours && Object.keys(location.business_hours).length > 0 ? (
                      <div className="space-y-0.5">
                        {Object.entries(location.business_hours).map(([day, hours]) => (
                          hours && hours.start && hours.end && (
                            <p key={day} className="text-xs">
                              <span className="capitalize font-medium">{day}:</span> {hours.start} – {hours.end}
                            </p>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-xs">{t('admin.locations.hoursNotSet')}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <button onClick={() => handleEdit(location)} className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                  <FaEdit className="text-sm" />
                </button>
                <InlineConfirm onConfirm={() => handleDelete(location.id)}>
                  <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <FaTrash className="text-sm" />
                  </button>
                </InlineConfirm>
              </div>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <FaMapMarkerAlt className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('admin.locations.noLocations')}</p>
          </div>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); resetForm(); }}
        title={selectedLocation ? t('admin.locations.editLocation') : t('admin.locations.addLocation')}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              form="location-form"
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedLocation ? t('common.edit') : t('common.create')}
            </button>
          </div>
        }
      >
        <form id="location-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.locations.locationName')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              required
              placeholder="Main Office, West Side Clinic, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.locations.address')} *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              rows={2}
              required
              placeholder="123 Main Street, Tashkent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.locations.selectOnMap')}</label>
            <LocationMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationSelect={(lat, lng) => {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              }}
              onAddressGenerated={(address) => {
                setFormData(prev => ({ ...prev, address: address }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('admin.locations.businessHours')}</label>
            <div className="space-y-2">
              {BUSINESS_DAYS.map(day => {
                const daysWithHours = getDaysWithHours(day);
                return (
                  <div key={day} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2">
                      <span className="text-xs font-medium capitalize text-gray-600">{t(`admin.locations.${day}`)}</span>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={formData.business_hours?.[day]?.start || ''}
                        onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-gray-400 text-xs">–</span>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={formData.business_hours?.[day]?.end || ''}
                        onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      {daysWithHours.length > 0 && (
                        <select
                          onChange={(e) => handleCopyHours(day, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-xs text-gray-600"
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
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-800"
            />
            <label htmlFor="active" className="text-sm text-gray-700">{t('common.active')}</label>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Locations;
