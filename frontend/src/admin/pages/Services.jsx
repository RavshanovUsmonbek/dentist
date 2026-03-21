import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MultiLangInput from '../components/MultiLangInput';
import { prepareTranslationsForAPI, extractTranslationsFromAPI } from '../utils/translationHelpers';

const Services = () => {
  const { t, i18n } = useTranslation();

  const getTranslated = (service, field) => {
    const lang = i18n.language;
    return service.translations?.[field]?.[lang]
      || service.translations?.[field]?.uz
      || service[field]
      || '';
  };
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    icon: 'FaTooth',
    active: true
  });

  const icons = ['FaTooth', 'FaSmile', 'FaStethoscope', 'FaAmbulance', 'FaHeart', 'FaStar'];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await adminApi.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for API with translations
      const apiData = prepareTranslationsForAPI(formData, ['title', 'description']);

      if (selectedService) {
        await adminApi.updateService(selectedService.id, apiData);
      } else {
        await adminApi.createService(apiData);
      }
      setIsModalOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Failed to save service:', error);
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);

    // Extract translations from API response
    const translatedData = extractTranslationsFromAPI(service, ['title', 'description']);

    setFormData({
      title: translatedData.title,
      description: translatedData.description,
      icon: service.icon,
      active: service.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteService(selectedService.id);
      loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setFormData({
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      icon: 'FaTooth',
      active: true
    });
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
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.services.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> {t('admin.services.addService')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.serviceTitle')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.icon')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{getTranslated(service, 'title')}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{getTranslated(service, 'description')}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{service.icon}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {service.active ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => { setSelectedService(service); setIsDeleteOpen(true); }}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <p className="text-gray-500 text-center py-8">{t('admin.services.noServices')}</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedService ? t('admin.services.editService') : t('admin.services.addService')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <MultiLangInput
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            label={t('admin.services.serviceTitle')}
            required
          />
          <MultiLangInput
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            label={t('admin.services.serviceDescription')}
            type="textarea"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.services.icon')}</label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {icons.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
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
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              {selectedService ? t('common.edit') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Services;
