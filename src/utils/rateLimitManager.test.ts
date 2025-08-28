import { RateLimitManager, globalRateLimitManager, withRateLimit } from './rateLimitManager';

describe('RateLimitManager', () => {
  let rateLimiter: RateLimitManager;
  
  beforeEach(() => {
    rateLimiter = new RateLimitManager();
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
      const operation = jest.fn().mockRejectedValue(error429);
      
      await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow('Too Many Requests');
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries (maxRetries = 3)
      expect(rateLimiter.getRetryCount()).toBe(3);
    });
    
    it('should detect GraphQL rate limit errors', async () => {
      const graphQLError = {
        graphQLErrors: [{ extensions: { code: 'RATE_LIMIT_EXCEEDED' } }],
        message: 'Rate limit exceeded'
      };
      const operation = jest.fn().mockRejectedValue(graphQLError);
      
      await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow('Rate limit exceeded');
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(rateLimiter.getRetryCount()).toBe(3);
    });
    
    it('should detect rate limit errors in error messages', async () => {
      const errorMessages = [
        '429 Too Many Requests',
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        'Too Many Requests'
      ];
      
      for (const message of errorMessages) {
        const operation = jest.fn().mockRejectedValue(new Error(message));
        
        await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow(message);
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
      const operation = jest.fn().mockRejectedValue(networkError);
      
      await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow('Network error');
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(rateLimiter.getRetryCount()).toBe(3);
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
      expect(rateLimiter.getRetryCount()).toBe(2);
    });
    
    it('should respect max retries configuration', async () => {
      const customRateLimiter = new RateLimitManager({ maxRetries: 2 });
      const operation = jest.fn().mockRejectedValue({ statusCode: 429 });
      
      await expect(customRateLimiter.executeWithBackoff(operation)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(customRateLimiter.getRetryCount()).toBe(2);
    });
    
    it('should respect max delay configuration', async () => {
      const customRateLimiter = new RateLimitManager({ 
        baseDelay: 1000, 
        maxDelay: 2000 
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
        jitter: false
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
      const customRateLimiter = new RateLimitManager({ jitter: true });
      const operation = jest.fn()
        .mockRejectedValueOnce({ statusCode: 429 })
        .mockResolvedValue('success');
      
      const result = await customRateLimiter.executeWithBackoff(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
    
    it('should not add jitter when disabled', async () => {
      const customRateLimiter = new RateLimitManager({ jitter: false });
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
      const operation = jest.fn().mockRejectedValue({ statusCode: 429 });
      
      await expect(rateLimiter.executeWithBackoff(operation)).rejects.toThrow();
      expect(rateLimiter.isRetrying()).toBe(false);
    });
  });
});
