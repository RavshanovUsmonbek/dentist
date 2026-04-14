import { useState, useEffect } from 'react';
import { FaSave, FaUpload, FaTooth, FaAward, FaMicroscope, FaShieldAlt } from 'react-icons/fa';
import Toast, { useToast } from '../components/Toast';
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
  const { toast, showToast } = useToast();
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
      { key: 'stats_years_experience', label: 'Years of Experience (e.g. 15+)', type: 'text' },
      { key: 'stats_patients', label: 'Patients Served (e.g. 2k+)', type: 'text' },
      { key: 'stats_satisfaction', label: 'Satisfaction % (e.g. 100%)', type: 'text' },
      { key: 'features', type: 'feature_cards', label: 'Feature Cards' },
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
    ],
    footer: [
      { key: 'description', label: t('admin.content.fields.footerDescription'), type: 'textarea' },
      { key: 'copyright_text', label: t('admin.content.fields.copyrightText'), type: 'text' },
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
        if (item.type === 'json') {
          try { contentMap[item.section][item.key] = JSON.parse(item.value || '[]'); }
          catch { contentMap[item.section][item.key] = []; }
        } else if (item.translations && Object.keys(item.translations).length > 0) {
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

    try {
      const sectionData = { ...content[section] };
      // Serialize any JSON-array fields back to strings for the backend
      Object.keys(sectionData).forEach(k => {
        if (Array.isArray(sectionData[k])) sectionData[k] = JSON.stringify(sectionData[k]);
      });
      await adminApi.updateContent(section, sectionData);
      showToast(`${sections.find(s => s.id === section)?.label} ${t('admin.content.saveSuccess')}`);
    } catch (error) {
      console.error('Failed to save content:', error);
      showToast(t('admin.content.saveFailed'), 'error');
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

    try {
      const uploadResponse = await adminApi.uploadFile(file);
      const imageUrl = uploadResponse.url || uploadResponse.data?.url;

      if (imageUrl) {
        handleChange(section, key, imageUrl);
        showToast(t('admin.content.imageUploadSuccess'));
      } else {
        showToast(t('admin.content.imageUploadNoUrl'), 'error');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast(t('admin.content.imageUploadFailed'), 'error');
    } finally {
      setUploading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin.content.title')}</h1>


      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-2 sm:px-6 sm:py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'border-primary-800 text-primary-800'
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
                            className="w-full max-w-xs h-40 sm:w-48 sm:h-48 object-cover rounded-lg border-2 border-gray-300"
                          />
                        </div>
                      ) : null;
                    })()}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors cursor-pointer">
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
                      <p className="text-sm text-primary-800">Uploading...</p>
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
              ) : type === 'feature_cards' ? (
                (() => {
                  const ICONS = [FaTooth, FaAward, FaMicroscope, FaShieldAlt];
                  const featuresArr = Array.isArray(content[activeTab]?.[key])
                    ? content[activeTab][key]
                    : [];
                  const updateFeature = (i, field, val) => {
                    const updated = featuresArr.map((f, j) => j === i ? { ...f, [field]: val } : f);
                    handleChange(activeTab, key, updated);
                  };
                  const addFeature = () => handleChange(activeTab, key, [
                    ...featuresArr,
                    { title: { uz: '', ru: '', en: '' }, desc: { uz: '', ru: '', en: '' } }
                  ]);
                  const removeFeature = (i) => handleChange(activeTab, key, featuresArr.filter((_, j) => j !== i));
                  return (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Feature Cards</p>
                      <div className="space-y-4">
                        {featuresArr.map((feature, i) => {
                          const Icon = ICONS[i % ICONS.length];
                          const currentTitle = feature.title?.uz || feature.title?.en || feature.title?.ru || `Card ${i + 1}`;
                          return (
                            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                    <Icon className="text-primary-700 text-sm" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{currentTitle}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFeature(i)}
                                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <MultiLangInput
                                label="Title"
                                type="text"
                                value={feature.title || {}}
                                onChange={(val) => updateFeature(i, 'title', val)}
                              />
                              <MultiLangInput
                                label="Description"
                                type="text"
                                value={feature.desc || {}}
                                onChange={(val) => updateFeature(i, 'desc', val)}
                              />
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary-800 bg-primary-50 hover:bg-primary-100 border-2 border-dashed border-primary-200 hover:border-primary-300 px-4 py-3 rounded-xl transition-colors"
                        >
                          + Add Card
                        </button>
                      </div>
                    </div>
                  );
                })()
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
            className="flex items-center gap-2 bg-primary-800 text-white px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50"
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
