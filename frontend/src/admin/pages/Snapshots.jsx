import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaDownload, FaUndo, FaTrash, FaFileImport } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const REQUIRED_KEYS = ['services', 'testimonials', 'gallery_categories', 'gallery_images', 'locations', 'site_settings', 'site_content'];

export const validateImport = (parsed) => {
  if (!parsed.version || parsed.version !== '1') return 'Invalid version — expected "1"';
  for (const key of REQUIRED_KEYS) {
    if (!Array.isArray(parsed[key])) return `Missing required key: ${key}`;
  }
  return null;
};

const Snapshots = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Restore confirm
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  // Delete confirm
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Import
  const [importData, setImportData] = useState(null);
  const [importMeta, setImportMeta] = useState({ name: '', description: '' });
  const [importError, setImportError] = useState('');

  useEffect(() => {
    loadSnapshots();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const loadSnapshots = async () => {
    try {
      const res = await adminApi.getSnapshots();
      setSnapshots(res.data || []);
    } catch {
      showMessage(t('admin.snapshots.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setActionLoading(true);
    try {
      await adminApi.createSnapshot(formData);
      showMessage(t('admin.snapshots.createSuccess'));
      setIsCreateOpen(false);
      setFormData({ name: '', description: '' });
      loadSnapshots();
    } catch {
      showMessage(t('admin.snapshots.createFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (snapshot) => {
    try {
      await adminApi.exportSnapshot(snapshot.id, snapshot.name);
    } catch {
      showMessage(t('admin.snapshots.exportFailed'), 'error');
    }
  };

  const handleRestoreConfirm = async () => {
    if (!selectedSnapshot) return;
    setActionLoading(true);
    try {
      await adminApi.restoreSnapshot(selectedSnapshot.id);
      showMessage(t('admin.snapshots.restoreSuccess'));
    } catch {
      showMessage(t('admin.snapshots.restoreFailed'), 'error');
    } finally {
      setActionLoading(false);
      setSelectedSnapshot(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteSnapshot(deleteTarget.id);
      showMessage(t('admin.snapshots.deleteSuccess'));
      loadSnapshots();
    } catch {
      showMessage(t('admin.snapshots.deleteFailed'), 'error');
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportData(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const err = validateImport(parsed);
        if (err) {
          setImportError(err);
          return;
        }
        setImportData(parsed);
        if (!importMeta.name) {
          setImportMeta(m => ({ ...m, name: file.name.replace(/\.json$/, '') }));
        }
      } catch {
        setImportError(t('admin.snapshots.importInvalidFile'));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async (restore = false) => {
    if (!importData) return;
    if (!importMeta.name.trim()) {
      setImportError(t('admin.snapshots.importNameRequired'));
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.importSnapshot({ ...importMeta, data: importData }, restore);
      showMessage(t('admin.snapshots.importSuccess'));
      setImportData(null);
      setImportMeta({ name: '', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadSnapshots();
    } catch {
      showMessage(t('admin.snapshots.importFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.snapshots.title')}</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus /> {t('admin.snapshots.createSnapshot')}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Snapshots Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {snapshots.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('admin.snapshots.noSnapshots')}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.snapshotName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.snapshotDescription')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.createdAt')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{snap.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{snap.description || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(snap.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExport(snap)}
                        title={t('admin.snapshots.export')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => { setSelectedSnapshot(snap); setIsRestoreOpen(true); }}
                        title={t('admin.snapshots.restore')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <FaUndo />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(snap); setIsDeleteOpen(true); }}
                        title={t('common.delete')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileImport className="text-cyan-600" />
          {t('admin.snapshots.importTitle')}
        </h2>

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.snapshots.importChooseFile')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            />
          </div>

          {importError && (
            <p className="text-red-600 text-sm">{importError}</p>
          )}

          {/* Preview panel */}
          {importData && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">{t('admin.snapshots.importPreview')}:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <span>{t('admin.snapshots.previewServices')}: <b>{importData.services?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewTestimonials')}: <b>{importData.testimonials?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewGallery')}: <b>{importData.gallery_images?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewCategories')}: <b>{importData.gallery_categories?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewLocations')}: <b>{importData.locations?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewSettings')}: <b>{importData.site_settings?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewContent')}: <b>{importData.site_content?.length ?? 0}</b></span>
                {importData.snapshotted_at && (
                  <span className="col-span-2 text-gray-500">{t('admin.snapshots.previewDate')}: {importData.snapshotted_at}</span>
                )}
              </div>

              {/* Name + description for saving */}
              <div className="mt-4 grid gap-3">
                <input
                  type="text"
                  placeholder={t('admin.snapshots.snapshotName') + ' *'}
                  value={importMeta.name}
                  onChange={(e) => setImportMeta(m => ({ ...m, name: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  placeholder={t('admin.snapshots.snapshotDescription')}
                  value={importMeta.description}
                  onChange={(e) => setImportMeta(m => ({ ...m, description: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleImport(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('admin.snapshots.importSaveOnly')}
                </button>
                <button
                  onClick={() => handleImport(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('admin.snapshots.importSaveAndRestore')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Snapshot Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setFormData({ name: '', description: '' }); }}
        title={t('admin.snapshots.createSnapshot')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.snapshots.snapshotName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.snapshots.snapshotDescription')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => { setIsCreateOpen(false); setFormData({ name: '', description: '' }); }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={actionLoading || !formData.name.trim()}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? t('common.saving') : t('admin.snapshots.createSnapshot')}
          </button>
        </div>
      </Modal>

      {/* Restore Confirm Dialog */}
      <ConfirmDialog
        isOpen={isRestoreOpen}
        onClose={() => { setIsRestoreOpen(false); setSelectedSnapshot(null); }}
        onConfirm={handleRestoreConfirm}
        title={t('admin.snapshots.restoreTitle')}
        message={`"${selectedSnapshot?.name}" — ${t('admin.snapshots.restoreMessage')}`}
        confirmText={t('admin.snapshots.restoreConfirm')}
        variant="warning"
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title={t('admin.snapshots.deleteTitle')}
        message={`"${deleteTarget?.name}" — ${t('admin.snapshots.deleteMessage')}`}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};

export default Snapshots;
