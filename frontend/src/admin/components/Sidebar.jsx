import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaCog,
  FaImages,
  FaComments,
  FaEnvelope,
  FaTooth,
  FaFileAlt,
  FaSignOutAlt,
  FaFolder,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/admin', icon: FaHome, label: 'Dashboard', end: true },
    { to: '/admin/services', icon: FaTooth, label: 'Services' },
    { to: '/admin/testimonials', icon: FaComments, label: 'Testimonials' },
    { to: '/admin/gallery', icon: FaImages, label: 'Gallery' },
    { to: '/admin/gallery-categories', icon: FaFolder, label: 'Gallery Categories' },
    { to: '/admin/locations', icon: FaMapMarkerAlt, label: 'Locations' },
    { to: '/admin/contacts', icon: FaEnvelope, label: 'Contacts' },
    { to: '/admin/settings', icon: FaCog, label: 'Settings' },
    { to: '/admin/content', icon: FaFileAlt, label: 'Site Content' },
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
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
