import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Popup from './ChromeExtensionPopup';

// Mock chrome global
const mockTabsQuery = jest.fn();
(global as any).chrome = {
  runtime: {
    getManifest: () => ({ version: '0.0.0' })
  },
  tabs: {
    query: mockTabsQuery
  }
};

// Mock VersionService
jest.mock('../../services/VersionService', () => ({
  checkForUpdatesOnPopupOpen: jest.fn()
}));

// Get the mocked function
const mockCheckForUpdatesOnPopupOpen = jest.mocked(
  require('../../services/VersionService').checkForUpdatesOnPopupOpen
);

describe('Popup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Site Access Detection', () => {
    it('should show "Has access to this site" for home.atlassian.com', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('home.atlassian.com')).toBeInTheDocument();
        expect(screen.getByText('✅ Has access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for github.com', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://github.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('github.com')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for atlassian.design', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://atlassian.design/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('atlassian.design')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for www.atlassian.com', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://www.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('www.atlassian.com')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for atlassian.net', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'http://atlassian.net' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('atlassian.net')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for jira.com domains', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://mycompany.jira.com/browse/PROJ-123' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('mycompany.jira.com')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should show "No access to this site" for confluence.com domains', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://company.atlassian.net/wiki/spaces/TEAM' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('company.atlassian.net')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should handle chrome.tabs.query error gracefully', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        throw new Error('Chrome API error');
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should handle empty tabs array', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should handle tabs with no URL', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{}]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should handle chrome.tabs.query timeout gracefully', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        // Simulate timeout by not calling callback
        setTimeout(() => {
          callback([{ url: 'https://home.atlassian.com/' }]);
        }, 100);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should clear timeout when chrome.tabs.query succeeds', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('home.atlassian.com')).toBeInTheDocument();
        expect(screen.getByText('✅ Has access to this site')).toBeInTheDocument();
      });
    });
  });

  describe('Version Information', () => {
    it('should show "Local Dev Build" for version 0.0.0', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText(/Local Dev Build/)).toBeInTheDocument();
      });
    });

    it('should show update available when hasUpdate is true', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: true,
        latestVersion: 'v1.1.0',
        releaseUrl: 'https://github.com/jordanlewiz/atlas-xray/releases/tag/v1.1.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ New version available: v1.1.0')).toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
      });
    });

    it('should show latest version when up to date', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('✅ Latest: v1.0.0')).toBeInTheDocument();
      });
    });

    it('should handle version check failure', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      mockCheckForUpdatesOnPopupOpen.mockRejectedValue(new Error('Network error'));

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText(/Local Dev Build/)).toBeInTheDocument();
      });
    });
  });
});
