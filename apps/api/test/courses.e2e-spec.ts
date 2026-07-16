import type { Server } from 'node:http';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Course } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

type CourseResponse = Omit<Course, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

describe('Courses endpoint (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);

    await app.init();

    await prismaService.course.deleteMany({
      where: {
        ownerId: 'local-dev-user',
      },
    });
  });

  afterEach(async () => {
    await prismaService.course.deleteMany({
      where: {
        ownerId: 'local-dev-user',
      },
    });

    await app.close();
  });

  it('creates a course', async () => {
    const httpServer = app.getHttpServer() as Server;

    const response = await request(httpServer)
      .post('/api/v1/courses')
      .send({
        title: 'Calculus II',
        description: 'Series and integrals',
      })
      .expect(201);

    const body = response.body as CourseResponse;

    expect(body).toMatchObject({
      title: 'Calculus II',
      description: 'Series and integrals',
      ownerId: 'local-dev-user',
    });

    expect(body.id).toEqual(expect.any(String));
    expect(body.createdAt).toEqual(expect.any(String));
    expect(body.updatedAt).toEqual(expect.any(String));
  });

  it('lists courses', async () => {
    const httpServer = app.getHttpServer() as Server;

    await prismaService.course.create({
      data: {
        title: 'Calculus II',
        description: 'Series and integrals',
        ownerId: 'local-dev-user',
      },
    });

    const response = await request(httpServer)
      .get('/api/v1/courses')
      .expect(200);

    const body = response.body as CourseResponse[];

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      title: 'Calculus II',
      description: 'Series and integrals',
      ownerId: 'local-dev-user',
    });
  });

  it('gets a course by id', async () => {
    const httpServer = app.getHttpServer() as Server;

    const course = await prismaService.course.create({
      data: {
        title: 'Calculus II',
        description: 'Series and integrals',
        ownerId: 'local-dev-user',
      },
    });

    const response = await request(httpServer)
      .get(`/api/v1/courses/${course.id}`)
      .expect(200);

    const body = response.body as CourseResponse;

    expect(body).toMatchObject({
      id: course.id,
      title: 'Calculus II',
      description: 'Series and integrals',
      ownerId: 'local-dev-user',
    });
  });

  it('updates a course', async () => {
    const httpServer = app.getHttpServer() as Server;

    const course = await prismaService.course.create({
      data: {
        title: 'Calculus II',
        description: 'Series and integrals',
        ownerId: 'local-dev-user',
      },
    });

    const response = await request(httpServer)
      .patch(`/api/v1/courses/${course.id}`)
      .send({
        title: 'Advanced Calculus II',
      })
      .expect(200);

    const body = response.body as CourseResponse;

    expect(body).toMatchObject({
      id: course.id,
      title: 'Advanced Calculus II',
      description: 'Series and integrals',
      ownerId: 'local-dev-user',
    });
  });

  it('deletes a course', async () => {
    const httpServer = app.getHttpServer() as Server;

    const course = await prismaService.course.create({
      data: {
        title: 'Calculus II',
        description: 'Series and integrals',
        ownerId: 'local-dev-user',
      },
    });

    await request(httpServer)
      .delete(`/api/v1/courses/${course.id}`)
      .expect(200);

    const deletedCourse = await prismaService.course.findUnique({
      where: {
        id: course.id,
      },
    });

    expect(deletedCourse).toBeNull();
  });

  it('rejects an empty title', async () => {
    const httpServer = app.getHttpServer() as Server;

    await request(httpServer)
      .post('/api/v1/courses')
      .send({
        title: '   ',
      })
      .expect(400);
  });

  it('returns 404 when a course does not exist', async () => {
    const httpServer = app.getHttpServer() as Server;

    await request(httpServer)
      .get('/api/v1/courses/2b2f4c6a-8d52-4d50-8e5b-5f9c4a0a1b25')
      .expect(404);
  });
});
