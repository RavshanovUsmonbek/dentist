import { useState, useEffect, useCallback } from 'react';
import { FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useSite } from '../../context/SiteContext';
import { testimonials as fallbackTestimonials } from '../../data/testimonials';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Testimonials = () => {
  const { t } = useTranslation();
  const { testimonials, loading } = useSite();

  const [activeIndex, setActiveIndex] = useState(0);
  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [submitState, setSubmitState] = useState('idle');

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

  // Auto-advance carousel
  const next = useCallback(() => {
    setActiveIndex(i => (i + 1) % displayTestimonials.length);
  }, [displayTestimonials.length]);

  useEffect(() => {
    if (displayTestimonials.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, displayTestimonials.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState('submitting');
    try {
      await axios.post(`${API_URL}/testimonials`, form);
      setSubmitState('success');
      setForm({ name: '', rating: 5, text: '' });
    } catch {
      setSubmitState('error');
    }
  };

  if (loading) {
    return (
      <section id="testimonials" className="section-padding bg-primary-800">
        <div className="container-custom">
          <p className="text-white/50 text-center text-sm">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  const active = displayTestimonials[activeIndex] || {};

  return (
    <section id="testimonials" className="section-padding bg-primary-800">
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-16">
          <div className="w-12 h-0.5 bg-gold-500 mb-4" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white">
              {t('sections.testimonials.title')}
            </h2>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed font-sans">
              {t('sections.testimonials.subtitle')}
            </p>
          </div>
        </div>

        {/* Carousel */}
        {displayTestimonials.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
            {/* Quote panel */}
            <div className="lg:col-span-3 relative">
              {/* Decorative quote mark */}
              <div className="quote-mark absolute -top-4 -left-2 select-none">
                "
              </div>

              <div className="relative min-h-[200px]">
                <blockquote
                  key={activeIndex}
                  className="font-display text-2xl md:text-3xl font-light text-white/90 leading-relaxed italic animate-fade-in"
                >
                  "{active.text}"
                </blockquote>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-4 mt-8">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-gold-400 font-semibold">{active.initials}</span>
                </div>
                <div>
                  <p className="font-sans font-medium text-white text-sm">{active.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`text-xs ${i < active.rating ? 'text-gold-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {displayTestimonials.length > 1 && (
                <div className="flex items-center gap-4 mt-8">
                  <button
                    onClick={() => setActiveIndex(i => (i - 1 + displayTestimonials.length) % displayTestimonials.length)}
                    className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-gold-500 hover:text-gold-400 transition-colors flex items-center justify-center text-lg"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  {/* Dots */}
                  <div className="flex gap-2">
                    {displayTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 h-2 bg-gold-500' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                        aria-label={`Go to testimonial ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveIndex(i => (i + 1) % displayTestimonials.length)}
                    className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-gold-500 hover:text-gold-400 transition-colors flex items-center justify-center text-lg"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Mini list of others */}
            <div className="lg:col-span-2 space-y-3">
              {displayTestimonials.slice(0, 4).map((t2, i) => (
                <button
                  key={t2.id}
                  onClick={() => setActiveIndex(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    i === activeIndex
                      ? 'border-gold-500/40 bg-primary-700'
                      : 'border-white/5 bg-primary-900/30 hover:bg-primary-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-white/70 text-xs font-semibold">{t2.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-medium text-white/80 truncate">{t2.name}</p>
                      <p className="font-sans text-xs text-white/40 truncate mt-0.5">{t2.text?.slice(0, 50)}...</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Leave a Review form */}
        <div className="border-t border-white/10 pt-16">
          <h3 className="font-display text-2xl font-semibold text-white mb-8">{t('sections.testimonials.leaveReview')}</h3>

          {submitState === 'success' ? (
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-green-300 text-sm max-w-xl">
              {t('sections.testimonials.submitSuccess')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder=" "
                  id="review-name"
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                />
                <label htmlFor="review-name" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('sections.testimonials.yourName')} *
                </label>
              </div>

              <div>
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-3">{t('sections.testimonials.yourRating')}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <FaStar className={`text-2xl ${star <= form.rating ? 'text-gold-400' : 'text-white/20'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="floating-label-group">
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  placeholder=" "
                  id="review-text"
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', resize: 'none' }}
                />
                <label htmlFor="review-text" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('sections.testimonials.yourReview')} *
                </label>
              </div>

              {submitState === 'error' && (
                <p className="text-red-400 text-sm">{t('sections.testimonials.submitError')}</p>
              )}

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 text-sm"
              >
                {submitState === 'submitting'
                  ? t('sections.testimonials.submitting')
                  : t('sections.testimonials.submitReview')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
