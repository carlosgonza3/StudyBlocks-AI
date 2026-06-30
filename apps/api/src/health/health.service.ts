import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { HealthStatus } from './health.types';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getStatus(): HealthStatus {
    return {
      status: 'ok',
      service: 'studyblocks-api',
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
