import { FaUserMd } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../context/SiteContext';

const About = () => {
  const { t } = useTranslation();
  const { content, loading } = useSite();

  const aboutContent = content?.about || {};
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const doctorName = aboutContent.doctor_name || 'Dr. Sarah Smith, DDS';
  const doctorPhoto = aboutContent.doctor_photo || '';
  const aboutText = aboutContent.about_text || "<p>Welcome to Smile Dental Care! I'm Dr. Sarah Smith, and I've been passionate about dentistry for over 15 years. My commitment is to provide you with the highest quality dental care in a comfortable, welcoming environment.</p><p>I believe that every patient deserves personalized attention and a treatment plan tailored to their unique needs.</p>";

  let education = [];
  let experience = [];
  let awards = [];

  try {
    education = aboutContent.education ? JSON.parse(aboutContent.education) : [
      'Doctor of Dental Surgery, University of California',
      'Advanced Cosmetic Dentistry Certification'
    ];
  } catch { education = ['Doctor of Dental Surgery, University of California', 'Advanced Cosmetic Dentistry Certification']; }

  try {
    experience = aboutContent.experience ? JSON.parse(aboutContent.experience) : [
      '15+ years of dental practice',
      'Specialist in cosmetic and restorative dentistry'
    ];
  } catch { experience = ['15+ years of dental practice', 'Specialist in cosmetic and restorative dentistry']; }

  try {
    awards = aboutContent.awards ? JSON.parse(aboutContent.awards) : [
      'American Dental Association Member',
      'Best Dentist Award 2023'
    ];
  } catch { awards = ['American Dental Association Member', 'Best Dentist Award 2023']; }

  if (loading) {
    return (
      <section id="about" className="section-padding bg-white">
        <div className="container-custom">
          <p className="text-gray-400 text-center text-sm">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* Photo column (LEFT) */}
          <div className="relative order-2 md:order-1">
            {doctorPhoto ? (
              <div className="relative">
                {/* Gold frame decoration */}
                <div className="absolute -top-4 -left-4 right-8 bottom-8 border-2 border-gold-300 rounded-2xl" />
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={`${API_URL.replace('/api', '')}${doctorPhoto}`}
                    alt={doctorName}
                    className="w-full aspect-[4/5] object-cover"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -top-4 -left-4 right-8 bottom-8 border-2 border-gold-300 rounded-2xl" />
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 aspect-[4/5] flex items-center justify-center">
                  <FaUserMd className="text-[120px] text-primary-400 opacity-40" />
                </div>
              </div>
            )}

            {/* Gold accent line between columns (desktop only) */}
            <div className="hidden md:block absolute -right-8 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-gold-400 to-transparent" />
          </div>

          {/* Text column (RIGHT) */}
          <div className="order-1 md:order-2">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="section-title-bar mb-0 w-8 flex-shrink-0" style={{ marginBottom: 0 }} />
              <span className="text-gold-600 text-xs font-sans font-medium tracking-widest uppercase">{t('sections.about.title')}</span>
            </div>

            {/* Doctor name */}
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-800 mb-6 leading-tight">
              {doctorName}
            </h2>

            {/* Bio */}
            <div
              className="about-text text-gray-500 font-sans text-sm leading-relaxed mb-10"
              dangerouslySetInnerHTML={{ __html: aboutText }}
            />

            {/* Credentials in three columns */}
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: t('sections.about.education'), items: education },
                { label: t('sections.about.experience'), items: experience },
                { label: t('sections.about.awards'), items: awards },
              ].map(({ label, items }) => (
                <div key={label}>
                  <p className="text-xs font-sans font-medium text-gold-600 uppercase tracking-widest mb-3">{label}</p>
                  <ul className="space-y-1.5">
                    {items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gold-500 mt-1.5 flex-shrink-0 text-xs">•</span>
                        <span className="text-sm text-gray-600 font-sans leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
