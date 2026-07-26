import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { SourceDocument } from '@prisma/client';

import { SourceDocumentsService } from './source-documents.service';

@Controller('courses/:courseId/source-documents')
export class SourceDocumentsController {
  constructor(
    private readonly sourceDocumentsService: SourceDocumentsService,
  ) {}

  @Get()
  async findAll(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<SourceDocument[]> {
    return this.sourceDocumentsService.findAll(courseId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async upload(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<SourceDocument> {
    return this.sourceDocumentsService.upload(courseId, file);
  }

  @Delete(':documentId')
  async remove(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<SourceDocument> {
    return this.sourceDocumentsService.remove(courseId, documentId);
  }
}
