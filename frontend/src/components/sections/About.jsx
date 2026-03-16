import { FaUserMd, FaAward, FaGraduationCap } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';

const About = () => {
  const { content, loading } = useSite();

  // Default content with fallbacks
  const aboutContent = content?.about || {};
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const doctorName = aboutContent.doctor_name || 'Dr. Sarah Smith, DDS';
  const doctorPhoto = aboutContent.doctor_photo || '';
  const aboutText = aboutContent.about_text || "<p>Welcome to Smile Dental Care! I'm Dr. Sarah Smith, and I've been passionate about dentistry for over 15 years. My commitment is to provide you with the highest quality dental care in a comfortable, welcoming environment.</p><p>I believe that every patient deserves personalized attention and a treatment plan tailored to their unique needs. Whether you're here for a routine cleaning or a complete smile makeover, you can trust that you're in capable, caring hands.</p>";

  // Parse JSON arrays with fallbacks
  let education = [];
  let experience = [];
  let awards = [];

  try {
    education = aboutContent.education ? JSON.parse(aboutContent.education) : [
      'Doctor of Dental Surgery, University of California',
      'Advanced Cosmetic Dentistry Certification'
    ];
  } catch (e) {
    education = [
      'Doctor of Dental Surgery, University of California',
      'Advanced Cosmetic Dentistry Certification'
    ];
  }

  try {
    experience = aboutContent.experience ? JSON.parse(aboutContent.experience) : [
      '15+ years of dental practice',
      'Specialist in cosmetic and restorative dentistry'
    ];
  } catch (e) {
    experience = [
      '15+ years of dental practice',
      'Specialist in cosmetic and restorative dentistry'
    ];
  }

  try {
    awards = aboutContent.awards ? JSON.parse(aboutContent.awards) : [
      'American Dental Association Member',
      'Best Dentist Award 2023'
    ];
  } catch (e) {
    awards = [
      'American Dental Association Member',
      'Best Dentist Award 2023'
    ];
  }

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
            <div
              className="text-gray-600 leading-relaxed prose prose-p:mb-4"
              dangerouslySetInnerHTML={{ __html: aboutText }}
            />

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaGraduationCap className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Education</h4>
                  {education.map((item, index) => (
                    <div key={index} className="mb-2">
                      {item.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaUserMd className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Experience</h4>
                  {experience.map((item, index) => (
                    <div key={index} className="mb-2">
                      {item.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaAward className="text-3xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Memberships & Awards</h4>
                  {awards.map((item, index) => (
                    <div key={index} className="mb-2">
                      {item.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {doctorPhoto ? (
              <div className="aspect-square rounded-lg overflow-hidden shadow-xl">
                <img
                  src={`${API_URL.replace('/api', '')}${doctorPhoto}`}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <FaUserMd className="text-9xl text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600 italic">Professional dentist photo placeholder</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
