import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Testimonials = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState([]);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    initials: '',
    rating: 5,
    text: '',
    active: true
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [testimonialsRes, pendingRes] = await Promise.all([
        adminApi.getTestimonials(),
        adminApi.getPendingTestimonials()
      ]);
      setTestimonials(testimonialsRes.data || []);
      setPendingTestimonials(pendingRes.data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveTestimonial(id);
      loadAll();
    } catch (error) {
      console.error('Failed to approve testimonial:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectTestimonial(id);
      loadAll();
    } catch (error) {
      console.error('Failed to reject testimonial:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        initials: formData.initials || formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
      if (selectedTestimonial) {
        await adminApi.updateTestimonial(selectedTestimonial.id, data);
      } else {
        await adminApi.createTestimonial(data);
      }
      setIsModalOpen(false);
      resetForm();
      loadAll();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    }
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      initials: testimonial.initials,
      rating: testimonial.rating,
      text: testimonial.text,
      active: testimonial.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteTestimonial(selectedTestimonial.id);
      loadAll();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  const resetForm = () => {
    setSelectedTestimonial(null);
    setFormData({ name: '', initials: '', rating: 5, text: '', active: true });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ));
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
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.testimonials.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> {t('admin.testimonials.addTestimonial')}
        </button>
      </div>

      {/* Pending Reviews */}
      {pendingTestimonials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {t('admin.testimonials.pendingReviews')}
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-0.5 rounded-full">
              {pendingTestimonials.length}
            </span>
          </h2>
          <div className="grid gap-4">
            {pendingTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-700 font-semibold">{testimonial.initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{testimonial.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <FaCheck /> {t('admin.testimonials.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(testimonial.id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <FaTimes /> {t('admin.testimonials.reject')}
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-cyan-600 font-semibold">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{testimonial.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${testimonial.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {testimonial.active ? t('common.active') : t('common.inactive')}
                </span>
                <button onClick={() => handleEdit(testimonial)} className="text-blue-600 hover:text-blue-800 p-2">
                  <FaEdit />
                </button>
                <button onClick={() => { setSelectedTestimonial(testimonial); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-2">
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="mt-4 text-gray-600 italic">"{testimonial.text}"</p>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">{t('admin.testimonials.noTestimonials')}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedTestimonial ? t('admin.testimonials.editTestimonial') : t('admin.testimonials.addTestimonial')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.patientName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.initialsOptional')}</label>
            <input
              type="text"
              value={formData.initials}
              onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase().slice(0, 2) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={2}
              placeholder={t('admin.testimonials.autoGenerated')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.rating')}</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                >
                  <FaStar className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.testimonialText')}</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
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
            <label htmlFor="active" className="text-sm text-gray-700">{t('common.active')}</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">{selectedTestimonial ? t('common.edit') : t('common.create')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message={`Are you sure you want to delete ${selectedTestimonial?.name}'s testimonial?`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Testimonials;
