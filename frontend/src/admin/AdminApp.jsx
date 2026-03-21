import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Testimonials from './pages/Testimonials';
import Gallery from './pages/Gallery';
import Locations from './pages/Locations';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import SiteContent from './pages/SiteContent';
import Snapshots from './pages/Snapshots';

const AdminApp = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="locations" element={<Locations />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="content" element={<SiteContent />} />
          <Route path="snapshots" element={<Snapshots />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default AdminApp;
