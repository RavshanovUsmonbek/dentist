import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const adminAxios = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: async (username, password) => {
    const response = await adminAxios.post('/admin/login', { username, password });
    return response.data;
  },

  getMe: async () => {
    const response = await adminAxios.get('/admin/me');
    return response.data;
  },

  // Services CRUD
  getServices: async () => {
    const response = await adminAxios.get('/admin/services');
    return response.data;
  },

  createService: async (data) => {
    const response = await adminAxios.post('/admin/services', data);
    return response.data;
  },

  updateService: async (id, data) => {
    const response = await adminAxios.put(`/admin/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await adminAxios.delete(`/admin/services/${id}`);
    return response.data;
  },

  // Testimonials CRUD
  getTestimonials: async () => {
    const response = await adminAxios.get('/admin/testimonials');
    return response.data;
  },

  createTestimonial: async (data) => {
    const response = await adminAxios.post('/admin/testimonials', data);
    return response.data;
  },

  updateTestimonial: async (id, data) => {
    const response = await adminAxios.put(`/admin/testimonials/${id}`, data);
    return response.data;
  },

  deleteTestimonial: async (id) => {
    const response = await adminAxios.delete(`/admin/testimonials/${id}`);
    return response.data;
  },

  getPendingTestimonials: async () => {
    const response = await adminAxios.get('/admin/testimonials/pending');
    return response.data;
  },

  approveTestimonial: async (id) => {
    const response = await adminAxios.patch(`/admin/testimonials/${id}/approve`);
    return response.data;
  },

  rejectTestimonial: async (id) => {
    const response = await adminAxios.patch(`/admin/testimonials/${id}/reject`);
    return response.data;
  },

  // Gallery CRUD
  getGallery: async () => {
    const response = await adminAxios.get('/admin/gallery');
    return response.data;
  },

  createGalleryImage: async (data) => {
    const response = await adminAxios.post('/admin/gallery', data);
    return response.data;
  },

  updateGalleryImage: async (id, data) => {
    const response = await adminAxios.put(`/admin/gallery/${id}`, data);
    return response.data;
  },

  deleteGalleryImage: async (id) => {
    const response = await adminAxios.delete(`/admin/gallery/${id}`);
    return response.data;
  },

  // Gallery Categories CRUD
  getGalleryCategories: async () => {
    const response = await adminAxios.get('/admin/gallery-categories');
    return response.data;
  },

  createGalleryCategory: async (data) => {
    const response = await adminAxios.post('/admin/gallery-categories', data);
    return response.data;
  },

  updateGalleryCategory: async (id, data) => {
    const response = await adminAxios.put(`/admin/gallery-categories/${id}`, data);
    return response.data;
  },

  deleteGalleryCategory: async (id) => {
    const response = await adminAxios.delete(`/admin/gallery-categories/${id}`);
    return response.data;
  },

  // Locations CRUD
  getLocations: async () => {
    const response = await adminAxios.get('/admin/locations');
    return response.data;
  },

  createLocation: async (data) => {
    const response = await adminAxios.post('/admin/locations', data);
    return response.data;
  },

  updateLocation: async (id, data) => {
    const response = await adminAxios.put(`/admin/locations/${id}`, data);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await adminAxios.delete(`/admin/locations/${id}`);
    return response.data;
  },

  // Contacts
  getContacts: async () => {
    const response = await adminAxios.get('/admin/contacts');
    return response.data;
  },

  getContact: async (id) => {
    const response = await adminAxios.get(`/admin/contacts/${id}`);
    return response.data;
  },

  updateContact: async (id, data) => {
    const response = await adminAxios.patch(`/admin/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await adminAxios.delete(`/admin/contacts/${id}`);
    return response.data;
  },

  getContactStats: async () => {
    const response = await adminAxios.get('/admin/contacts/stats');
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await adminAxios.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await adminAxios.put('/admin/settings', data);
    return response.data;
  },

  // Content
  getAllContent: async () => {
    const response = await adminAxios.get('/admin/content');
    return response.data;
  },

  getContent: async (section) => {
    const response = await adminAxios.get(`/admin/content/${section}`);
    return response.data;
  },

  updateContent: async (section, data) => {
    const response = await adminAxios.put(`/admin/content/${section}`, data);
    return response.data;
  },

  // Snapshots
  getSnapshots: async () => {
    const response = await adminAxios.get('/admin/snapshots');
    return response.data;
  },

  createSnapshot: async (data) => {
    const response = await adminAxios.post('/admin/snapshots', data);
    return response.data;
  },

  getSnapshot: async (id) => {
    const response = await adminAxios.get(`/admin/snapshots/${id}`);
    return response.data;
  },

  deleteSnapshot: async (id) => {
    const response = await adminAxios.delete(`/admin/snapshots/${id}`);
    return response.data;
  },

  restoreSnapshot: async (id) => {
    const response = await adminAxios.post(`/admin/snapshots/${id}/restore`);
    return response.data;
  },

  importSnapshot: async (payload, restore = false) => {
    const response = await adminAxios.post(
      `/admin/snapshots/import${restore ? '?restore=true' : ''}`,
      payload
    );
    return response.data;
  },

  exportSnapshot: async (id, name) => {
    const response = await adminAxios.get(`/admin/snapshots/${id}/export`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `snapshot-${name || id}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // File upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminAxios.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default adminApi;
