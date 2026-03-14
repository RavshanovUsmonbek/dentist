import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    days_of_week: [],
    hours_weekday: '',
    hours_saturday: '',
    hours_sunday: '',
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
      setIsModalOpen(false);
      resetForm();
      loadLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    // Parse days_of_week JSON string to array
    const daysArray = typeof location.days_of_week === 'string'
      ? JSON.parse(location.days_of_week)
      : location.days_of_week;

    setFormData({
      name: location.name,
      address: location.address,
      days_of_week: daysArray,
      hours_weekday: location.hours_weekday || '',
      hours_saturday: location.hours_saturday || '',
      hours_sunday: location.hours_sunday || '',
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
      days_of_week: [],
      hours_weekday: '',
      hours_saturday: '',
      hours_sunday: '',
      active: true
    });
  };

  const toggleDay = (day) => {
    const isSelected = formData.days_of_week.includes(day);
    setFormData({
      ...formData,
      days_of_week: isSelected
        ? formData.days_of_week.filter(d => d !== day)
        : [...formData.days_of_week, day]
    });
  };

  const getDaysDisplay = (daysJSON) => {
    try {
      const days = typeof daysJSON === 'string' ? JSON.parse(daysJSON) : daysJSON;
      return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
    } catch {
      return 'N/A';
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Locations</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> Add Location
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
                    {location.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Address</p>
                    <p>{location.address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Days Available</p>
                    <p className="text-cyan-600 font-medium">{getDaysDisplay(location.days_of_week)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700 mb-1">Hours</p>
                    {location.hours_weekday && <p>Weekdays: {location.hours_weekday}</p>}
                    {location.hours_saturday && <p>Saturday: {location.hours_saturday}</p>}
                    {location.hours_sunday && <p>Sunday: {location.hours_sunday}</p>}
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
            <p className="text-gray-500">No locations yet. Add your first location!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedLocation ? 'Edit Location' : 'Add Location'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
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
              Address *
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week *</label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.days_of_week.includes(day.value)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
            {formData.days_of_week.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please select at least one day</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekday Hours</label>
              <input
                type="text"
                value={formData.hours_weekday}
                onChange={(e) => setFormData({ ...formData, hours_weekday: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="8:00 AM - 6:00 PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saturday Hours</label>
              <input
                type="text"
                value={formData.hours_saturday}
                onChange={(e) => setFormData({ ...formData, hours_saturday: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="9:00 AM - 3:00 PM or Closed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sunday Hours</label>
              <input
                type="text"
                value={formData.hours_sunday}
                onChange={(e) => setFormData({ ...formData, hours_sunday: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Closed"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={formData.days_of_week.length === 0} className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50">
              {selectedLocation ? 'Update' : 'Create'}
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
