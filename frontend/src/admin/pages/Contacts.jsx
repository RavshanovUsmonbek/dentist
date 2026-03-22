import { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaEye } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import Drawer from '../components/Drawer';
import InlineConfirm from '../components/InlineConfirm';
import Toast, { useToast } from '../components/Toast';

const Contacts = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await adminApi.getContacts();
      setContacts(response.data || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
    if (!contact.read) {
      try {
        await adminApi.updateContact(contact.id, { read: true });
        setContacts(prevContacts => prevContacts.map(c => c.id === contact.id ? { ...c, read: true } : c));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleToggleRead = async (contact) => {
    try {
      const newReadStatus = !contact.read;
      await adminApi.updateContact(contact.id, { read: newReadStatus });
      setContacts(prevContacts => prevContacts.map(c => c.id === contact.id ? { ...c, read: newReadStatus } : c));
    } catch (error) {
      console.error('Failed to toggle read status:', error);
      showToast('Failed to update read status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteContact(id);
      setContacts(prevContacts => prevContacts.filter(c => c.id !== id));
      if (selectedContact?.id === id) setIsViewOpen(false);
      showToast('Contact deleted');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary-800">{t('admin.contacts.submissions')}</h1>
        <div className="text-sm text-gray-500">
          {contacts.filter(c => !c.read).length} {t('admin.contacts.unread')}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.contacts.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.contacts.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.contacts.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.contacts.phone')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.contacts.date')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className={`hover:bg-gray-50 transition-colors ${!contact.read ? 'bg-blue-50/50' : ''}`}>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleRead(contact)} className="p-1">
                    {contact.read ? (
                      <FaEnvelopeOpen className="text-gray-400" />
                    ) : (
                      <FaEnvelope className="text-primary-600" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${!contact.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{contact.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{contact.email}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{contact.phone || '-'}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(contact.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleView(contact)} className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                      <FaEye className="text-sm" />
                    </button>
                    <InlineConfirm onConfirm={() => handleDelete(contact.id)}>
                      <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <FaTrash className="text-sm" />
                      </button>
                    </InlineConfirm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-sm">{t('admin.contacts.noContacts')}</p>
        )}
      </div>

      {/* View Contact Drawer */}
      <Drawer
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={t('admin.contacts.contactDetails')}
        subtitle={selectedContact?.name}
        size="md"
        footer={
          selectedContact && (
            <div className="flex justify-between items-center">
              <InlineConfirm onConfirm={() => handleDelete(selectedContact.id)}>
                <button className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm">
                  <FaTrash className="text-xs" /> {t('common.delete')}
                </button>
              </InlineConfirm>
              <a
                href={`mailto:${selectedContact.email}?subject=Re: Your inquiry&body=Dear ${selectedContact.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A`}
                className="px-4 py-2 text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors text-sm font-medium"
              >
                {t('admin.contacts.replyViaEmail')}
              </a>
            </div>
          )
        }
      >
        {selectedContact && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.contacts.name')}</p>
                <p className="text-gray-800 text-sm">{selectedContact.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.contacts.email')}</p>
                <p className="text-gray-800 text-sm">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.contacts.phone')}</p>
                <p className="text-gray-800 text-sm">{selectedContact.phone || t('admin.contacts.notProvided')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('admin.contacts.date')}</p>
                <p className="text-gray-800 text-sm">{formatDate(selectedContact.created_at)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t('admin.contacts.message')}</p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Contacts;
