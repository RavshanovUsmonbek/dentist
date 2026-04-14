import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTooth, FaSmile, FaStethoscope, FaAmbulance, FaHeart, FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import Toast, { useToast } from '../components/Toast';
import MultiLangInput from '../components/MultiLangInput';
import { prepareTranslationsForAPI, extractTranslationsFromAPI } from '../utils/translationHelpers';

const Services = () => {
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useToast();

  const getTranslated = (service, field) => {
    const lang = i18n.language;
    return service.translations?.[field]?.[lang]
      || service.translations?.[field]?.uz
      || service[field]
      || '';
  };
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    icon: 'FaTooth',
    active: true
  });

  const icons = [
    { name: 'FaTooth', component: FaTooth },
    { name: 'FaSmile', component: FaSmile },
    { name: 'FaStethoscope', component: FaStethoscope },
    { name: 'FaAmbulance', component: FaAmbulance },
    { name: 'FaHeart', component: FaHeart },
    { name: 'FaStar', component: FaStar },
  ];

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
      const apiData = prepareTranslationsForAPI(formData, ['title', 'description']);
      if (selectedService) {
        await adminApi.updateService(selectedService.id, apiData);
      } else {
        await adminApi.createService(apiData);
      }
      setIsDrawerOpen(false);
      resetForm();
      loadServices();
      showToast(selectedService ? 'Service updated' : 'Service created');
    } catch (error) {
      console.error('Failed to save service:', error);
      showToast('Failed to save service', 'error');
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    const translatedData = extractTranslationsFromAPI(service, ['title', 'description']);
    setFormData({
      title: translatedData.title,
      description: translatedData.description,
      icon: service.icon,
      active: service.active
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteService(id);
      loadServices();
      showToast('Service deleted');
    } catch {
      showToast('Failed to delete service', 'error');
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.services.title')}</h1>
        <button
          onClick={() => { resetForm(); setIsDrawerOpen(true); }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="text-xs" /> {t('admin.services.addService')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.serviceTitle')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.icon')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.services.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{getTranslated(service, 'title')}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{getTranslated(service, 'description')}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const match = icons.find(i => i.name === service.icon);
                    const Icon = match?.component;
                    return Icon ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50">
                        <Icon className="text-primary-700 text-sm" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">{service.icon}</span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {service.active ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <InlineConfirm onConfirm={() => handleDelete(service.id)}>
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
        {services.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-sm">{t('admin.services.noServices')}</p>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); resetForm(); }}
        title={selectedService ? t('admin.services.editService') : t('admin.services.addService')}
        size="lg"
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
              form="service-form"
              type="submit"
              className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedService ? t('common.edit') : t('common.create')}
            </button>
          </div>
        }
      >
        <form id="service-form" onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.services.icon')}</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(({ name, component: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  title={name}
                  className={`w-11 h-11 flex items-center justify-center rounded-lg border-2 transition-all duration-150 ${
                    formData.icon === name
                      ? 'border-primary-800 bg-primary-50 text-primary-800'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="text-lg" />
                </button>
              ))}
            </div>
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

export default Services;
