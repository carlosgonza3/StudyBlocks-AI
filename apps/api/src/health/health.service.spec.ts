import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(healthService).toBeDefined();
  });

  it('should return the API health status', () => {
    const result = healthService.getStatus();

    expect(result).toEqual({
      status: 'ok',
      service: 'studyblocks-api',
      environment: 'test',
      timestamp: expect.any(String),
      uptimeSeconds: expect.any(Number),
    });
  });

  it('should return a valid ISO timestamp', () => {
    const result = healthService.getStatus();

    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it('should return a non-negative uptime', () => {
    const result = healthService.getStatus();

    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
