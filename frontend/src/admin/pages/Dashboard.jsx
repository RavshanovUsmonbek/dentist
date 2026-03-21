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
    { label: t('admin.dashboard.statServices'), value: stats.services, icon: FaTooth, color: 'bg-blue-500', link: '/admin/services' },
    { label: t('admin.dashboard.statTestimonials'), value: stats.testimonials, icon: FaComments, color: 'bg-green-500', link: '/admin/testimonials' },
    { label: t('admin.dashboard.statGallery'), value: stats.gallery, icon: FaImages, color: 'bg-purple-500', link: '/admin/gallery' },
    { label: t('admin.dashboard.statUnread'), value: stats.contacts.unread, icon: FaEnvelope, color: 'bg-red-500', link: '/admin/contacts' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin.dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
              </div>
              <div className={`${color} p-4 rounded-full text-white`}>
                <Icon className="text-2xl" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('admin.dashboard.recentContacts')}</h2>
          <Link to="/admin/contacts" className="text-cyan-600 hover:text-cyan-700 text-sm">
            {t('admin.dashboard.viewAll')}
          </Link>
        </div>

        {recentContacts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('admin.dashboard.noContacts')}</p>
        ) : (
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 rounded-full ${contact.read ? 'bg-gray-200' : 'bg-cyan-100'}`}>
                  {contact.read ? (
                    <FaEnvelopeOpen className="text-gray-500" />
                  ) : (
                    <FaEnvelope className="text-cyan-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
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
