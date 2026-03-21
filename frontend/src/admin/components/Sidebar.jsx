import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome,
  FaCog,
  FaImages,
  FaComments,
  FaEnvelope,
  FaTooth,
  FaFileAlt,
  FaSignOutAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { to: '/admin', icon: FaHome, label: t('admin.sidebar.dashboard'), end: true },
    { to: '/admin/services', icon: FaTooth, label: t('admin.sidebar.services') },
    { to: '/admin/testimonials', icon: FaComments, label: t('admin.sidebar.testimonials') },
    { to: '/admin/gallery', icon: FaImages, label: t('admin.sidebar.gallery') },
    { to: '/admin/locations', icon: FaMapMarkerAlt, label: t('admin.sidebar.locations') },
    { to: '/admin/contacts', icon: FaEnvelope, label: t('admin.sidebar.contacts') },
    { to: '/admin/settings', icon: FaCog, label: t('admin.sidebar.settings') },
    { to: '/admin/content', icon: FaFileAlt, label: t('admin.sidebar.content') },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-cyan-400">Admin Panel</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">
            Welcome, {user.full_name || user.username}
          </p>
        )}
        <div className="mt-3">
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Icon className="text-lg" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-lg" />
          <span>{t('admin.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
