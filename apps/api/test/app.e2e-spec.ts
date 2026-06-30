import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import type { Server } from 'node:http';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health', async () => {
    const httpServer = app.getHttpServer() as Server;

    const response = await request(httpServer)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'studyblocks-api',
      environment: expect.any(String),
      timestamp: expect.any(String),
      uptimeSeconds: expect.any(Number),
    });
  });
});
