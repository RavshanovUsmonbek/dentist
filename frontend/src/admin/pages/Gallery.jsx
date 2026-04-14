import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaImage, FaGripVertical, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import { prepareTranslationsForAPI, extractTranslationsFromAPI } from '../utils/translationHelpers';
import Toast, { useToast } from '../components/Toast';

const LANGS = [
  { code: 'uz', label: 'Uzbek', flag: '🇺🇿', required: true },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', required: false },
  { code: 'en', label: 'English', flag: '🇬🇧', required: false },
];

const generateSlug = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_');
};

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useToast();
  const [activeTab, setActiveTab] = useState('images');

  // Image states
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImageDrawerOpen, setIsImageDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    filename: '',
    alt_text: '',
    category: 'general',
    tags: '',
    active: true
  });

  // Category states
  const [categories, setCategories] = useState([]);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    label: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    enabled: true
  });
  const [categoryActiveLang, setCategoryActiveLang] = useState('uz');

  useEffect(() => {
    loadGallery();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getGalleryCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load gallery categories:', error);
    }
  };

  const loadGallery = async () => {
    try {
      const response = await adminApi.getGallery();
      setImages(response.data || []);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await adminApi.uploadFile(file);
      if (response.data) {
        setFormData(prev => ({ ...prev, filename: response.data.url }));
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedImage) {
        await adminApi.updateGalleryImage(selectedImage.id, formData);
      } else {
        await adminApi.createGalleryImage(formData);
      }
      setIsImageDrawerOpen(false);
      resetForm();
      loadGallery();
      showToast(selectedImage ? 'Image updated' : 'Image uploaded');
    } catch (error) {
      console.error('Failed to save image:', error);
      showToast('Failed to save image', 'error');
    }
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setFormData({
      filename: image.filename,
      alt_text: image.alt_text,
      category: image.category || 'general',
      tags: image.tags || '',
      active: image.active
    });
    setIsImageDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteGalleryImage(id);
      loadGallery();
      showToast('Image deleted');
    } catch (error) {
      console.error('Failed to delete image:', error);
      showToast('Failed to delete image', 'error');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setFormData({ filename: '', alt_text: '', category: 'general', tags: '', active: true });
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCategoryFormData({ label: { uz: '', ru: '', en: '' }, description: { uz: '', ru: '', en: '' }, enabled: true });
  };

  const setCategoryLangField = (field, lang, value) => {
    setCategoryFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const apiData = prepareTranslationsForAPI(categoryFormData, ['label', 'description']);
      const dataToSend = {
        ...apiData,
        slug: generateSlug(categoryFormData.label.uz || categoryFormData.label.en || categoryFormData.label.ru || '')
      };
      if (selectedCategory) {
        await adminApi.updateGalleryCategory(selectedCategory.id, dataToSend);
      } else {
        await adminApi.createGalleryCategory(dataToSend);
      }
      setIsCategoryDrawerOpen(false);
      resetCategoryForm();
      loadCategories();
      showToast(selectedCategory ? 'Category updated' : 'Category created');
    } catch (error) {
      console.error('Failed to save category:', error);
      showToast(error.response?.data?.error || 'Failed to save category', 'error');
    }
  };

  const handleCategoryEdit = (category) => {
    setSelectedCategory(category);
    const extracted = extractTranslationsFromAPI(category, ['label', 'description']);
    setCategoryFormData({
      label: extracted.label,
      description: extracted.description,
      enabled: category.enabled
    });
    setIsCategoryDrawerOpen(true);
  };

  const handleCategoryDelete = async (id) => {
    try {
      await adminApi.deleteGalleryCategory(id);
      loadCategories();
      showToast('Category deleted');
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const handleToggleCategoryEnabled = async (category) => {
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
      showToast('Failed to toggle category', 'error');
    }
  };

  const getImageUrl = (filename) => {
    if (filename.startsWith('http')) return filename;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = API_URL.replace('/api', '');
    if (filename.startsWith('/')) return `${baseUrl}${filename}`;
    return `${baseUrl}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  const filteredImages = categoryFilter === 'all'
    ? images
    : images.filter(img => img.category === categoryFilter);

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.gallery.galleryManagement')}</h1>
        {activeTab === 'images' ? (
          <button
            onClick={() => { resetForm(); setIsImageDrawerOpen(true); }}
            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <FaPlus className="text-xs" /> {t('admin.gallery.addImage')}
          </button>
        ) : (
          <button
            onClick={() => { resetCategoryForm(); setIsCategoryDrawerOpen(true); }}
            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <FaPlus className="text-xs" /> {t('admin.gallery.addCategory')}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'images'
                ? 'border-primary-800 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.gallery.imagesTab')} ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-primary-800 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.gallery.categoriesTab')} ({categories.length})
          </button>
        </nav>
      </div>

      {/* Images Tab */}
      {activeTab === 'images' && (
        <>
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">{t('admin.gallery.filterByCategory')}</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
            >
              <option value="all">{t('admin.gallery.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400">
              {filteredImages.length} / {images.length} {t('admin.gallery.images')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredImages.map((image) => {
              const categoryLabel = categories.find(c => c.slug === (image.category || 'general'))?.label || image.category || 'General';
              return (
                <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={getImageUrl(image.filename)}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full"><div class="text-center text-gray-400"><svg class="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg><p class="text-xs">Not found</p></div></div>`;
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 text-xs rounded-full bg-primary-800/80 text-white backdrop-blur-sm">
                      {categoryLabel}
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full ${image.active ? 'bg-green-600/80 text-white' : 'bg-gray-600/80 text-white'} backdrop-blur-sm`}>
                      {image.active ? t('common.active') : t('common.inactive')}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-1">{image.alt_text}</p>
                    {image.tags && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">Tags: {image.tags}</p>
                    )}
                    <div className="flex justify-end gap-1 mt-2">
                      <button onClick={() => handleEdit(image)} className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                        <FaEdit className="text-xs" />
                      </button>
                      <InlineConfirm onConfirm={() => handleDelete(image.id)}>
                        <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <FaTrash className="text-xs" />
                        </button>
                      </InlineConfirm>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredImages.length === 0 && (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <FaImage className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{images.length > 0 ? t('admin.gallery.noImagesInCategory') : t('admin.gallery.noImages')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3 md:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.gallery.order')}</th>
                <th className="px-3 py-3 md:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.gallery.categoryName')}</th>
                <th className="px-3 py-3 md:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.gallery.categoryDescription')}</th>
                <th className="px-3 py-3 md:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.status')}</th>
                <th className="px-3 py-3 md:px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-8 md:px-6 text-center text-gray-500 text-sm">
                    {t('admin.gallery.noCategories')}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <FaGripVertical className="text-gray-300 cursor-move" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {category.translations?.label?.[i18n.language] || category.translations?.label?.uz || category.label || ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          <code className="bg-gray-50 px-1 py-0.5 rounded">{category.slug}</code>
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {(category.translations?.description?.[i18n.language] || category.translations?.description?.uz || category.description) || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <button
                        onClick={() => handleToggleCategoryEnabled(category)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          category.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.enabled ? <><FaEye className="text-xs" /> Enabled</> : <><FaEyeSlash className="text-xs" /> Disabled</>}
                      </button>
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleCategoryEdit(category)} className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                          <FaEdit className="text-sm" />
                        </button>
                        <InlineConfirm onConfirm={() => handleCategoryDelete(category.id)}>
                          <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <FaTrash className="text-sm" />
                          </button>
                        </InlineConfirm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Image Drawer */}
      <Drawer
        isOpen={isImageDrawerOpen}
        onClose={() => { setIsImageDrawerOpen(false); resetForm(); }}
        title={selectedImage ? t('admin.gallery.editImage') : t('admin.gallery.addImage')}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setIsImageDrawerOpen(false); resetForm(); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              form="image-form"
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedImage ? t('common.edit') : t('common.create')}
            </button>
          </div>
        }
      >
        <form id="image-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            {formData.filename ? (
              <div className="relative">
                <img
                  src={getImageUrl(formData.filename)}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, filename: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 text-xs"
                >
                  <FaTrash />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-800 border-t-transparent"></div>
                  ) : (
                    <>
                      <FaUpload className="text-2xl text-gray-300" />
                      <span className="text-sm text-gray-500">{t('admin.gallery.uploadClick')}</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gallery.enterUrl')}</label>
            <input
              type="text"
              value={formData.filename}
              onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              placeholder="/images/gallery/example.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gallery.altTextDesc')}</label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gallery.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
            >
              {categories.length === 0 ? (
                <option value="general">General</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gallery.tags')}</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              placeholder="e.g., orthodontics, smile makeover"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary-800"
            />
            <label htmlFor="active" className="text-sm text-gray-700">{t('common.active')}</label>
          </div>
        </form>
      </Drawer>

      {/* Category Drawer */}
      <Drawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => { setIsCategoryDrawerOpen(false); resetCategoryForm(); }}
        title={selectedCategory ? t('admin.gallery.editCategory') : t('admin.gallery.addCategory')}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setIsCategoryDrawerOpen(false); resetCategoryForm(); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              form="category-form"
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedCategory ? t('common.edit') : t('common.create')}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleCategorySubmit} className="space-y-5">
          {/* Language tabs */}
          <div className="flex border-b border-gray-200">
            {LANGS.map(({ code, flag, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setCategoryActiveLang(code)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  categoryActiveLang === code
                    ? 'border-primary-800 text-primary-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{flag}</span> {label}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.gallery.categoryName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryFormData.label[categoryActiveLang]}
              onChange={(e) => setCategoryLangField('label', categoryActiveLang, e.target.value)}
              required={categoryActiveLang === 'uz'}
              placeholder={categoryActiveLang === 'uz' ? 'Required' : 'Optional'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 focus:outline-none"
            />
            {(categoryFormData.label.uz || categoryFormData.label.en || categoryFormData.label.ru) && (
              <p className="text-xs text-gray-400 mt-2">
                Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {generateSlug(categoryFormData.label.uz || categoryFormData.label.en || categoryFormData.label.ru)}
                </code>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gallery.categoryDescription')}</label>
            <textarea
              value={categoryFormData.description[categoryActiveLang]}
              onChange={(e) => setCategoryLangField('description', categoryActiveLang, e.target.value)}
              placeholder="Optional"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-enabled"
              checked={categoryFormData.enabled}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary-800"
            />
            <label htmlFor="cat-enabled" className="text-sm text-gray-700">
              {t('admin.gallery.enabled')}
            </label>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Gallery;
