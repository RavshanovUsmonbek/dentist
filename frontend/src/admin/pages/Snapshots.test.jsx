import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { validateImport } from './Snapshots';

// ── validateImport (pure function tests) ──────────────────────────────────

const makeValidImport = (overrides = {}) => ({
  version: '1',
  services: [],
  testimonials: [],
  gallery_categories: [],
  gallery_images: [],
  locations: [],
  site_settings: [],
  site_content: [],
  ...overrides,
});

describe('validateImport', () => {
  it('returns null for valid snapshot data', () => {
    expect(validateImport(makeValidImport())).toBeNull();
  });

  it('returns error when version is missing', () => {
    const data = makeValidImport();
    delete data.version;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns error when version is not "1"', () => {
    expect(validateImport(makeValidImport({ version: '2' }))).not.toBeNull();
  });

  it('returns error when services key is missing', () => {
    const data = makeValidImport();
    delete data.services;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns error when testimonials key is missing', () => {
    const data = makeValidImport();
    delete data.testimonials;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns error when gallery_images key is missing', () => {
    const data = makeValidImport();
    delete data.gallery_images;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns error when locations key is missing', () => {
    const data = makeValidImport();
    delete data.locations;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns error when site_settings key is missing', () => {
    const data = makeValidImport();
    delete data.site_settings;
    expect(validateImport(data)).not.toBeNull();
  });

  it('returns null when all keys are present but arrays are empty', () => {
    expect(validateImport(makeValidImport())).toBeNull();
  });

  it('returns error when a required key is not an array', () => {
    expect(validateImport(makeValidImport({ services: {} }))).not.toBeNull();
  });
});

// ── Component render tests ─────────────────────────────────────────────────

vi.mock('../services/adminApi', () => ({
  adminApi: {
    getSnapshots: vi.fn(),
    createSnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
    restoreSnapshot: vi.fn(),
    exportSnapshot: vi.fn(),
    importSnapshot: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

import { adminApi } from '../services/adminApi';

beforeEach(() => {
  vi.clearAllMocks();
  adminApi.getSnapshots.mockResolvedValue({ data: [] });
});

describe('Snapshots component', () => {
  it('renders page title', async () => {
    const { default: Snapshots } = await import('./Snapshots');
    render(<Snapshots />);
    await waitFor(() => {
      expect(screen.getByText('admin.snapshots.title')).toBeInTheDocument();
    });
  });

  it('renders Create Snapshot button', async () => {
    const { default: Snapshots } = await import('./Snapshots');
    render(<Snapshots />);
    await waitFor(() => {
      expect(screen.getAllByText('admin.snapshots.createSnapshot').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no snapshots exist', async () => {
    adminApi.getSnapshots.mockResolvedValue({ data: [] });
    const { default: Snapshots } = await import('./Snapshots');
    render(<Snapshots />);
    await waitFor(() => {
      expect(screen.getByText('admin.snapshots.noSnapshots')).toBeInTheDocument();
    });
  });

  it('renders snapshot rows when snapshots exist', async () => {
    adminApi.getSnapshots.mockResolvedValue({
      data: [
        { id: 1, name: 'Snapshot One', description: 'First', created_at: '2025-01-01T00:00:00Z' },
        { id: 2, name: 'Snapshot Two', description: 'Second', created_at: '2025-01-02T00:00:00Z' },
      ],
    });
    const { default: Snapshots } = await import('./Snapshots');
    render(<Snapshots />);
    await waitFor(() => {
      expect(screen.getByText('Snapshot One')).toBeInTheDocument();
      expect(screen.getByText('Snapshot Two')).toBeInTheDocument();
    });
  });

  it('renders import section', async () => {
    const { default: Snapshots } = await import('./Snapshots');
    render(<Snapshots />);
    await waitFor(() => {
      expect(screen.getByText('admin.snapshots.importTitle')).toBeInTheDocument();
    });
  });
});
