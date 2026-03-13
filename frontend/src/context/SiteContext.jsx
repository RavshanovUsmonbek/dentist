import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SiteContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);

        // Fetch all public data in parallel
        const [
          settingsRes,
          heroRes,
          aboutRes,
          contactRes,
          footerRes,
          servicesRes,
          testimonialsRes,
          galleryRes
        ] = await Promise.all([
          axios.get(`${API_URL}/settings`).catch(() => ({ data: { success: false, settings: {} } })),
          axios.get(`${API_URL}/content/hero`).catch(() => ({ data: { success: false, content: {} } })),
          axios.get(`${API_URL}/content/about`).catch(() => ({ data: { success: false, content: {} } })),
          axios.get(`${API_URL}/content/contact`).catch(() => ({ data: { success: false, content: {} } })),
          axios.get(`${API_URL}/content/footer`).catch(() => ({ data: { success: false, content: {} } })),
          axios.get(`${API_URL}/services`).catch(() => ({ data: { success: false, services: [] } })),
          axios.get(`${API_URL}/testimonials`).catch(() => ({ data: { success: false, testimonials: [] } })),
          axios.get(`${API_URL}/gallery`).catch(() => ({ data: { success: false, gallery: [] } }))
        ]);

        // Combine settings
        const allSettings = settingsRes.data.success ? settingsRes.data.settings : {};
        setSettings(allSettings);

        // Combine content sections
        const allContent = {
          hero: heroRes.data.success ? heroRes.data.content : {},
          about: aboutRes.data.success ? aboutRes.data.content : {},
          contact: contactRes.data.success ? contactRes.data.content : {},
          footer: footerRes.data.success ? footerRes.data.content : {}
        };
        setContent(allContent);

        // Set data arrays
        setServices(servicesRes.data.success ? servicesRes.data.data : []);
        setTestimonials(testimonialsRes.data.success ? testimonialsRes.data.data : []);
        setGallery(galleryRes.data.success ? galleryRes.data.data : []);

        setError(null);
      } catch (err) {
        console.error('Error fetching site data:', err);
        setError('Failed to load site data');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, []);

  const value = {
    settings,
    content,
    services,
    testimonials,
    gallery,
    loading,
    error
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within SiteProvider');
  }
  return context;
};
