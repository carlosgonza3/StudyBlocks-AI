import { Injectable, NotFoundException } from '@nestjs/common';
import type { Course } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';

const LOCAL_DEV_OWNER_ID = 'local-dev-user';

@Injectable()
export class CoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Course[]> {
    return this.prismaService.course.findMany({
      where: {
        ownerId: LOCAL_DEV_OWNER_ID,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.prismaService.course.findFirst({
      where: {
        id,
        ownerId: LOCAL_DEV_OWNER_ID,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with id "${id}" was not found.`);
    }

    return course;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.prismaService.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description ?? null,
        ownerId: LOCAL_DEV_OWNER_ID,
      },
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    await this.findOne(id);

    return this.prismaService.course.update({
      where: {
        id,
      },
      data: {
        title: updateCourseDto.title,
        description: updateCourseDto.description,
      },
    });
  }

  async remove(id: string): Promise<Course> {
    await this.findOne(id);

    return this.prismaService.course.delete({
      where: {
        id,
      },
    });
  }
}
