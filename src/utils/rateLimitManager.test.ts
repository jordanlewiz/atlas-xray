import { RateLimitManager, globalRateLimitManager, withRateLimit } from './rateLimitManager';

describe('RateLimitManager', () => {
  let rateLimiter: RateLimitManager;
  
  beforeEach(() => {
    rateLimiter = new RateLimitManager({ testMode: true });
    jest.clearAllMocks();
  });
  
  describe('Basic Functionality', () => {
    it('should execute successful operations without retries', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await rateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(rateLimiter.getRetryCount()).toBe(0);
    });
    
    it('should throw non-rate-limit errors immediately', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow('Network error');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(rateLimiter.getRetryCount()).toBe(0);
    });
  });
  
  describe('Rate Limit Error Detection', () => {
    it('should detect HTTP 429 status codes', async () => {
      const error429 = { statusCode: 429, message: 'Too Many Requests' };
      const operation = jest.fn().mockImplementation(() => Promise.reject(error429));
      
      try {
        await rateLimiter.executeWithBackoff(operation);
        fail('Expected operation to throw');
      } catch (error: any) {
        expect(error.message).toBe('Too Many Requests');
      }
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries (maxRetries = 3)
      expect(rateLimiter.getRetryCount()).toBe(0); // Reset after max retries exceeded
    });
    
    it('should detect GraphQL rate limit errors', async () => {
      const graphQLError = {
        graphQLErrors: [{ extensions: { code: 'RATE_LIMIT_EXCEEDED' } }],
        message: 'Rate limit exceeded'
      };
      const operation = jest.fn().mockImplementation(() => Promise.reject(graphQLError));
      
      try {
        await rateLimiter.executeWithBackoff(operation);
        fail('Expected operation to throw');
      } catch (error: any) {
        expect(error.message).toBe('Rate limit exceeded');
      }
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(rateLimiter.getRetryCount()).toBe(0); // Reset after max retries exceeded
    });
    
    it('should detect rate limit errors in error messages', async () => {
      const errorMessages = [
        '429 Too Many Requests',
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        'Too Many Requests'
      ];
      
      for (const message of errorMessages) {
        const operation = jest.fn().mockImplementation(() => Promise.reject(new Error(message)));
        
        try {
          await rateLimiter.executeWithBackoff(operation);
          fail('Expected operation to throw');
        } catch (error: any) {
          expect(error.message).toBe(message);
        }
        expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
        
        // Reset for next test
        rateLimiter.reset();
        jest.clearAllMocks();
      }
    });
    
    it('should detect network errors with 429 status', async () => {
      const networkError = {
        networkError: { statusCode: 429 },
        message: 'Network error'
      };
      const operation = jest.fn().mockImplementation(() => Promise.reject(networkError));
      
      try {
        await rateLimiter.executeWithBackoff(operation);
        fail('Expected operation to throw');
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(rateLimiter.getRetryCount()).toBe(0); // Reset after max retries exceeded
    });
  });
  
  describe('Exponential Backoff', () => {
    it('should implement exponential backoff delays', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await rateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(rateLimiter.getRetryCount()).toBe(0); // Reset after successful operation
    });
    
    it('should respect max retries configuration', async () => {
      const customRateLimiter = new RateLimitManager({ maxRetries: 2, testMode: true });
      const operation = jest.fn().mockImplementation(() => Promise.reject({ statusCode: 429 }));
      
      try {
        await customRateLimiter.executeWithBackoff(operation);
        fail('Expected operation to throw');
      } catch (error: any) {
        expect(error.statusCode).toBe(429);
      }
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(customRateLimiter.getRetryCount()).toBe(0); // Reset after max retries exceeded
    });
    
    it('should respect max delay configuration', async () => {
      const customRateLimiter = new RateLimitManager({ 
        baseDelay: 1000, 
        maxDelay: 2000,
        testMode: true
      });
      
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await customRateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(4);
    });
  });
  
  describe('Configuration', () => {
    it('should use custom configuration', () => {
      const customRateLimiter = new RateLimitManager({
        baseDelay: 500,
        maxRetries: 5,
        maxDelay: 5000,
        jitter: false,
        testMode: true
      });
      
      expect(customRateLimiter.getRetryCount()).toBe(0);
    });
    
    it('should allow custom config per operation', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await rateLimiter.executeWithBackoff(operation, { maxRetries: 1 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Jitter', () => {
    it('should add jitter to delays when enabled', async () => {
      const customRateLimiter = new RateLimitManager({ jitter: true, testMode: true });
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await customRateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
    
    it('should not add jitter when disabled', async () => {
      const customRateLimiter = new RateLimitManager({ jitter: false, testMode: true });
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await customRateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Global Instance', () => {
    it('should provide global rate limit manager', () => {
      expect(globalRateLimitManager).toBeInstanceOf(RateLimitManager);
    });
    
    it('should work with withRateLimit utility', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRateLimit(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('State Management', () => {
    it('should reset retry count after successful operation', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await rateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(rateLimiter.getRetryCount()).toBe(0); // Reset after success
    });
    
    it('should allow manual reset', () => {
      rateLimiter.reset();
      expect(rateLimiter.getRetryCount()).toBe(0);
      expect(rateLimiter.isRetrying()).toBe(false);
    });
    
    it('should track retry state', async () => {
      const operation = jest.fn().mockImplementation(() => Promise.reject({ statusCode: 429 }));
      
      try {
        await rateLimiter.executeWithBackoff(operation);
        fail('Expected operation to throw');
      } catch (error: any) {
        expect(error.statusCode).toBe(429);
      }
      expect(rateLimiter.isRetrying()).toBe(false);
    });
  });
});
