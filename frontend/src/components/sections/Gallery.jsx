import { useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';
import { galleryImages as fallbackGallery } from '../../data/gallery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = API_URL.replace('/api', '');

const GalleryImage = ({ image }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Convert image URL to full URL if it's a relative path
  // API returns 'filename' field, fallback data uses 'src' or 'image_url'
  const imagePath = image.filename || image.image_url || image.src;
  const imageUrl = imagePath?.startsWith('http')
    ? imagePath
    : imagePath?.startsWith('/uploads')
    ? `${BASE_URL}${imagePath}`
    : imagePath;

  const altText = image.alt_text || image.alt || image.title || 'Gallery image';

  if (hasError) {
    // Show placeholder if image fails to load
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
        <div className="text-center p-6">
          <FaImage className="text-6xl text-sky-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">{altText}</p>
          <p className="text-xs text-gray-500 mt-2 italic">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-600 border-t-transparent"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={altText}
        className={`w-full h-full object-cover transition-all duration-300 hover:-translate-y-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
};

const Gallery = () => {
  const { gallery, galleryCategories, loading, content } = useSite();
  const [activeCategory, setActiveCategory] = useState(null);

  // Use API data if available, otherwise fallback to static data
  const displayGallery = gallery && gallery.length > 0 ? gallery : fallbackGallery;

  // Use dynamic categories from API
  const categoriesToShow = galleryCategories && galleryCategories.length > 0
    ? galleryCategories.filter(cat => cat.enabled)
    : [];

  // Set initial active category to first enabled category
  useState(() => {
    if (categoriesToShow.length > 0 && !activeCategory) {
      setActiveCategory(categoriesToShow[0].slug);
    }
  }, [categoriesToShow]);

  // If no active category set yet, set it to first category
  if (!activeCategory && categoriesToShow.length > 0) {
    setActiveCategory(categoriesToShow[0].slug);
  }

  // Filter images by active category
  const filteredImages = activeCategory
    ? displayGallery.filter(img => (img.category || 'general') === activeCategory)
    : displayGallery;

  // Get dynamic content for current category
  const galleryContent = content?.gallery || {};
  const currentCategoryObj = categoriesToShow.find(cat => cat.slug === activeCategory);
  const currentTitle = galleryContent[`title_${activeCategory}`] || currentCategoryObj?.label || 'Gallery';
  const currentSubtitle = galleryContent[`subtitle_${activeCategory}`] || currentCategoryObj?.description || 'Browse our professional gallery.';

  if (loading) {
    return (
      <section id="gallery" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-sky-700 mb-4">{currentTitle}</h2>
          <div className="w-24 h-1 bg-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {currentSubtitle}
          </p>
        </div>

        {/* Category Tabs */}
        {categoriesToShow.length > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {categoriesToShow.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.length > 0 ? (
            filteredImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <GalleryImage image={image} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No images in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
