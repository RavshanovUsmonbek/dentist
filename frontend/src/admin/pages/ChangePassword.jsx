import { useState } from 'react';
import { adminApi } from '../services/adminApi';
import Toast, { useToast } from '../components/Toast';

const ChangePassword = () => {
  const { toast, showToast } = useToast();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (form.new_password.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setSaving(true);
    try {
      await adminApi.changePassword(form.current_password, form.new_password);
      showToast('Password updated successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            value={form.current_password}
            onChange={(e) => setForm(f => ({ ...f, current_password: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={form.new_password}
            onChange={(e) => setForm(f => ({ ...f, new_password: e.target.value }))}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={form.confirm_password}
            onChange={(e) => setForm(f => ({ ...f, confirm_password: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
};

export default ChangePassword;
