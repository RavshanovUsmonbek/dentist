import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaImage, FaTimes, FaGripVertical, FaEye, FaEyeSlash } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

// Helper function to generate slug from label
const generateSlug = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace hyphens with underscores
    .replace(/_+/g, '_'); // Replace multiple underscores with single
};

const Gallery = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'categories'

  // Image states
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDeleteOpen, setIsCategoryDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    label: '',
    description: '',
    enabled: true
  });

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
        setFormData({ ...formData, filename: response.data.url });
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
      setIsModalOpen(false);
      resetForm();
      loadGallery();
    } catch (error) {
      console.error('Failed to save image:', error);
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
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteGalleryImage(selectedImage.id);
      loadGallery();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setFormData({ filename: '', alt_text: '', category: 'general', tags: '', active: true });
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCategoryFormData({ label: '', description: '', enabled: true });
  };

  // Category management handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...categoryFormData,
        slug: generateSlug(categoryFormData.label)
      };

      if (selectedCategory) {
        await adminApi.updateGalleryCategory(selectedCategory.id, dataToSend);
      } else {
        await adminApi.createGalleryCategory(dataToSend);
      }
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleCategoryEdit = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      label: category.label,
      description: category.description || '',
      enabled: category.enabled
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryDelete = async () => {
    try {
      await adminApi.deleteGalleryCategory(selectedCategory.id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleToggleCategoryEnabled = async (category) => {
    try {
      await adminApi.updateGalleryCategory(category.id, {
        slug: category.slug,
        label: category.label,
        description: category.description || '',
        enabled: !category.enabled,
        display_order: category.display_order
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const getImageUrl = (filename) => {
    if (filename.startsWith('http')) {
      return filename;
    }
    // Get backend API URL and construct full image URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = API_URL.replace('/api', ''); // Remove /api suffix

    if (filename.startsWith('/')) {
      return `${baseUrl}${filename}`;
    }
    return `${baseUrl}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  // Filter images by category
  const filteredImages = categoryFilter === 'all'
    ? images
    : images.filter(img => img.category === categoryFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
        {activeTab === 'images' ? (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <FaPlus /> Add Image
          </button>
        ) : (
          <button
            onClick={() => { resetCategoryForm(); setIsCategoryModalOpen(true); }}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <FaPlus /> Add Category
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
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Images ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {/* Images Tab */}
      {activeTab === 'images' && (
        <>
          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>
            <span className="ml-3 text-sm text-gray-600">
              Showing {filteredImages.length} of {images.length} images
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => {
              const categoryLabel = categories.find(c => c.slug === (image.category || 'general'))?.label || image.category || 'General';
              return (
                <div key={image.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                <img
                  src={getImageUrl(image.filename)}
                  alt={image.alt_text}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full"><div class="text-center text-gray-400"><svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg><p class="text-sm">Image not found</p></div></div>`;
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 text-xs rounded-full bg-cyan-600 text-white">
                  {categoryLabel}
                </div>
                <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${image.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {image.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2">{image.alt_text}</p>
                {image.tags && (
                  <p className="text-xs text-gray-500 mt-1">Tags: {image.tags}</p>
                )}
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => handleEdit(image)} className="text-blue-600 hover:text-blue-800 p-2">
                    <FaEdit />
                  </button>
                  <button onClick={() => { setSelectedImage(image); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-2">
                    <FaTrash />
                  </button>
                </div>
                  </div>
                </div>
              );
            })}
            {filteredImages.length === 0 && images.length > 0 && (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                <FaImage className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images in this category.</p>
              </div>
            )}
            {images.length === 0 && (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                <FaImage className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images yet. Add your first gallery image!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No gallery categories yet. Add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <FaGripVertical className="text-gray-400 cursor-move" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{category.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <code className="bg-gray-50 px-1 py-0.5 rounded">{category.slug}</code>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{category.description || 'No description'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleCategoryEnabled(category)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          category.enabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {category.enabled ? (
                          <>
                            <FaEye /> Enabled
                          </>
                        ) : (
                          <>
                            <FaEyeSlash /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCategoryEdit(category)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => { setSelectedCategory(category); setIsCategoryDeleteOpen(true); }}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedImage ? 'Edit Image' : 'Add Image'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            {formData.filename ? (
              <div className="relative">
                <img
                  src={getImageUrl(formData.filename)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, filename: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-600 border-t-transparent"></div>
                  ) : (
                    <>
                      <FaUpload className="text-3xl text-gray-400 mb-2" />
                      <span className="text-gray-500">Click to upload an image</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Or enter image URL</label>
            <input
              type="text"
              value={formData.filename}
              onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="/images/gallery/example.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text (Description)</label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {categories.length === 0 ? (
                <option value="general">General</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Manage categories in the Categories tab
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., orthodontics, smile makeover"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">{selectedImage ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => { setIsCategoryModalOpen(false); resetCategoryForm(); }}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryFormData.label}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., Before & After, Certificates"
              required
            />
            {categoryFormData.label && (
              <p className="text-xs text-gray-500 mt-1">
                Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">{generateSlug(categoryFormData.label)}</code>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows="3"
              placeholder="Brief description of this category"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-enabled"
              checked={categoryFormData.enabled}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, enabled: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="cat-enabled" className="text-sm text-gray-700">
              Enabled (show on public site)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { setIsCategoryModalOpen(false); resetCategoryForm(); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              {selectedCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Delete Confirmation */}
      <ConfirmDialog
        isOpen={isCategoryDeleteOpen}
        onClose={() => setIsCategoryDeleteOpen(false)}
        onConfirm={handleCategoryDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.label}"? This action cannot be undone. Gallery images using this category will remain but may need reassignment.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Gallery;
