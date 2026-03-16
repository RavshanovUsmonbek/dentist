import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from './LanguageContext';

const SiteContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const SiteProvider = ({ children }) => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({});
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);

        // Fetch all public data in parallel with language parameter
        const [
          settingsRes,
          heroRes,
          aboutRes,
          contactRes,
          footerRes,
          galleryRes,
          servicesRes,
          testimonialsRes,
          galleryImagesRes,
          galleryCategoriesRes,
          locationsRes
        ] = await Promise.all([
          axios.get(`${API_URL}/settings?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/content/hero?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/content/about?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/content/contact?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/content/footer?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/content/gallery?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
          axios.get(`${API_URL}/services?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
          axios.get(`${API_URL}/testimonials?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
          axios.get(`${API_URL}/gallery?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
          axios.get(`${API_URL}/gallery-categories?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
          axios.get(`${API_URL}/locations?lang=${language}`).catch(() => ({ data: { success: false, data: [] } }))
        ]);

        // Combine settings
        const allSettings = settingsRes.data.success ? settingsRes.data.data : {};
        setSettings(allSettings);

        // Combine content sections
        const allContent = {
          hero: heroRes.data.success ? heroRes.data.data : {},
          about: aboutRes.data.success ? aboutRes.data.data : {},
          contact: contactRes.data.success ? contactRes.data.data : {},
          footer: footerRes.data.success ? footerRes.data.data : {},
          gallery: galleryRes.data.success ? galleryRes.data.data : {}
        };
        setContent(allContent);

        // Set data arrays
        setServices(servicesRes.data.success ? servicesRes.data.data : []);
        setTestimonials(testimonialsRes.data.success ? testimonialsRes.data.data : []);
        setGallery(galleryImagesRes.data.success ? galleryImagesRes.data.data : []);
        setGalleryCategories(galleryCategoriesRes.data.success ? galleryCategoriesRes.data.data : []);
        setLocations(locationsRes.data.success ? locationsRes.data.data : []);

        setError(null);
      } catch (err) {
        console.error('Error fetching site data:', err);
        setError('Failed to load site data');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSiteData();
  }, [language]); // Refetch when language changes

  // Function to manually refresh site data
  const refreshSiteData = async () => {
    try {
      setLoading(true);

      // Fetch all public data in parallel with language parameter
      const [
        settingsRes,
        heroRes,
        aboutRes,
        contactRes,
        footerRes,
        galleryRes,
        servicesRes,
        testimonialsRes,
        galleryImagesRes,
        galleryCategoriesRes,
        locationsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/settings?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/content/hero?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/content/about?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/content/contact?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/content/footer?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/content/gallery?lang=${language}`).catch(() => ({ data: { success: false, data: {} } })),
        axios.get(`${API_URL}/services?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get(`${API_URL}/testimonials?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get(`${API_URL}/gallery?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get(`${API_URL}/gallery-categories?lang=${language}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get(`${API_URL}/locations?lang=${language}`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      // Combine settings
      const allSettings = settingsRes.data.success ? settingsRes.data.data : {};
      setSettings(allSettings);

      // Combine content sections
      const allContent = {
        hero: heroRes.data.success ? heroRes.data.data : {},
        about: aboutRes.data.success ? aboutRes.data.data : {},
        contact: contactRes.data.success ? contactRes.data.data : {},
        footer: footerRes.data.success ? footerRes.data.data : {},
        gallery: galleryRes.data.success ? galleryRes.data.data : {}
      };
      setContent(allContent);

      // Set data arrays
      setServices(servicesRes.data.success ? servicesRes.data.data : []);
      setTestimonials(testimonialsRes.data.success ? testimonialsRes.data.data : []);
      setGallery(galleryImagesRes.data.success ? galleryImagesRes.data.data : []);
      setGalleryCategories(galleryCategoriesRes.data.success ? galleryCategoriesRes.data.data : []);
      setLocations(locationsRes.data.success ? locationsRes.data.data : []);

      setError(null);
    } catch (err) {
      console.error('Error fetching site data:', err);
      setError('Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    content,
    services,
    testimonials,
    gallery,
    galleryCategories,
    locations,
    loading,
    error,
    refreshSiteData
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
