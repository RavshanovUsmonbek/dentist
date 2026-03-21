import { useState, useEffect } from 'react';
import { FaSave, FaUpload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import MultiLangInput from '../components/MultiLangInput';
import MultiLangRichText from '../components/MultiLangRichText';
import MultiLangArrayInput from '../components/MultiLangArrayInput';

const SiteContent = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const sections = [
    { id: 'hero', label: t('admin.content.hero') },
    { id: 'about', label: t('admin.content.about') },
    { id: 'services', label: t('admin.content.services') },
    { id: 'testimonials', label: t('admin.content.testimonials') },
    { id: 'contact', label: t('admin.content.contact') },
    { id: 'footer', label: t('admin.content.footer') },
  ];

  const contentFields = {
    hero: [
      { key: 'title', label: t('admin.content.fields.title'), type: 'text' },
      { key: 'subtitle', label: t('admin.content.fields.subtitle'), type: 'textarea' },
      { key: 'cta_primary_text', label: t('admin.content.fields.ctaPrimaryText'), type: 'text' },
      { key: 'cta_secondary_text', label: t('admin.content.fields.ctaSecondaryText'), type: 'text' },
    ],
    about: [
      { key: 'doctor_name', label: t('admin.content.fields.doctorName'), type: 'text' },
      { key: 'doctor_photo', label: t('admin.content.fields.doctorPhoto'), type: 'image' },
      { key: 'about_text', label: t('admin.content.fields.aboutText'), type: 'richtext' },
      { key: 'education', label: t('admin.content.fields.education'), type: 'array' },
      { key: 'experience', label: t('admin.content.fields.experience'), type: 'array' },
      { key: 'awards', label: t('admin.content.fields.awards'), type: 'array' },
    ],
    services: [
      { key: 'title', label: t('admin.content.fields.sectionTitle'), type: 'text' },
      { key: 'subtitle', label: t('admin.content.fields.sectionSubtitle'), type: 'textarea' },
    ],
    testimonials: [
      { key: 'title', label: t('admin.content.fields.sectionTitle'), type: 'text' },
      { key: 'subtitle', label: t('admin.content.fields.sectionSubtitle'), type: 'textarea' },
    ],
    contact: [
      { key: 'title', label: t('admin.content.fields.sectionTitle'), type: 'text' },
      { key: 'subtitle', label: t('admin.content.fields.sectionSubtitle'), type: 'textarea' },
      { key: 'form_title', label: t('admin.content.fields.formTitle'), type: 'text' },
      { key: 'success_message', label: t('admin.content.fields.successMessage'), type: 'textarea' },
      { key: 'hours_title', label: t('admin.content.fields.hoursTitle'), type: 'text' },
    ],
    footer: [
      { key: 'description', label: t('admin.content.fields.footerDescription'), type: 'textarea' },
      { key: 'copyright_text', label: t('admin.content.fields.copyrightText'), type: 'text' },
      { key: 'hours_title', label: t('admin.content.fields.hoursTitle'), type: 'text' },
    ],
  };

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await adminApi.getAllContent();
      const contentMap = {};
      (response.data || []).forEach(item => {
        if (!contentMap[item.section]) {
          contentMap[item.section] = {};
        }
        // Use translations if available, otherwise create {uz: value} from base value
        if (item.translations && Object.keys(item.translations).length > 0) {
          contentMap[item.section][item.key] = item.translations;
        } else {
          contentMap[item.section][item.key] = { uz: item.value || '' };
        }
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    setMessage('');

    try {
      await adminApi.updateContent(section, content[section] || {});
      setMessage(`${sections.find(s => s.id === section)?.label} ${t('admin.content.saveSuccess')}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save content:', error);
      setMessage(t('admin.content.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [key]: value,
      },
    });
  };

  const handleImageUpload = async (section, key, file) => {
    if (!file) return;

    setUploading(true);
    setMessage(t('admin.content.uploadingImage'));

    try {
      const uploadResponse = await adminApi.uploadFile(file);
      const imageUrl = uploadResponse.url || uploadResponse.data?.url;

      if (imageUrl) {
        handleChange(section, key, imageUrl);
        setMessage(t('admin.content.imageUploadSuccess'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(t('admin.content.imageUploadNoUrl'));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessage(t('admin.content.imageUploadFailed'));
    } finally {
      setUploading(false);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin.content.title')}</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          {contentFields[activeTab]?.map(({ key, label, type }) => (
            <div key={key}>
              {type === 'image' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <div className="space-y-3">
                    {(() => {
                      const raw = content[activeTab]?.[key];
                      const url = typeof raw === 'object' ? (raw?.uz || raw?.ru || raw?.en || '') : (raw || '');
                      return url ? (
                        <div className="relative inline-block">
                          <img
                            src={url.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url}`}
                            alt={label}
                            className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                          />
                        </div>
                      ) : null;
                    })()}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer">
                        <FaUpload />
                        <span>{content[activeTab]?.[key] ? t('admin.content.changeImage') : t('admin.content.uploadImage')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(activeTab, key, file);
                          }}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {(() => {
                        const raw = content[activeTab]?.[key];
                        const url = typeof raw === 'object' ? (raw?.uz || raw?.ru || raw?.en || '') : (raw || '');
                        return url ? (
                          <button
                            type="button"
                            onClick={() => handleChange(activeTab, key, '')}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            {t('admin.content.remove')}
                          </button>
                        ) : null;
                      })()}
                    </div>
                    {uploading && (
                      <p className="text-sm text-cyan-600">Uploading...</p>
                    )}
                  </div>
                </div>
              ) : type === 'richtext' ? (
                <MultiLangRichText
                  label={label}
                  value={content[activeTab]?.[key] || {}}
                  onChange={(value) => handleChange(activeTab, key, value)}
                />
              ) : type === 'array' ? (
                <MultiLangArrayInput
                  label={label}
                  value={content[activeTab]?.[key] || {}}
                  onChange={(value) => handleChange(activeTab, key, value)}
                />
              ) : (
                <MultiLangInput
                  label={label}
                  type={type}
                  value={content[activeTab]?.[key] || {}}
                  onChange={(value) => handleChange(activeTab, key, value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSave(activeTab)}
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {t('admin.content.saving')}
              </>
            ) : (
              <>
                <FaSave /> {t('admin.content.save')} {sections.find(s => s.id === activeTab)?.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteContent;
