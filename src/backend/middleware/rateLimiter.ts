import { Request, Response, NextFunction } from 'express';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

export interface ClientRequest extends Request {
  clientId?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.startCleanup();
  }

  private getClientId(req: ClientRequest): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.requests.entries()) {
        if (record.resetTime < now) {
          this.requests.delete(key);
        }
      }
    }, this.config.windowMs);
  }

  middleware() {
    return (req: ClientRequest, res: Response, next: NextFunction): void => {
      const clientId = this.getClientId(req);
      const now = Date.now();

      let record = this.requests.get(clientId);

      if (!record || record.resetTime < now) {
        record = { count: 0, resetTime: now + this.config.windowMs };
        this.requests.set(clientId, record);
      }

      record.count++;

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - record.count));
      res.setHeader('X-RateLimit-Reset', record.resetTime);

      if (record.count > this.config.maxRequests) {
        res.status(429).json({
          error: this.config.message || 'Too many requests, please try again later.',
        });
        return;
      }

      next();
    };
  }
}

// Create rate limiters for different endpoints
export const createGeneralLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100): RateLimiter => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    message: 'Too many requests from this IP, please try again later.',
  });
};

export const createConfigLimiter = (windowMs = 60 * 1000, maxRequests = 20): RateLimiter => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    message: 'Too many configuration requests. Please wait before trying again.',
  });
};

export const createNewspaperLimiter = (windowMs = 5 * 60 * 1000, maxRequests = 30): RateLimiter => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    message: 'Too many newspaper requests. Please wait before requesting another page.',
  });
};
