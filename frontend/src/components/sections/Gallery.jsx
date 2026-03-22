import { useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';
import { galleryImages as fallbackGallery } from '../../data/gallery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = API_URL.replace('/api', '');

const GalleryImage = ({ image }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imagePath = image.filename || image.image_url || image.src;
  const imageUrl = imagePath?.startsWith('http')
    ? imagePath
    : imagePath?.startsWith('/uploads')
    ? `${BASE_URL}${imagePath}`
    : imagePath;

  const altText = image.alt_text || image.alt || image.title || 'Gallery image';

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-primary-50 aspect-square rounded-xl">
        <div className="text-center p-6">
          <FaImage className="text-4xl text-primary-200 mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-sans">{altText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl group">
      {!isLoaded && (
        <div className="flex items-center justify-center bg-primary-50 aspect-square rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-800 border-t-transparent" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={altText}
        className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      {/* Hover overlay */}
      {isLoaded && (
        <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/40 transition-all duration-300 rounded-xl flex items-end">
          {altText && altText !== 'Gallery image' && (
            <p className="text-white text-xs font-sans font-medium px-4 py-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">{altText}</p>
          )}
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const { gallery, galleryCategories, loading } = useSite();
  const [activeCategory, setActiveCategory] = useState(null);

  const displayGallery = gallery && gallery.length > 0 ? gallery : fallbackGallery;

  const categoriesToShow = galleryCategories && galleryCategories.length > 0
    ? galleryCategories.filter(cat => cat.enabled)
    : [];

  if (!activeCategory && categoriesToShow.length > 0) {
    setActiveCategory(categoriesToShow[0].slug);
  }

  const filteredImages = activeCategory
    ? displayGallery.filter(img => (img.category || 'general') === activeCategory)
    : displayGallery;

  const currentCategoryObj = categoriesToShow.find(cat => cat.slug === activeCategory);
  const currentTitle = currentCategoryObj?.label || 'Gallery';
  const currentSubtitle = currentCategoryObj?.description || 'Browse our professional gallery.';

  if (loading) {
    return (
      <section id="gallery" className="section-padding bg-white">
        <div className="container-custom">
          <p className="text-gray-400 text-center text-sm">Loading gallery...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-12">
          <div className="section-title-bar" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-800">
              {currentTitle}
            </h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-sans">
              {currentSubtitle}
            </p>
          </div>
        </div>

        {/* Underline-style category tabs */}
        {categoriesToShow.length > 1 && (
          <div className="flex gap-0 mb-10 border-b border-gray-200">
            {categoriesToShow.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative px-6 py-3 text-sm font-sans font-medium transition-colors duration-200 ${
                  activeCategory === cat.slug
                    ? 'text-primary-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {cat.label}
                {activeCategory === cat.slug && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Masonry grid */}
        {filteredImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="break-inside-avoid">
                <GalleryImage image={image} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaImage className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-sans text-sm">No images in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
