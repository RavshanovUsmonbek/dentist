import { FaUserMd, FaAward, FaGraduationCap } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';

const About = () => {
  const { content, loading } = useSite();

  // Default content with fallbacks
  const aboutContent = content?.about || {};
  const doctorName = aboutContent.about_doctor_name || 'Dr. Sarah Smith, DDS';
  const bio1 = aboutContent.about_bio_1 || "Welcome to Smile Dental Care! I'm Dr. Sarah Smith, and I've been passionate about dentistry for over 15 years. My commitment is to provide you with the highest quality dental care in a comfortable, welcoming environment.";
  const bio2 = aboutContent.about_bio_2 || "I believe that every patient deserves personalized attention and a treatment plan tailored to their unique needs. Whether you're here for a routine cleaning or a complete smile makeover, you can trust that you're in capable, caring hands.";
  const education1 = aboutContent.about_education_1 || 'Doctor of Dental Surgery, University of California';
  const education2 = aboutContent.about_education_2 || 'Advanced Cosmetic Dentistry Certification';
  const experience1 = aboutContent.about_experience_1 || '15+ years of dental practice';
  const experience2 = aboutContent.about_experience_2 || 'Specialist in cosmetic and restorative dentistry';
  const awards1 = aboutContent.about_awards_1 || 'American Dental Association Member';
  const awards2 = aboutContent.about_awards_2 || 'Best Dentist Award 2023';

  if (loading) {
    return (
      <section id="about" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">About Our Practice</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">{doctorName}</h3>
            <p className="text-gray-600 leading-relaxed">
              {bio1}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {bio2}
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaGraduationCap className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Education</h4>
                  <p className="text-gray-600">{education1}</p>
                  <p className="text-gray-600">{education2}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaUserMd className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Experience</h4>
                  <p className="text-gray-600">{experience1}</p>
                  <p className="text-gray-600">{experience2}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaAward className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Memberships & Awards</h4>
                  <p className="text-gray-600">{awards1}</p>
                  <p className="text-gray-600">{awards2}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <FaUserMd className="text-9xl text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 italic">Professional dentist photo placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
