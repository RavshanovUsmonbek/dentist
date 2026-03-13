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
  const { gallery, loading } = useSite();

  // Use API data if available, otherwise fallback to static data
  const displayGallery = gallery && gallery.length > 0 ? gallery : fallbackGallery;

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
          <h2 className="text-4xl font-bold text-sky-700 mb-4">Our Facility</h2>
          <div className="w-24 h-1 bg-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a virtual tour of our modern, state-of-the-art dental practice equipped with the latest technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGallery.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <GalleryImage image={image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
