import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import type { Course } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { CoursesService } from './courses.service';

const currentDate = new Date('2026-07-15T00:00:00.000Z');

function createCourseFixture(overrides: Partial<Course> = {}): Course {
  return {
    id: '2b2f4c6a-8d52-4d50-8e5b-5f9c4a0a1b25',
    title: 'Calculus II',
    description: 'Series and integrals',
    ownerId: 'local-dev-user',
    createdAt: currentDate,
    updatedAt: currentDate,
    ...overrides,
  };
}

type PrismaQueryArgument = unknown;

type MockPrismaService = {
  course: {
    findMany: jest.Mock<(query: PrismaQueryArgument) => Promise<Course[]>>;
    findFirst: jest.Mock<
      (query: PrismaQueryArgument) => Promise<Course | null>
    >;
    create: jest.Mock<(query: PrismaQueryArgument) => Promise<Course>>;
    update: jest.Mock<(query: PrismaQueryArgument) => Promise<Course>>;
    delete: jest.Mock<(query: PrismaQueryArgument) => Promise<Course>>;
  };
};

describe('CoursesService', () => {
  let coursesService: CoursesService;
  let prismaService: MockPrismaService;

  beforeEach(() => {
    prismaService = {
      course: {
        findMany: jest.fn<(query: PrismaQueryArgument) => Promise<Course[]>>(),
        findFirst:
          jest.fn<(query: PrismaQueryArgument) => Promise<Course | null>>(),
        create: jest.fn<(query: PrismaQueryArgument) => Promise<Course>>(),
        update: jest.fn<(query: PrismaQueryArgument) => Promise<Course>>(),
        delete: jest.fn<(query: PrismaQueryArgument) => Promise<Course>>(),
      },
    };

    coursesService = new CoursesService(
      prismaService as unknown as PrismaService,
    );
  });

  it('returns all courses for the local development owner', async () => {
    const courses = [
      createCourseFixture(),
      createCourseFixture({
        id: '3a3f4c6a-8d52-4d50-8e5b-5f9c4a0a1b25',
        title: 'Discrete Math',
      }),
    ];

    prismaService.course.findMany.mockResolvedValue(courses);

    await expect(coursesService.findAll()).resolves.toEqual(courses);

    expect(prismaService.course.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: 'local-dev-user',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  });

  it('returns one course by id', async () => {
    const course = createCourseFixture();

    prismaService.course.findFirst.mockResolvedValue(course);

    await expect(coursesService.findOne(course.id)).resolves.toEqual(course);
  });

  it('throws NotFoundException when a course does not exist', async () => {
    prismaService.course.findFirst.mockResolvedValue(null);

    await expect(
      coursesService.findOne('2b2f4c6a-8d52-4d50-8e5b-5f9c4a0a1b25'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a course for the local development owner', async () => {
    const course = createCourseFixture();

    prismaService.course.create.mockResolvedValue(course);

    await expect(
      coursesService.create({
        title: 'Calculus II',
        description: 'Series and integrals',
      }),
    ).resolves.toEqual(course);

    expect(prismaService.course.create).toHaveBeenCalledWith({
      data: {
        title: 'Calculus II',
        description: 'Series and integrals',
        ownerId: 'local-dev-user',
      },
    });
  });

  it('updates an existing course', async () => {
    const existingCourse = createCourseFixture();
    const updatedCourse = createCourseFixture({
      title: 'Advanced Calculus II',
    });

    prismaService.course.findFirst.mockResolvedValue(existingCourse);
    prismaService.course.update.mockResolvedValue(updatedCourse);

    await expect(
      coursesService.update(existingCourse.id, {
        title: 'Advanced Calculus II',
      }),
    ).resolves.toEqual(updatedCourse);

    expect(prismaService.course.update).toHaveBeenCalledWith({
      where: {
        id: existingCourse.id,
      },
      data: {
        title: 'Advanced Calculus II',
        description: undefined,
      },
    });
  });

  it('deletes an existing course', async () => {
    const course = createCourseFixture();

    prismaService.course.findFirst.mockResolvedValue(course);
    prismaService.course.delete.mockResolvedValue(course);

    await expect(coursesService.remove(course.id)).resolves.toEqual(course);

    expect(prismaService.course.delete).toHaveBeenCalledWith({
      where: {
        id: course.id,
      },
    });
  });
});
