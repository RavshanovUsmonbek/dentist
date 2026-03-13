import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Smile Dental Care</h3>
            <p className="text-gray-300 mb-4">
              Providing exceptional dental care with compassion and expertise. Your smile is our priority.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent-500 transition-colors duration-200" aria-label="Facebook">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="hover:text-accent-500 transition-colors duration-200" aria-label="Twitter">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="hover:text-accent-500 transition-colors duration-200" aria-label="Instagram">
                <FaInstagram className="text-2xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FaPhone className="text-accent-500" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-accent-500" />
                <span>info@smiledentalcare.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-accent-500" />
                <span>123 Dental Street, Suite 100<br />Your City, ST 12345</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Office Hours</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span>9:00 AM - 3:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-800 text-center text-gray-400">
          <p>&copy; {currentYear} Smile Dental Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
