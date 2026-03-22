import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTooth, FaComments, FaImages, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    services: 0,
    testimonials: 0,
    gallery: 0,
    contacts: { total: 0, unread: 0 }
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [services, testimonials, gallery, contactStats, contacts] = await Promise.all([
        adminApi.getServices(),
        adminApi.getTestimonials(),
        adminApi.getGallery(),
        adminApi.getContactStats(),
        adminApi.getContacts()
      ]);

      setStats({
        services: services.data?.length || 0,
        testimonials: testimonials.data?.length || 0,
        gallery: gallery.data?.length || 0,
        contacts: contactStats.data || { total: 0, unread: 0 }
      });

      setRecentContacts((contacts.data || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: t('admin.dashboard.statServices'),
      value: stats.services,
      icon: FaTooth,
      accent: 'border-blue-400',
      iconColor: 'text-blue-400',
      link: '/admin/services'
    },
    {
      label: t('admin.dashboard.statTestimonials'),
      value: stats.testimonials,
      icon: FaComments,
      accent: 'border-green-400',
      iconColor: 'text-green-400',
      link: '/admin/testimonials'
    },
    {
      label: t('admin.dashboard.statGallery'),
      value: stats.gallery,
      icon: FaImages,
      accent: 'border-purple-400',
      iconColor: 'text-purple-400',
      link: '/admin/gallery'
    },
    {
      label: t('admin.dashboard.statUnread'),
      value: stats.contacts.unread,
      icon: FaEnvelope,
      accent: 'border-gold-500',
      iconColor: 'text-gold-500',
      link: '/admin/contacts'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary-800 mb-8">{t('admin.dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, accent, iconColor, link }) => (
          <Link
            key={label}
            to={link}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${accent} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                <p className="font-display text-4xl font-semibold text-primary-800">{value}</p>
              </div>
              <Icon className={`text-2xl ${iconColor} opacity-60`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">{t('admin.dashboard.recentContacts')}</h2>
          <Link to="/admin/contacts" className="text-gold-600 hover:text-gold-700 text-xs font-medium transition-colors">
            {t('admin.dashboard.viewAll')} →
          </Link>
        </div>

        {recentContacts.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">{t('admin.dashboard.noContacts')}</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 py-3"
              >
                <div className={`p-1.5 rounded-lg ${contact.read ? 'bg-gray-100' : 'bg-primary-50'}`}>
                  {contact.read ? (
                    <FaEnvelopeOpen className="text-gray-400 text-sm" />
                  ) : (
                    <FaEnvelope className="text-primary-600 text-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!contact.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{contact.name}</p>
                  <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
