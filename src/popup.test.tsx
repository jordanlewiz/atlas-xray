import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Popup from './popup';

// Mock chrome global
const mockTabsQuery = jest.fn();
global.chrome = {
  runtime: {
    getManifest: () => ({ version: '0.0.0' })
  },
  tabs: {
    query: mockTabsQuery
  }
} as any;

// Mock VersionChecker
jest.mock('./utils/versionChecker', () => ({
  VersionChecker: {
    getLatestVersionInfo: jest.fn(),
    isLocalDevVersion: () => true,
    getVersionType: () => 'Local Development Build'
  }
}));

import { VersionChecker } from './utils/versionChecker';

describe('Popup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Site Access Detection', () => {
    it('should show "Has access to this site" for home.atlassian.com', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://home.atlassian.com/' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
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
        callback([{ url: 'https://mycompany.confluence.com/wiki/spaces/PROJ' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('mycompany.confluence.com')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });
    });

    it('should handle chrome.tabs.query error gracefully', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        // Simulate chrome.tabs.query not calling callback (error case)
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Checking site access...')).toBeInTheDocument();

      // After timeout, should show fallback state
      await waitFor(() => {
        expect(screen.getByText('Unknown page')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Unable to determine site')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle empty tabs array', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('Unknown page')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Unable to determine site')).toBeInTheDocument();
      });
    });

    it('should handle tabs with no URL', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: undefined }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('Unknown page')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Unable to determine site')).toBeInTheDocument();
      });
    });
  });

  describe('Version Information', () => {
    it('should show "Local Dev Build" for version 0.0.0', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://test.atlassian.com' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('Installed: Local Dev Build')).toBeInTheDocument();
      });
    });

    it('should show update available when hasUpdate is true', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://test.atlassian.com' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: true,
        latestVersion: 'v1.1.0',
        releaseUrl: 'https://github.com/jordanlewiz/atlas-xray/releases/tag/v1.1.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText(/New version available: v1.1.0/)).toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
      });
    });

    it('should show latest version when up to date', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://test.atlassian.com' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText(/Latest: v1.0.0/)).toBeInTheDocument();
      });
    });

    it('should handle version check failure', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://test.atlassian.com' }]);
      });

      (VersionChecker.getLatestVersionInfo as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('Unable to check for updates')).toBeInTheDocument();
      });
    });
  });
});
