import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { prepareTranslationsForAPI, extractTranslationsFromAPI } from '../utils/translationHelpers';

const generateSlug = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_');
};

const LANGS = [
  { code: 'uz', label: 'Uzbek', flag: '🇺🇿', required: true },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', required: false },
  { code: 'en', label: 'English', flag: '🇬🇧', required: false },
];

const GalleryCategories = () => {
  const { i18n } = useTranslation();

  const getTranslated = (category, field) => {
    const lang = i18n.language;
    return category.translations?.[field]?.[lang]
      || category.translations?.[field]?.uz
      || category[field]
      || '';
  };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    label: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    enabled: true
  });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getGalleryCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load gallery categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiData = prepareTranslationsForAPI(formData, ['label', 'description']);
      const dataToSend = {
        ...apiData,
        slug: generateSlug(formData.label.uz || formData.label.en || formData.label.ru || '')
      };
      if (selectedCategory) {
        await adminApi.updateGalleryCategory(selectedCategory.id, dataToSend);
      } else {
        await adminApi.createGalleryCategory(dataToSend);
      }
      setIsModalOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    const extracted = extractTranslationsFromAPI(category, ['label', 'description']);
    setFormData({
      label: extracted.label,
      description: extracted.description,
      enabled: category.enabled
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteGalleryCategory(selectedCategory.id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleToggleEnabled = async (category) => {
    try {
      await adminApi.updateGalleryCategory(category.id, {
        slug: category.slug,
        label: category.label,
        description: category.description || '',
        enabled: !category.enabled,
        display_order: category.display_order,
        translations: category.translations || {}
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({ label: { uz: '', ru: '', en: '' }, description: { uz: '', ru: '', en: '' }, enabled: true });
  };

  const setLangField = (field, lang, value) => {
    setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-primary-800">Gallery Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage gallery categories and their visibility</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
        >
          <FaPlus className="text-xs" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                  No gallery categories yet. Add your first category!
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const translations = category.translations || {};
                const labelUz = translations.label?.uz || category.label || '';
                const labelRu = translations.label?.ru || '';
                const labelEn = translations.label?.en || '';

                return (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <FaGripVertical className="text-gray-300 cursor-move" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {labelUz && (
                          <p className="text-sm text-gray-800 font-medium">
                            <span className="text-gray-400 mr-1.5">🇺🇿</span>{labelUz}
                          </p>
                        )}
                        {labelRu && (
                          <p className="text-sm text-gray-500">
                            <span className="text-gray-400 mr-1.5">🇷🇺</span>{labelRu}
                          </p>
                        )}
                        {labelEn && (
                          <p className="text-sm text-gray-500">
                            <span className="text-gray-400 mr-1.5">🇬🇧</span>{labelEn}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{category.slug}</code>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {getTranslated(category, 'description') || <span className="italic text-gray-300">No description</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleEnabled(category)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          category.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.enabled ? <><FaEye /> Enabled</> : <><FaEyeSlash /> Disabled</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => { setSelectedCategory(category); setIsDeleteOpen(true); }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category Name — all 3 languages visible */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Category Name <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {LANGS.map(({ code, label, flag, required }) => (
                <div key={code} className="flex items-center gap-2">
                  <span className="text-lg w-7 flex-shrink-0">{flag}</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={formData.label[code]}
                      onChange={(e) => setLangField('label', code, e.target.value)}
                      required={required}
                      placeholder={`${label}${required ? ' (required)' : ' (optional)'}`}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            {(formData.label.uz || formData.label.en || formData.label.ru) && (
              <p className="text-xs text-gray-400 mt-2">
                Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {generateSlug(formData.label.uz || formData.label.en || formData.label.ru)}
                </code>
              </p>
            )}
          </div>

          {/* Description — all 3 languages visible */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Description</p>
            <div className="space-y-2">
              {LANGS.map(({ code, label, flag }) => (
                <div key={code} className="flex items-start gap-2">
                  <span className="text-lg w-7 flex-shrink-0 mt-2">{flag}</span>
                  <textarea
                    value={formData.description[code]}
                    onChange={(e) => setLangField('description', code, e.target.value)}
                    placeholder={`${label} (optional)`}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-primary-800 rounded focus:ring-primary-800/30"
            />
            <label htmlFor="enabled" className="text-sm text-gray-700">Enabled (show on public site)</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-900 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory ? getTranslated(selectedCategory, 'label') : ''}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default GalleryCategories;
