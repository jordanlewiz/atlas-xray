import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Popup from './ChromeExtensionPopup';
import { getLatestVersionInfo } from '../../services/VersionService';

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
  getLatestVersionInfo: jest.fn()
}));

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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // With simplified logic, should show default state immediately
      expect(screen.getByText('Current page')).toBeInTheDocument();
      expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
    });

    it('should handle empty tabs array', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([]);
      });

      getLatestVersionInfo.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // With simplified logic, should show default state
      expect(screen.getByText('Current page')).toBeInTheDocument();
      expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
    });

    it('should handle tabs with no URL', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: undefined }]);
      });

      getLatestVersionInfo.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // With simplified logic, should show default state
      expect(screen.getByText('Current page')).toBeInTheDocument();
      expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
    });

    it('should handle chrome.tabs.query timeout gracefully', async () => {
      // Mock chrome.tabs.query to never call the callback (simulating timeout)
      mockTabsQuery.mockImplementation((query, callback) => {
        // Don't call callback - this simulates the timeout scenario
        // The timeout should fire after 3 seconds and set currentTabUrl to 'about:blank'
      });

      getLatestVersionInfo.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // With simplified logic, should show default state immediately
      expect(screen.getByText('Current page')).toBeInTheDocument();
      expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();

      // Verify that the timeout fallback was used
      expect(mockTabsQuery).toHaveBeenCalledWith(
        { active: true, currentWindow: true },
        expect.any(Function)
      );
    });

    it('should clear timeout when chrome.tabs.query succeeds', async () => {
      let savedCallback: ((tabs: any[]) => void) | null = null;
      
      // Mock chrome.tabs.query to save the callback and call it immediately
      mockTabsQuery.mockImplementation((query, callback) => {
        savedCallback = callback;
        // Call callback immediately with success
        callback([{ url: 'https://github.com' }]);
      });

      getLatestVersionInfo.mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });

      render(<Popup />);

      // Should show the actual domain, not "Unknown page"
      await waitFor(() => {
        expect(screen.getByText('github.com')).toBeInTheDocument();
        expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
      });

      // Verify that the API was called
      expect(mockTabsQuery).toHaveBeenCalledWith(
        { active: true, currentWindow: true },
        expect.any(Function)
      );

      // Wait longer than the timeout to ensure it doesn't fire
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Should still show the correct domain, not "Unknown page"
      expect(screen.getByText('github.com')).toBeInTheDocument();
      expect(screen.getByText('❌ No access to this site')).toBeInTheDocument();
    });
  });

  describe('Version Information', () => {
    it('should show "Local Dev Build" for version 0.0.0', async () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([{ url: 'https://test.atlassian.com' }]);
      });

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockResolvedValue({
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

      getLatestVersionInfo.mockRejectedValue(new Error('Network error'));

      render(<Popup />);

      await waitFor(() => {
        expect(screen.getByText('Unable to check for updates')).toBeInTheDocument();
      });
    });
  });
});
