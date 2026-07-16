import { Injectable, NotFoundException } from '@nestjs/common';
import type { StudyGuide } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import type { UpdateStudyGuideDto } from './dto/update-study-guide.dto';

const LOCAL_DEV_OWNER_ID = 'local-dev-user';

@Injectable()
export class StudyGuidesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMainStudyGuide(courseId: string): Promise<StudyGuide> {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        ownerId: LOCAL_DEV_OWNER_ID,
      },
      include: {
        studyGuide: true,
      },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with id "${courseId}" was not found.`,
      );
    }

    if (course.studyGuide) {
      return course.studyGuide;
    }

    return this.prismaService.studyGuide.create({
      data: {
        title: `${course.title} Study Guide`,
        contentMarkdown: '',
        courseId: course.id,
      },
    });
  }

  async updateMainStudyGuide(
    courseId: string,
    updateStudyGuideDto: UpdateStudyGuideDto,
  ): Promise<StudyGuide> {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        ownerId: LOCAL_DEV_OWNER_ID,
      },
      include: {
        studyGuide: true,
      },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with id "${courseId}" was not found.`,
      );
    }

    return this.prismaService.studyGuide.upsert({
      where: {
        courseId: course.id,
      },
      update: {
        title: updateStudyGuideDto.title,
        contentMarkdown: updateStudyGuideDto.contentMarkdown,
      },
      create: {
        title: updateStudyGuideDto.title ?? `${course.title} Study Guide`,
        contentMarkdown: updateStudyGuideDto.contentMarkdown ?? '',
        courseId: course.id,
      },
    });
  }
}
