import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaCheck, FaTimes, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import Toast, { useToast } from '../components/Toast';

const Testimonials = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });
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
      showToast('Testimonial approved');
    } catch (error) {
      console.error('Failed to approve testimonial:', error);
      showToast('Failed to approve testimonial', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectTestimonial(id);
      loadAll();
      showToast('Testimonial rejected');
    } catch (error) {
      console.error('Failed to reject testimonial:', error);
      showToast('Failed to reject testimonial', 'error');
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
      setIsDrawerOpen(false);
      resetForm();
      loadAll();
      showToast(selectedTestimonial ? 'Testimonial updated' : 'Testimonial created');
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      showToast('Failed to save testimonial', 'error');
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
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteTestimonial(id);
      loadAll();
      showToast('Testimonial deleted');
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      showToast('Failed to delete testimonial', 'error');
    }
  };

  const resetForm = () => {
    setSelectedTestimonial(null);
    setFormData({ name: '', initials: '', rating: 5, text: '', active: true });
  };

  const toggleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <FaSort className="text-gray-300 ml-1 inline" />;
    return sort.dir === 'asc'
      ? <FaSortUp className="text-primary-800 ml-1 inline" />
      : <FaSortDown className="text-primary-800 ml-1 inline" />;
  };

  const filteredTestimonials = useMemo(() => {
    let list = [...testimonials];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name?.toLowerCase().includes(q) || t.text?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') list = list.filter(t => t.active);
    if (statusFilter === 'inactive') list = list.filter(t => !t.active);

    list.sort((a, b) => {
      let valA, valB;
      if (sort.key === 'rating') { valA = a.rating; valB = b.rating; }
      else if (sort.key === 'created_at') { valA = new Date(a.created_at); valB = new Date(b.created_at); }
      else if (sort.key === 'active') { valA = a.active ? 1 : 0; valB = b.active ? 1 : 0; }
      return sort.dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return list;
  }, [testimonials, search, statusFilter, sort]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'} />
    ));
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.testimonials.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsDrawerOpen(true); }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="text-xs" /> {t('admin.testimonials.addTestimonial')}
        </button>
      </div>

      {/* Pending Reviews */}
      {pendingTestimonials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            {t('admin.testimonials.pendingReviews')}
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingTestimonials.length}
            </span>
          </h2>
          <div className="grid gap-3">
            {pendingTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-semibold text-sm">{testimonial.initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{testimonial.name}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                    >
                      <FaCheck /> {t('admin.testimonials.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(testimonial.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                    >
                      <FaTimes /> {t('admin.testimonials.reject')}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-gray-600 italic text-sm">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or review…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 bg-white text-gray-600"
        >
          <option value="all">All statuses</option>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.testimonials.patientName')}</th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-800 select-none"
                onClick={() => toggleSort('rating')}
              >
                {t('admin.testimonials.rating')}<SortIcon col="rating" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.testimonials.testimonialText')}</th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-800 select-none"
                onClick={() => toggleSort('active')}
              >
                {t('admin.services.status')}<SortIcon col="active" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-800 select-none"
                onClick={() => toggleSort('created_at')}
              >
                Date<SortIcon col="created_at" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTestimonials.map((testimonial) => (
              <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-semibold text-xs">{testimonial.initials}</span>
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{testimonial.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-0.5">
                    {renderStars(testimonial.rating)}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-gray-500 italic truncate">"{testimonial.text}"</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${testimonial.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {testimonial.active ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(testimonial)} className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                      <FaEdit className="text-sm" />
                    </button>
                    <InlineConfirm onConfirm={() => handleDelete(testimonial.id)}>
                      <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <FaTrash className="text-sm" />
                      </button>
                    </InlineConfirm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTestimonials.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-sm">
            {search || statusFilter !== 'all' ? 'No results match your filters.' : t('admin.testimonials.noTestimonials')}
          </p>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); resetForm(); }}
        title={selectedTestimonial ? t('admin.testimonials.editTestimonial') : t('admin.testimonials.addTestimonial')}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              form="testimonial-form"
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedTestimonial ? t('common.edit') : t('common.create')}
            </button>
          </div>
        }
      >
        <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.patientName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.testimonials.initialsOptional')}</label>
            <input
              type="text"
              value={formData.initials}
              onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase().slice(0, 2) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
              maxLength={2}
              placeholder={t('admin.testimonials.autoGenerated')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.testimonials.rating')}</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                >
                  <FaStar className={`text-xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-800"
            />
            <label htmlFor="active" className="text-sm text-gray-700">{t('common.active')}</label>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Testimonials;
