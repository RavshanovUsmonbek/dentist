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
