import { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import Toast, { useToast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';

const Settings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast } = useToast();

  const settingsConfig = [
    { key: 'business_name', label: 'Business Name', type: 'text' },
    { key: 'business_phone', label: 'Primary Phone', type: 'text', placeholder: '+998 93 123 4567' },
    { key: 'business_phone_secondary', label: 'Secondary Phone', type: 'text', placeholder: '+998 90 987 6543' },
    { key: 'business_email', label: 'Email Address', type: 'email' },
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

    try {
      await adminApi.updateSettings(settings);
      showToast(t('admin.settings.saveSuccess'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast(t('admin.settings.saveFailed'), 'error');
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin.settings.siteSettings')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('admin.settings.contactInfo')}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('admin.settings.contactInfoDesc')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.businessName')}</label>
                <input
                  type="text"
                  value={settings.business_name || ''}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.emailAddress')}</label>
                <input
                  type="email"
                  value={settings.business_email || ''}
                  onChange={(e) => handleChange('business_email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.primaryPhone')}</label>
                <input
                  type="text"
                  value={settings.business_phone || ''}
                  onChange={(e) => handleChange('business_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                  placeholder="+998 93 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.secondaryPhone')}</label>
                <input
                  type="text"
                  value={settings.business_phone_secondary || ''}
                  onChange={(e) => handleChange('business_phone_secondary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                  placeholder="+998 90 987 6543"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('admin.settings.socialLinks')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.facebook')}</label>
                <input
                  type="url"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.twitter')}</label>
                <input
                  type="url"
                  value={settings.social_twitter || ''}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.settings.instagram')}</label>
                <input
                  type="url"
                  value={settings.social_instagram || ''}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent"
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
            className="flex items-center gap-2 bg-primary-800 text-white px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {t('admin.settings.saving')}
              </>
            ) : (
              <>
                <FaSave /> {t('admin.settings.saveSettings')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
