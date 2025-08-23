/**
 * Rate Limit Manager for GraphQL API calls
 * Implements exponential backoff and rate limit detection to prevent 429 errors
 * 
 * Usage:
 * const rateLimiter = new RateLimitManager();
 * const result = await rateLimiter.executeWithBackoff(() => apolloClient.query({...}));
 */

export interface RateLimitConfig {
  baseDelay: number;        // Base delay in milliseconds (default: 1000)
  maxRetries: number;       // Maximum retry attempts (default: 3)
  maxDelay: number;         // Maximum delay cap in milliseconds (default: 10000)
  jitter: boolean;          // Add random jitter to prevent thundering herd (default: true)
}

export class RateLimitManager {
  private retryCount: number = 0;
  private config: RateLimitConfig;
  
  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      baseDelay: 1000,
      maxRetries: 3,
      maxDelay: 10000,
      jitter: true,
      ...config
    };
  }
  
  /**
   * Execute an operation with exponential backoff for rate limit errors
   */
  async executeWithBackoff<T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<T> {
    const config = { ...this.config, ...customConfig };
    this.retryCount = 0;
    
    try {
      return await operation();
    } catch (error) {
      if (this.isRateLimitError(error) && this.retryCount < config.maxRetries) {
        const delay = this.calculateDelay(config);
        this.retryCount++;
        
        console.log(`[RateLimit] Retry ${this.retryCount}/${config.maxRetries} after ${delay}ms delay`);
        console.log(`[RateLimit] Error: ${error.message || 'Unknown error'}`);
        
        await this.delay(delay);
        return this.executeWithBackoff(operation, customConfig);
      }
      
      // Reset retry count for non-rate-limit errors
      this.retryCount = 0;
      throw error;
    }
  }
  
  /**
   * Check if an error is a rate limit error (429)
   */
  private isRateLimitError(error: any): boolean {
    // Check for HTTP 429 status
    if (error?.statusCode === 429) return true;
    
    // Check for GraphQL rate limit errors
    if (error?.graphQLErrors?.some((e: any) => 
      e.extensions?.code === 'RATE_LIMIT_EXCEEDED' ||
      e.extensions?.code === '429'
    )) return true;
    
    // Check error message for rate limit indicators
    const message = error?.message || '';
    if (message.includes('429') || 
        message.includes('Too Many Requests') ||
        message.includes('Rate limit exceeded') ||
        message.includes('RATE_LIMIT_EXCEEDED')) {
      return true;
    }
    
    // Check network error for rate limiting
    if (error?.networkError?.statusCode === 429) return true;
    
    return false;
  }
  
  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(config: RateLimitConfig): number {
    const exponentialDelay = Math.min(
      config.baseDelay * Math.pow(2, this.retryCount),
      config.maxDelay
    );
    
    if (config.jitter) {
      // Add ±25% jitter to prevent thundering herd
      const jitterRange = exponentialDelay * 0.25;
      const jitter = (Math.random() - 0.5) * jitterRange;
      return Math.max(100, exponentialDelay + jitter); // Minimum 100ms
    }
    
    return exponentialDelay;
  }
  
  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Reset retry count (useful for new operations)
   */
  reset(): void {
    this.retryCount = 0;
  }
  
  /**
   * Get current retry count
   */
  getRetryCount(): number {
    return this.retryCount;
  }
  
  /**
   * Check if currently in retry mode
   */
  isRetrying(): boolean {
    return this.retryCount > 0;
  }
}

/**
 * Global rate limit manager instance for consistent usage across services
 */
export const globalRateLimitManager = new RateLimitManager();

/**
 * Utility function for quick rate-limited operations
 */
export async function withRateLimit<T>(
  operation: () => Promise<T>,
  config?: Partial<RateLimitConfig>
): Promise<T> {
  return globalRateLimitManager.executeWithBackoff(operation, config);
}
