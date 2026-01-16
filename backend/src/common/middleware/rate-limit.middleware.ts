import { Injectable, NestMiddleware } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Rate limiting is handled by ThrottlerGuard
    // This middleware can be used for additional rate limiting logic
    next();
  }
}

