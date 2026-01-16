import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'CodeCamp LMS API v1.0.0';
  }
}

