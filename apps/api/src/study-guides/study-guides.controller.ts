import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import type { StudyGuide } from '@prisma/client';

import { UpdateStudyGuideDto } from './dto/update-study-guide.dto';
import { StudyGuidesService } from './study-guides.service';

@Controller('courses/:courseId/study-guide')
export class StudyGuidesController {
  constructor(private readonly studyGuidesService: StudyGuidesService) {}

  @Get()
  async findMainStudyGuide(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<StudyGuide> {
    return this.studyGuidesService.findMainStudyGuide(courseId);
  }

  @Patch()
  async updateMainStudyGuide(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Body() updateStudyGuideDto: UpdateStudyGuideDto,
  ): Promise<StudyGuide> {
    return this.studyGuidesService.updateMainStudyGuide(
      courseId,
      updateStudyGuideDto,
    );
  }
}
