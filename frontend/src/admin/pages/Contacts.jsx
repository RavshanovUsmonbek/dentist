import { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaEye } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteContact(selectedContact.id);
      setContacts(prevContacts => prevContacts.filter(c => c.id !== selectedContact.id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contact Submissions</h1>
        <div className="text-sm text-gray-500">
          {contacts.filter(c => !c.read).length} unread
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className={`hover:bg-gray-50 ${!contact.read ? 'bg-cyan-50' : ''}`}>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleRead(contact)} className="p-2">
                    {contact.read ? (
                      <FaEnvelopeOpen className="text-gray-400" />
                    ) : (
                      <FaEnvelope className="text-cyan-600" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={!contact.read ? 'font-semibold' : ''}>{contact.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{contact.email}</td>
                <td className="px-6 py-4 text-gray-500">{contact.phone || '-'}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(contact.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleView(contact)} className="text-blue-600 hover:text-blue-800 p-2">
                    <FaEye />
                  </button>
                  <button onClick={() => { setSelectedContact(contact); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-2">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No contact submissions yet</p>
        )}
      </div>

      {/* View Contact Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Contact Details"
        size="lg"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-800">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-800">{selectedContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-800">{selectedContact.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-800">{formatDate(selectedContact.created_at)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <p className="text-gray-800 mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {selectedContact.message}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: Your inquiry&body=Dear ${selectedContact.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A`}
                className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete this contact from ${selectedContact?.name}?`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Contacts;
