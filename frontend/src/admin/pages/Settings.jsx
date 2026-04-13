import { useState, useEffect } from 'react';
import { FaSave, FaTelegram, FaEye, FaEyeSlash } from 'react-icons/fa';
import Toast, { useToast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';

const SECRET_SENTINEL = '__secret_set__';

/**
 * SecretField — secure input for sensitive values (tokens, passwords).
 *
 * Behaviour:
 * - When value === SECRET_SENTINEL (set on server): shows masked display + Change / Remove buttons.
 *   The actual secret is never sent back to the frontend.
 * - "Change" → reveals a password input (empty, ready for new value).
 * - "Cancel" → reverts to the masked display without touching the stored secret.
 * - "Remove" → clears the value (sends "" to backend on save, which removes the secret).
 * - When not set: shows password input directly.
 * - Show/hide toggle on the input.
 */
const SecretField = ({ label, fieldKey, value, onChange }) => {
  const isSet = value === SECRET_SENTINEL;
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleChange = () => {
    setEditing(true);
    onChange(fieldKey, '');
  };

  const handleCancel = () => {
    setEditing(false);
    onChange(fieldKey, SECRET_SENTINEL);
  };

  const handleRemove = () => {
    setEditing(false);
    onChange(fieldKey, '');
  };

  if (isSet && !editing) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-sm font-mono tracking-widest select-none">
            ••••••••••••••••••••
          </div>
          <button
            type="button"
            onClick={handleChange}
            className="px-3 py-2 text-sm font-medium text-primary-800 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Remove
          </button>
        </div>
        <p className="mt-1 text-xs text-green-600 font-medium">✓ Configured</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            autoComplete="new-password"
            spellCheck={false}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-800/30 focus:border-transparent font-mono text-sm"
            placeholder={isSet ? '' : 'Enter value…'}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {visible ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
          </button>
        </div>
        {editing && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
        )}
      </div>
      {!isSet && !value && (
        <p className="mt-1 text-xs text-gray-400">Not configured — notifications are disabled.</p>
      )}
    </div>
  );
};

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
      // Strip sentinel values — never send them back; backend would reject them anyway,
      // but we filter here too so unchanged secrets are omitted from the request entirely.
      const payload = Object.fromEntries(
        Object.entries(settings).filter(([, v]) => v !== SECRET_SENTINEL)
      );
      await adminApi.updateSettings(payload);
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

          {/* Telegram Notifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaTelegram className="text-[#2CA5E0]" /> Telegram Notifications
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Contact form submissions will be sent to your Telegram chat. Create a bot via{' '}
              <span className="font-medium text-gray-700">@BotFather</span>, then obtain your chat ID.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <SecretField
                label="Bot Token"
                fieldKey="telegram_bot_token"
                value={settings.telegram_bot_token ?? ''}
                onChange={handleChange}
              />
              <SecretField
                label="Chat ID"
                fieldKey="telegram_chat_id"
                value={settings.telegram_chat_id ?? ''}
                onChange={handleChange}
              />
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
