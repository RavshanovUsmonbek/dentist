import { useState } from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../ui/Card';
import { useSite } from '../../context/SiteContext';
import { testimonials as fallbackTestimonials } from '../../data/testimonials';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Testimonials = () => {
  const { t } = useTranslation();
  const { testimonials, loading } = useSite();

  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success | error

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

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
      <section id="testimonials" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-700 mb-4">{t('sections.testimonials.title')}</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('sections.testimonials.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} hover={true} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {testimonial.initials}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex-grow">
                  <FaQuoteLeft className="absolute top-0 left-0 text-4xl text-primary-100" />
                  <p className="text-gray-600 italic pl-10 pt-2">{testimonial.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Leave a Review form */}
        <div className="mt-16 max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-primary-700 mb-6 text-center">{t('sections.testimonials.leaveReview')}</h3>

          {submitState === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700">
              {t('sections.testimonials.submitSuccess')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.testimonials.yourName')}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.testimonials.yourRating')}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1"
                    >
                      <FaStar className={`text-2xl ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.testimonials.yourReview')}
                </label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {submitState === 'error' && (
                <p className="text-red-600 text-sm">{t('sections.testimonials.submitError')}</p>
              )}

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
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
