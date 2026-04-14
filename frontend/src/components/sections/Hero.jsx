import { useState, useEffect } from 'react';
import { FaTooth, FaAward, FaMicroscope, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useSite } from '../../context/SiteContext';

const FEATURE_ICONS = [FaTooth, FaAward, FaMicroscope, FaShieldAlt];

const Hero = () => {
  const { content } = useSite();
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContact = (e) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroContent = content?.hero || {};
  const title = heroContent.title || 'Your Smile, Our Priority';
  const subtitle = heroContent.subtitle || 'Experience exceptional dental care with state-of-the-art technology and a compassionate team dedicated to your oral health.';
  const primaryButtonText = heroContent.cta_primary_text || 'Schedule Appointment';
  const secondaryButtonText = heroContent.cta_secondary_text || 'Our Services';

  const lang = i18n.language;
  const pickLang = (obj) => (typeof obj === 'object' && obj !== null)
    ? (obj[lang] || obj.uz || obj.ru || obj.en || '')
    : (obj || '');

  let rawFeatures = [];
  try {
    const raw = heroContent.features;
    rawFeatures = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
  } catch { rawFeatures = []; }

  const features = rawFeatures.length > 0
    ? rawFeatures.map((f, i) => ({
        icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
        title: pickLang(f.title),
        desc: pickLang(f.desc),
      }))
    : [
        { icon: FEATURE_ICONS[0], title: 'Pain-Free Treatment',  desc: 'Advanced anesthesia & gentle techniques' },
        { icon: FEATURE_ICONS[1], title: 'Certified Specialists', desc: 'Board-certified dental professionals' },
        { icon: FEATURE_ICONS[2], title: 'Modern Equipment',      desc: 'High-tech diagnostics & treatment' },
        { icon: FEATURE_ICONS[3], title: 'Safe & Sterile',        desc: 'Hospital-grade sterilization standards' },
      ];

  return (
    <section id="hero" className="relative min-h-screen bg-primary-800 overflow-hidden flex items-center">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-700 opacity-40" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary-900 opacity-30" />
        <div className="absolute top-1/2 right-1/3 w-2 h-32 bg-gold-500 opacity-20" />
      </div>

      <div className={`relative z-10 container-custom w-full px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-screen py-32 lg:py-24">

          {/* Text column */}
          <div className="lg:col-span-3 text-white">
            {/* Eyebrow */}
            <div
              className="flex items-center gap-3 mb-8 transition-all duration-700"
              style={{ transitionDelay: '100ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
            >
              <div className="w-8 h-px bg-gold-500" />
              <span className="text-gold-400 text-xs font-sans font-medium tracking-widest uppercase">Professional Dental Care</span>
            </div>

            {/* Main heading */}
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-none mb-6 transition-all duration-700"
              style={{ transitionDelay: '200ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}
            >
              {title.split(',').map((part, i) => (
                <span key={i}>
                  {i > 0 && <>, </>}
                  {i === 1 ? (
                    <span className="italic text-gold-400">{part.trim()}</span>
                  ) : (
                    part
                  )}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              className="text-white/70 text-lg font-sans leading-relaxed mb-10 max-w-xl transition-all duration-700"
              style={{ transitionDelay: '300ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
            >
              {subtitle}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 transition-all duration-700"
              style={{ transitionDelay: '400ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
            >
              <Button size="lg" variant="primary" onClick={scrollToContact}>
                {primaryButtonText}
              </Button>
              <Button size="lg" variant="secondary" onClick={(e) => {
                e.preventDefault();
                document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {secondaryButtonText}
              </Button>
            </div>

            {/* Stats row */}
            <div
              className="flex gap-8 mt-16 pt-8 border-t border-white/10 transition-all duration-700"
              style={{ transitionDelay: '500ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
            >
              {[
                { value: pickLang(heroContent.stats_years_experience) || '15+', label: 'Years Experience' },
                { value: pickLang(heroContent.stats_patients) || '2k+', label: 'Happy Patients' },
                { value: pickLang(heroContent.stats_satisfaction) || '100%', label: 'Satisfaction' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl font-semibold text-gold-400">{value}</p>
                  <p className="text-white/50 text-xs font-sans mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards column */}
          <div
            className="lg:col-span-2 hidden lg:grid grid-cols-2 gap-4 items-start relative transition-all duration-1000"
            style={{ transitionDelay: '300ms', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(32px)' }}
          >
            {/* Decorative background circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-gold-500/10 bg-gold-500/5" />
            </div>

            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="relative bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all duration-700"
                style={{
                  marginTop: i % 2 === 1 ? '40px' : '0',
                  transitionDelay: `${400 + i * 80}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(24px)',
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-gold-500/15 flex items-center justify-center mb-3">
                  <Icon className="text-gold-400 text-sm" />
                </div>
                <p className="text-white text-sm font-sans font-medium leading-snug mb-1">{title}</p>
                <p className="text-white/50 text-xs font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-gold-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
