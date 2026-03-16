import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

const MultiLangArrayInput = ({ value = {}, onChange, label }) => {
  const [activeTab, setActiveTab] = useState('uz');

  // value structure: { uz: ['item1', 'item2'], ru: ['item1', 'item2'], en: ['item1', 'item2'] }

  const handleAddItem = (lang) => {
    const currentItems = value[lang] || [];
    onChange({
      ...value,
      [lang]: [...currentItems, '']
    });
  };

  const handleRemoveItem = (lang, index) => {
    const currentItems = value[lang] || [];
    onChange({
      ...value,
      [lang]: currentItems.filter((_, i) => i !== index)
    });
  };

  const handleUpdateItem = (lang, index, newValue) => {
    const currentItems = value[lang] || [];
    const updated = [...currentItems];
    updated[index] = newValue;
    onChange({
      ...value,
      [lang]: updated
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
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

      {/* Array Items */}
      {LANGUAGES.map((lang) => {
        const items = value[lang.code] || [];

        return (
          <div
            key={lang.code}
            className={activeTab === lang.code ? 'block space-y-3' : 'hidden'}
          >
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    {label} {index + 1}
                  </label>
                  <textarea
                    value={item}
                    onChange={(e) => handleUpdateItem(lang.code, index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(lang.code, index)}
                  className="mt-7 p-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddItem(lang.code)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 hover:text-cyan-800 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
            >
              <FaPlus /> Add {label}
            </button>

            {items.length === 0 && (
              <p className="text-sm text-gray-500 italic">No items yet. Click "Add {label}" to create one.</p>
            )}
          </div>
        );
      })}

      <p className="text-xs text-gray-500 mt-1">
        Uzbek translation is required. Other languages are optional.
      </p>
    </div>
  );
};

export default MultiLangArrayInput;
