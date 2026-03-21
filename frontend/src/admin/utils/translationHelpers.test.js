import { describe, it, expect } from 'vitest';
import {
  createEmptyTranslation,
  createTranslationFromValue,
  prepareTranslationsForAPI,
  extractTranslationsFromAPI,
  validateTranslations,
} from './translationHelpers';

// ── createEmptyTranslation ─────────────────────────────────────────────────

describe('createEmptyTranslation', () => {
  it('returns empty strings for all languages by default', () => {
    expect(createEmptyTranslation()).toEqual({ uz: '', ru: '', en: '' });
  });

  it('returns the default value for all languages when provided', () => {
    expect(createEmptyTranslation('x')).toEqual({ uz: 'x', ru: 'x', en: 'x' });
  });
});

// ── createTranslationFromValue ─────────────────────────────────────────────

describe('createTranslationFromValue', () => {
  it('sets uz to the given value, ru and en to empty strings', () => {
    expect(createTranslationFromValue('hello')).toEqual({ uz: 'hello', ru: '', en: '' });
  });

  it('returns empty strings for all languages when value is undefined', () => {
    expect(createTranslationFromValue(undefined)).toEqual({ uz: '', ru: '', en: '' });
  });

  it('returns empty strings for all languages when value is null', () => {
    expect(createTranslationFromValue(null)).toEqual({ uz: '', ru: '', en: '' });
  });

  it('returns empty strings for all languages when value is empty string', () => {
    expect(createTranslationFromValue('')).toEqual({ uz: '', ru: '', en: '' });
  });
});

// ── prepareTranslationsForAPI ──────────────────────────────────────────────

describe('prepareTranslationsForAPI', () => {
  it('moves translatable fields to translations object and sets base field to uz value', () => {
    const formData = {
      title: { uz: 'A', ru: 'B', en: 'C' },
      active: true,
    };
    const result = prepareTranslationsForAPI(formData, ['title']);

    expect(result.title).toBe('A');
    expect(result.translations.title).toEqual({ uz: 'A', ru: 'B', en: 'C' });
    expect(result.active).toBe(true);
  });

  it('passes non-translatable fields through unchanged', () => {
    const formData = {
      title: { uz: 'Title', ru: '', en: '' },
      display_order: 5,
      active: false,
    };
    const result = prepareTranslationsForAPI(formData, ['title']);

    expect(result.display_order).toBe(5);
    expect(result.active).toBe(false);
  });

  it('defaults empty/missing language values to empty string', () => {
    const formData = {
      title: { uz: 'Tish' },
    };
    const result = prepareTranslationsForAPI(formData, ['title']);

    expect(result.translations.title).toEqual({ uz: 'Tish', ru: '', en: '' });
  });

  it('handles multiple translatable fields', () => {
    const formData = {
      title: { uz: 'T-uz', ru: 'T-ru', en: 'T-en' },
      description: { uz: 'D-uz', ru: 'D-ru', en: 'D-en' },
    };
    const result = prepareTranslationsForAPI(formData, ['title', 'description']);

    expect(result.title).toBe('T-uz');
    expect(result.description).toBe('D-uz');
    expect(result.translations.title).toEqual({ uz: 'T-uz', ru: 'T-ru', en: 'T-en' });
    expect(result.translations.description).toEqual({ uz: 'D-uz', ru: 'D-ru', en: 'D-en' });
  });
});

// ── extractTranslationsFromAPI ─────────────────────────────────────────────

describe('extractTranslationsFromAPI', () => {
  it('fills all language slots from translations when present', () => {
    const apiData = {
      title: 'Base',
      translations: {
        title: { uz: 'Tish', ru: 'Зуб', en: 'Tooth' },
      },
    };
    const result = extractTranslationsFromAPI(apiData, ['title']);

    expect(result.title).toEqual({ uz: 'Tish', ru: 'Зуб', en: 'Tooth' });
  });

  it('falls back to base field for uz when translations are missing', () => {
    const apiData = { title: 'Base Title' };
    const result = extractTranslationsFromAPI(apiData, ['title']);

    expect(result.title).toEqual({ uz: 'Base Title', ru: '', en: '' });
  });

  it('returns empty strings for all languages when field is entirely missing', () => {
    const apiData = {};
    const result = extractTranslationsFromAPI(apiData, ['title']);

    expect(result.title).toEqual({ uz: '', ru: '', en: '' });
  });

  it('does not modify non-translatable fields', () => {
    const apiData = {
      title: 'T',
      translations: { title: { uz: 'T', ru: '', en: '' } },
      active: true,
      display_order: 3,
    };
    const result = extractTranslationsFromAPI(apiData, ['title']);

    expect(result.active).toBe(true);
    expect(result.display_order).toBe(3);
  });
});

// ── validateTranslations ───────────────────────────────────────────────────

describe('validateTranslations', () => {
  it('returns null when uz is present for all required fields', () => {
    const formData = {
      title: { uz: 'Tish', ru: '', en: '' },
      description: { uz: 'Tavsif', ru: '', en: '' },
    };
    expect(validateTranslations(formData, ['title', 'description'])).toBeNull();
  });

  it('returns error object when uz is missing for a field', () => {
    const formData = {
      title: { uz: '', ru: 'Зуб', en: 'Tooth' },
    };
    const err = validateTranslations(formData, ['title']);
    expect(err).not.toBeNull();
    expect(err.field).toBe('title');
    expect(err.message).toContain('title');
  });

  it('returns error when uz is whitespace only', () => {
    const formData = {
      title: { uz: '   ', ru: 'Зуб', en: '' },
    };
    const err = validateTranslations(formData, ['title']);
    expect(err).not.toBeNull();
  });

  it('returns null when only ru and en are empty (they are optional)', () => {
    const formData = {
      title: { uz: 'Tish', ru: '', en: '' },
    };
    expect(validateTranslations(formData, ['title'])).toBeNull();
  });

  it('returns null for empty required fields array', () => {
    const formData = { title: { uz: '', ru: '', en: '' } };
    expect(validateTranslations(formData, [])).toBeNull();
  });
});
