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
  FaMapMarkerAlt,
  FaCamera,
  FaLock
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
    { to: '/admin/snapshots', icon: FaCamera, label: t('admin.sidebar.snapshots') },
    { to: '/admin/change-password', icon: FaLock, label: t('admin.sidebar.changePassword') },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
            <FaTooth className="text-gold-400 text-xs" />
          </div>
          <span className="font-display text-lg font-semibold text-primary-800 leading-none">
            Admin
          </span>
        </div>
        {user && (
          <p className="text-xs text-gray-400">
            {user.full_name || user.username}
          </p>
        )}
        <div className="mt-3">
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-primary-50 text-primary-800 font-medium border-l-2 border-primary-800'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-2 border-transparent'
                  }`
                }
              >
                <Icon className="text-sm flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <FaSignOutAlt className="text-sm flex-shrink-0" />
          <span>{t('admin.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
