import { useState, useEffect } from 'react';
import { FaSave, FaUpload } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';

const SiteContent = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const sections = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'about', label: 'About Section' },
    { id: 'gallery', label: 'Gallery Content' },
    { id: 'contact', label: 'Contact Section' },
    { id: 'footer', label: 'Footer' },
  ];

  const contentFields = {
    hero: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'cta_primary_text', label: 'Primary Button Text', type: 'text' },
      { key: 'cta_secondary_text', label: 'Secondary Button Text', type: 'text' },
    ],
    about: [
      { key: 'doctor_name', label: 'Doctor Name', type: 'text' },
      { key: 'doctor_photo', label: 'Doctor Photo', type: 'image' },
      { key: 'welcome_text', label: 'Welcome Paragraph', type: 'textarea' },
      { key: 'philosophy_text', label: 'Philosophy Paragraph', type: 'textarea' },
      { key: 'education', label: 'Education (JSON array)', type: 'textarea' },
      { key: 'experience', label: 'Experience (JSON array)', type: 'textarea' },
      { key: 'awards', label: 'Awards (JSON array)', type: 'textarea' },
    ],
    gallery: [
      { key: 'title_general', label: 'General Gallery Title', type: 'text' },
      { key: 'subtitle_general', label: 'General Gallery Subtitle', type: 'textarea' },
      { key: 'title_case_studies', label: 'Case Studies Title', type: 'text' },
      { key: 'subtitle_case_studies', label: 'Case Studies Subtitle', type: 'textarea' },
      { key: 'title_diplomas', label: 'Diplomas & Certifications Title', type: 'text' },
      { key: 'subtitle_diplomas', label: 'Diplomas & Certifications Subtitle', type: 'textarea' },
      { key: 'title_conferences', label: 'Conferences & Events Title', type: 'text' },
      { key: 'subtitle_conferences', label: 'Conferences & Events Subtitle', type: 'textarea' },
    ],
    contact: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'form_title', label: 'Form Title', type: 'text' },
      { key: 'success_message', label: 'Success Message', type: 'textarea' },
      { key: 'emergency_text', label: 'Emergency Text', type: 'textarea' },
    ],
    footer: [
      { key: 'description', label: 'Footer Description', type: 'textarea' },
      { key: 'copyright_text', label: 'Copyright Text', type: 'text' },
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
        contentMap[item.section][item.key] = item.value;
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
      setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save content:', error);
      setMessage('Failed to save content. Please try again.');
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
    setMessage('Uploading image...');

    try {
      const uploadResponse = await adminApi.uploadFile(file);
      const imageUrl = uploadResponse.url || uploadResponse.data?.url;

      if (imageUrl) {
        handleChange(section, key, imageUrl);
        setMessage('Image uploaded successfully! Don\'t forget to save.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to upload image. No URL returned.');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessage('Failed to upload image. Please try again.');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Site Content</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {type === 'image' ? (
                <div className="space-y-3">
                  {content[activeTab]?.[key] && (
                    <div className="relative inline-block">
                      <img
                        src={`${API_URL.replace('/api', '')}${content[activeTab][key]}`}
                        alt={label}
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer">
                      <FaUpload />
                      <span>{content[activeTab]?.[key] ? 'Change Image' : 'Upload Image'}</span>
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
                    {content[activeTab]?.[key] && (
                      <button
                        type="button"
                        onClick={() => handleChange(activeTab, key, '')}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <p className="text-sm text-cyan-600">Uploading...</p>
                  )}
                </div>
              ) : type === 'textarea' ? (
                <textarea
                  value={content[activeTab]?.[key] || ''}
                  onChange={(e) => handleChange(activeTab, key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={key.includes('education') || key.includes('experience') || key.includes('awards') ? 3 : 4}
                />
              ) : (
                <input
                  type="text"
                  value={content[activeTab]?.[key] || ''}
                  onChange={(e) => handleChange(activeTab, key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              )}
              {key.includes('education') || key.includes('experience') || key.includes('awards') ? (
                <p className="text-xs text-gray-500 mt-1">
                  Format: ["Item 1", "Item 2", "Item 3"]
                </p>
              ) : null}
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
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save {sections.find(s => s.id === activeTab)?.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteContent;
