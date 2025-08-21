/**
 * ProjectIdScanner Tests
 * 
 * Tests for the project ID scanning and data fetching functionality
 */

import { findMatchingProjectLinksFromHrefs } from './projectIdScanner';
import * as globalState from './globalState';

// Mock dependencies
jest.mock('./globalState');

describe('ProjectIdScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalState.setGlobalCloudAndSection as jest.Mock).mockReturnValue(undefined);
  });

  describe('findMatchingProjectLinksFromHrefs', () => {
    it('should find projects from standard Atlassian URLs', () => {
      const hrefs = [
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/TEST-123',
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/DEMO-456',
        null,
        undefined,
        '/some/other/url'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        projectId: 'TEST-123',
        cloudId: '12345678-1234-1234-1234-123456789abc',
        sectionId: '87654321-4321-4321-4321-cba987654321'
      });
      expect(results[1]).toEqual({
        projectId: 'DEMO-456',
        cloudId: '12345678-1234-1234-1234-123456789abc',
        sectionId: '87654321-4321-4321-4321-cba987654321'
      });
    });

    it('should handle duplicate project IDs from same cloud', () => {
      const hrefs = [
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/TEST-123',
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/TEST-123'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      // Should only return one unique combination of cloudId:projectId
      expect(results).toHaveLength(1);
      expect(results[0].projectId).toBe('TEST-123');
    });

    it('should handle duplicate project IDs from different clouds', () => {
      const hrefs = [
        '/o/11111111-1111-1111-1111-111111111111/s/22222222-2222-2222-2222-222222222222/project/TEST-123',
        '/o/33333333-3333-3333-3333-333333333333/s/44444444-4444-4444-4444-444444444444/project/TEST-123'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      // Should return both since they have different cloudIds
      expect(results).toHaveLength(2);
      expect(results[0].projectId).toBe('TEST-123');
      expect(results[1].projectId).toBe('TEST-123');
      expect(results[0].cloudId).not.toBe(results[1].cloudId);
    });

    it('should handle empty or invalid hrefs', () => {
      const hrefs = [null, undefined, '', '/invalid/url', '/project/invalid'];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      expect(results).toHaveLength(0);
    });

    it('should call setGlobalCloudAndSection for each unique project', () => {
      const hrefs = [
        '/o/11111111-1111-1111-1111-111111111111/s/22222222-2222-2222-2222-222222222222/project/TEST-123',
        '/o/33333333-3333-3333-3333-333333333333/s/44444444-4444-4444-4444-444444444444/project/DEMO-456'
      ];

      findMatchingProjectLinksFromHrefs(hrefs);

      expect(globalState.setGlobalCloudAndSection).toHaveBeenCalledTimes(2);
      expect(globalState.setGlobalCloudAndSection).toHaveBeenCalledWith({
        newCloudId: '11111111-1111-1111-1111-111111111111',
        newSectionId: '22222222-2222-2222-2222-222222222222'
      });
      expect(globalState.setGlobalCloudAndSection).toHaveBeenCalledWith({
        newCloudId: '33333333-3333-3333-3333-333333333333',
        newSectionId: '44444444-4444-4444-4444-444444444444'
      });
    });

    it('should handle malformed URLs', () => {
      const hrefs = [
        '/o/invalid-cloud-id/s/section/project/TEST-123', // Invalid cloud ID format
        '/o/11111111-1111-1111-1111-111111111111/s/invalid/project/TEST-123', // Invalid section ID
        '/o/11111111-1111-1111-1111-111111111111/s/22222222-2222-2222-2222-222222222222/project/invalid-project-id' // Invalid project ID
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      // Should only match valid URLs (none in this case)
      expect(results).toHaveLength(0);
    });

    it('should extract correct parts from complex URLs', () => {
      const hrefs = [
        '/o/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/s/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/project/ABC-123',
        '/o/cccccccc-cccc-cccc-cccc-cccccccccccc/s/dddddddd-dddd-dddd-dddd-dddddddddddd/project/XYZ-999'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      expect(results).toHaveLength(2);
      
      expect(results[0]).toEqual({
        projectId: 'ABC-123',
        cloudId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        sectionId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      });
      
      expect(results[1]).toEqual({
        projectId: 'XYZ-999',
        cloudId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        sectionId: 'dddddddd-dddd-dddd-dddd-dddddddddddd'
      });
    });

    it('should handle mixed valid and invalid URLs', () => {
      const hrefs = [
        '/o/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/s/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/project/VALID-123',
        '/invalid/url/structure',
        '/o/cccccccc-cccc-cccc-cccc-cccccccccccc/s/dddddddd-dddd-dddd-dddd-dddddddddddd/project/ALSO-456',
        null,
        '/another/invalid/url'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      expect(results).toHaveLength(2);
      expect(results[0].projectId).toBe('VALID-123');
      expect(results[1].projectId).toBe('ALSO-456');
    });

    it('should handle project IDs with different formats', () => {
      const hrefs = [
        '/o/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/s/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/project/A-1',
        '/o/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/s/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/project/PROJECT-999',
        '/o/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/s/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/project/LONG-12345'
      ];

      const results = findMatchingProjectLinksFromHrefs(hrefs);

      expect(results).toHaveLength(3);
      expect(results[0].projectId).toBe('A-1');
      expect(results[1].projectId).toBe('PROJECT-999');
      expect(results[2].projectId).toBe('LONG-12345');
    });
  });

  describe('Regex pattern validation', () => {
    it('should match the expected Atlassian URL format', () => {
      // Test the regex pattern directly
      const pattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;
      
      const validUrl = '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/TEST-123';
      const match = validUrl.match(pattern);
      
      expect(match).not.toBeNull();
      expect(match![1]).toBe('12345678-1234-1234-1234-123456789abc'); // cloudId
      expect(match![2]).toBe('87654321-4321-4321-4321-cba987654321'); // sectionId
      expect(match![3]).toBe('TEST-123'); // projectId
    });

    it('should not match invalid URL formats', () => {
      const pattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;
      
      const invalidUrls = [
        '/invalid/format',
        '/o/invalid-cloud/s/section/project/TEST-123',
        '/o/12345678-1234-1234-1234-123456789abc/s/invalid-section/project/TEST-123',
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/invalid-project',
        '/o/12345678-1234-1234-1234-123456789abc/s/87654321-4321-4321-4321-cba987654321/project/test-123' // lowercase
      ];

      invalidUrls.forEach(url => {
        expect(url.match(pattern)).toBeNull();
      });
    });
  });
});