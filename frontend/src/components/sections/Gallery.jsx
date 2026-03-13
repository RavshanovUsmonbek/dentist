import { FaImage } from 'react-icons/fa';
import { galleryImages } from '../../data/gallery';

const Gallery = () => {
  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">Our Facility</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a virtual tour of our modern, state-of-the-art dental practice equipped with the latest technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-primary-100 to-primary-200"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <FaImage className="text-6xl text-primary-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">{image.alt}</p>
                  <p className="text-xs text-gray-500 mt-2 italic">Image placeholder</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
