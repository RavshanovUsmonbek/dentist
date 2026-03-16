/**
 * Translation Helper Functions
 *
 * These functions convert between the admin form data format (multi-language objects)
 * and the API format (base fields + translations object).
 *
 * Supported languages: Uzbek (uz), Russian (ru), English (en)
 * Uzbek is required, Russian and English are optional.
 */

/**
 * Prepares form data with multi-language objects for API submission
 *
 * Converts from:
 * { title: { uz: "...", ru: "...", en: "..." }, ... }
 *
 * To:
 * {
 *   title: "...",  // Uzbek value as base
 *   translations: {
 *     title: { uz: "...", ru: "...", en: "..." }
 *   }
 * }
 *
 * @param {Object} formData - Form data with multi-language objects
 * @param {Array<string>} translatableFields - Array of field names that should be translated
 * @returns {Object} API-ready data with base fields and translations object
 */
export const prepareTranslationsForAPI = (formData, translatableFields) => {
  const apiData = { ...formData };
  const translations = {};

  translatableFields.forEach(field => {
    if (formData[field] && typeof formData[field] === 'object') {
      // Set base field to Uzbek value (for backward compatibility)
      apiData[field] = formData[field].uz || '';

      // Build translations object
      translations[field] = {
        uz: formData[field].uz || '',
        ru: formData[field].ru || '',
        en: formData[field].en || ''
      };
    }
  });

  // Add translations object to API data
  apiData.translations = translations;

  return apiData;
};

/**
 * Extracts translations from API response into form data format
 *
 * Converts from API format:
 * {
 *   title: "...",
 *   translations: {
 *     title: { uz: "...", ru: "...", en: "..." }
 *   }
 * }
 *
 * To form data format:
 * { title: { uz: "...", ru: "...", en: "..." }, ... }
 *
 * @param {Object} apiData - API response data
 * @param {Array<string>} translatableFields - Array of field names that should be translated
 * @returns {Object} Form data with multi-language objects
 */
export const extractTranslationsFromAPI = (apiData, translatableFields) => {
  const formData = { ...apiData };

  translatableFields.forEach(field => {
    const translations = apiData.translations?.[field];
    if (translations) {
      // Use translations if available
      formData[field] = {
        uz: translations.uz || apiData[field] || '',
        ru: translations.ru || '',
        en: translations.en || ''
      };
    } else {
      // Backward compatibility: old data without translations
      // Put the base field value into Uzbek
      formData[field] = {
        uz: apiData[field] || '',
        ru: '',
        en: ''
      };
    }
  });

  return formData;
};

/**
 * Validates that Uzbek translation is present for all required fields
 *
 * @param {Object} formData - Form data with multi-language objects
 * @param {Array<string>} requiredFields - Array of field names that require Uzbek translation
 * @returns {Object|null} Error object with field name and message, or null if valid
 */
export const validateTranslations = (formData, requiredFields) => {
  for (const field of requiredFields) {
    if (!formData[field]?.uz || formData[field].uz.trim() === '') {
      return {
        field,
        message: `Uzbek translation is required for ${field}`
      };
    }
  }
  return null;
};

/**
 * Creates an empty multi-language object
 *
 * @param {string} [defaultValue=''] - Default value for all languages
 * @returns {Object} Multi-language object { uz: '', ru: '', en: '' }
 */
export const createEmptyTranslation = (defaultValue = '') => ({
  uz: defaultValue,
  ru: defaultValue,
  en: defaultValue
});

/**
 * Creates a multi-language object from a single value (sets it to Uzbek)
 *
 * @param {string} value - Value to set for Uzbek
 * @returns {Object} Multi-language object { uz: value, ru: '', en: '' }
 */
export const createTranslationFromValue = (value) => ({
  uz: value || '',
  ru: '',
  en: ''
});
