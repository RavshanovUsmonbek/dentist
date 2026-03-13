import { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const settingsConfig = [
    { key: 'business_name', label: 'Business Name', type: 'text' },
    { key: 'business_phone', label: 'Phone Number', type: 'text' },
    { key: 'business_email', label: 'Email Address', type: 'email' },
    { key: 'business_address_line1', label: 'Address Line 1', type: 'text' },
    { key: 'business_address_line2', label: 'Address Line 2', type: 'text' },
    { key: 'emergency_phone', label: 'Emergency Phone', type: 'text' },
    { key: 'hours_weekday', label: 'Weekday Hours', type: 'text' },
    { key: 'hours_saturday', label: 'Saturday Hours', type: 'text' },
    { key: 'hours_sunday', label: 'Sunday Hours', type: 'text' },
    { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
    { key: 'social_twitter', label: 'Twitter URL', type: 'url' },
    { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      const settingsMap = {};
      (response.data || []).forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await adminApi.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Site Settings</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Business Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {settingsConfig.slice(0, 5).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={settings[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={settings.emergency_phone || ''}
                  onChange={(e) => handleChange('emergency_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Office Hours</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monday - Friday</label>
                <input
                  type="text"
                  value={settings.hours_weekday || ''}
                  onChange={(e) => handleChange('hours_weekday', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="8:00 AM - 6:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saturday</label>
                <input
                  type="text"
                  value={settings.hours_saturday || ''}
                  onChange={(e) => handleChange('hours_saturday', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="9:00 AM - 3:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sunday</label>
                <input
                  type="text"
                  value={settings.hours_sunday || ''}
                  onChange={(e) => handleChange('hours_sunday', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Closed"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Social Media Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="url"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="url"
                  value={settings.social_twitter || ''}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                  type="url"
                  value={settings.social_instagram || ''}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
