import { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay — covers content when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-primary-900/50 sm:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100 sm:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-primary-800 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <FaBars className="text-lg" />
          </button>
          <span className="ml-3 font-display text-base font-semibold text-primary-800">Admin</span>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
