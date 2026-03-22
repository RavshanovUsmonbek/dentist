import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from './RichTextEditor';

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

const MultiLangRichText = ({ value = {}, onChange, label, required = false }) => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(i18n.language);
  useEffect(() => { setActiveTab(i18n.language); }, [i18n.language]);

  const handleChange = (lang, newValue) => {
    onChange({
      ...value,
      [lang]: newValue
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Language Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveTab(lang.code)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === lang.code
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>

      {/* RichText Editors */}
      {LANGUAGES.map((lang) => (
        <div
          key={lang.code}
          className={activeTab === lang.code ? 'block' : 'hidden'}
        >
          <RichTextEditor
            value={value[lang.code] || ''}
            onChange={(newValue) => handleChange(lang.code, newValue)}
          />
        </div>
      ))}

      <p className="text-xs text-gray-500 mt-1">
        Uzbek translation is required. Other languages are optional.
      </p>
    </div>
  );
};

export default MultiLangRichText;
