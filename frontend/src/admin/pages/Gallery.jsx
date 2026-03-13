import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaImage } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    filename: '',
    alt_text: '',
    active: true
  });

  useEffect(() => {
    loadGallery();
  }, []);

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
    setFormData({ filename: '', alt_text: '', active: true });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gallery</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
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
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${image.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {image.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 line-clamp-2">{image.alt_text}</p>
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
        ))}
        {images.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
            <FaImage className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No images yet. Add your first gallery image!</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Gallery;
