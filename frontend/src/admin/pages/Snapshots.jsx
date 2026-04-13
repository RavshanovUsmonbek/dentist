import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaDownload, FaUndo, FaTrash, FaFileImport } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import Toast, { useToast } from '../components/Toast';

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

  const { toast, showToast } = useToast();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create drawer
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Import
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importMeta, setImportMeta] = useState({ name: '', description: '' });
  const [importError, setImportError] = useState('');
  const [importImageCount, setImportImageCount] = useState(null);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      const res = await adminApi.getSnapshots();
      setSnapshots(res.data || []);
    } catch {
      showToast(t('admin.snapshots.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setActionLoading(true);
    try {
      await adminApi.createSnapshot(formData);
      showToast(t('admin.snapshots.createSuccess'));
      setIsCreateOpen(false);
      setFormData({ name: '', description: '' });
      loadSnapshots();
    } catch {
      showToast(t('admin.snapshots.createFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (snapshot) => {
    try {
      await adminApi.exportSnapshot(snapshot.id, snapshot.name);
    } catch {
      showToast(t('admin.snapshots.exportFailed'), 'error');
    }
  };

  const handleRestore = async (snapshot) => {
    setActionLoading(true);
    try {
      await adminApi.restoreSnapshot(snapshot.id);
      showToast(t('admin.snapshots.restoreSuccess'));
    } catch {
      showToast(t('admin.snapshots.restoreFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (snapshot) => {
    setActionLoading(true);
    try {
      await adminApi.deleteSnapshot(snapshot.id);
      showToast(t('admin.snapshots.deleteSuccess'));
      loadSnapshots();
    } catch {
      showToast(t('admin.snapshots.deleteFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportData(null);
    setImportFile(null);
    setImportImageCount(null);

    if (file.name.endsWith('.zip')) {
      try {
        const zip = await JSZip.loadAsync(file);
        const jsonEntry = zip.file('snapshot.json');
        if (!jsonEntry) {
          setImportError('snapshot.json not found in ZIP');
          return;
        }
        const text = await jsonEntry.async('text');
        const parsed = JSON.parse(text);
        const err = validateImport(parsed);
        if (err) { setImportError(err); return; }
        setImportData(parsed);
        setImportFile(file);
        const imageFiles = Object.keys(zip.files).filter(
          name => name.startsWith('images/') && !zip.files[name].dir
        );
        setImportImageCount(imageFiles.length);
        if (!importMeta.name) {
          setImportMeta(m => ({ ...m, name: file.name.replace(/\.zip$/, '') }));
        }
      } catch {
        setImportError(t('admin.snapshots.importInvalidFile'));
      }
      return;
    }

    // JSON fallback (backward compat)
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
      if (importFile) {
        await adminApi.importSnapshotZip(importFile, importMeta.name, importMeta.description, restore);
      } else {
        await adminApi.importSnapshot({ ...importMeta, data: importData }, restore);
      }
      showToast(t('admin.snapshots.importSuccess'));
      setImportData(null);
      setImportFile(null);
      setImportMeta({ name: '', description: '' });
      setImportImageCount(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadSnapshots();
    } catch {
      showToast(t('admin.snapshots.importFailed'), 'error');
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.snapshots.title')}</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="text-xs" /> {t('admin.snapshots.createSnapshot')}
        </button>
      </div>

      {/* Snapshots Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {snapshots.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {t('admin.snapshots.noSnapshots')}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.snapshotName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.snapshotDescription')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.snapshots.createdAt')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 text-sm">{snap.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{snap.description || '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(snap.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleExport(snap)}
                        title={t('admin.snapshots.export')}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                      <InlineConfirm
                        onConfirm={() => handleRestore(snap)}
                        confirmLabel={t('admin.snapshots.restoreConfirm')}
                        variant="warning"
                      >
                        <button
                          title={t('admin.snapshots.restore')}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <FaUndo className="text-sm" />
                        </button>
                      </InlineConfirm>
                      <InlineConfirm onConfirm={() => handleDelete(snap)}>
                        <button
                          title={t('common.delete')}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </InlineConfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileImport className="text-primary-600 text-sm" />
          {t('admin.snapshots.importTitle')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.snapshots.importChooseFile')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          {importError && (
            <p className="text-red-600 text-sm">{importError}</p>
          )}

          {importData && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100">
              <p className="font-medium mb-2">{t('admin.snapshots.importPreview')}:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <span>{t('admin.snapshots.previewServices')}: <b>{importData.services?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewTestimonials')}: <b>{importData.testimonials?.length ?? 0}</b></span>
                <span>
                  {t('admin.snapshots.previewGallery')}: <b>{importData.gallery_images?.length ?? 0}</b>
                  {importImageCount !== null && importImageCount < (importData.gallery_images?.length ?? 0) && (
                    <span className="ml-1 text-amber-600 font-normal">
                      ({importImageCount} {t('admin.snapshots.imagesInZip')})
                    </span>
                  )}
                </span>
                <span>{t('admin.snapshots.previewCategories')}: <b>{importData.gallery_categories?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewLocations')}: <b>{importData.locations?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewSettings')}: <b>{importData.site_settings?.length ?? 0}</b></span>
                <span>{t('admin.snapshots.previewContent')}: <b>{importData.site_content?.length ?? 0}</b></span>
                {importData.snapshotted_at && (
                  <span className="col-span-2 text-gray-400">{t('admin.snapshots.previewDate')}: {importData.snapshotted_at}</span>
                )}
              </div>

              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t('admin.snapshots.secretsNote')}
              </p>

              <div className="mt-4 grid gap-3">
                <input
                  type="text"
                  placeholder={t('admin.snapshots.snapshotName') + ' *'}
                  value={importMeta.name}
                  onChange={(e) => setImportMeta(m => ({ ...m, name: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <input
                  type="text"
                  placeholder={t('admin.snapshots.snapshotDescription')}
                  value={importMeta.description}
                  onChange={(e) => setImportMeta(m => ({ ...m, description: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleImport(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('admin.snapshots.importSaveOnly')}
                </button>
                <button
                  onClick={() => handleImport(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {t('admin.snapshots.importSaveAndRestore')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Snapshot Drawer */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setFormData({ name: '', description: '' }); }}
        title={t('admin.snapshots.createSnapshot')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsCreateOpen(false); setFormData({ name: '', description: '' }); }}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreate}
              disabled={actionLoading || !formData.name.trim()}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading ? t('common.saving') : t('admin.snapshots.createSnapshot')}
            </button>
          </div>
        }
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
            />
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {t('admin.snapshots.secretsNote')}
          </p>
        </div>
      </Drawer>
    </div>
  );
};

export default Snapshots;
