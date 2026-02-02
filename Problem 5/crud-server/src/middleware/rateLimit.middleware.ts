import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config';
import { cacheService } from '../services/cache.service';
import logger from '../utils/logger';

/**
 * Standard Rate Limiter (in-memory)
 */
export const standardRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Strict Rate Limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Redis-based Rate Limiter (for distributed systems)
 */
export const redisRateLimiter = async (req: Request, res: Response, next: () => void): Promise<void> => {
  if (!cacheService.isAvailable()) {
    return next();
  }

  const ip = req.ip || 'unknown';
  const key = `ratelimit:${ip}`;
  const windowSecs = Math.ceil(config.rateLimitWindowMs / 1000);

  try {
    const current = await cacheService.increment(key, windowSecs);

    res.setHeader('X-RateLimit-Limit', config.rateLimitMaxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.rateLimitMaxRequests - current).toString());

    if (current > config.rateLimitMaxRequests) {
      logger.warn('Redis rate limit exceeded', { ip, current });
      res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Redis rate limiter error:', error);
    next();
  }
};

export default standardRateLimiter;
