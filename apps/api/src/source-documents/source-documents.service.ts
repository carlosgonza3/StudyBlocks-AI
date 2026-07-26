import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SourceDocumentStatus, type SourceDocument } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PDFParse } from 'pdf-parse';

import { PrismaService } from '../database/prisma.service';
import { SourceDocumentStorageService } from './source-document-storage.service';

const LOCAL_DEV_OWNER_ID = 'local-dev-user';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['.md', '.markdown', '.pdf', '.txt']);

export function sanitizeExtractedText(value: string): string {
  return value.replaceAll('\u0000', '').replace(/\r\n?/g, '\n').trim();
}

@Injectable()
export class SourceDocumentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: SourceDocumentStorageService,
  ) {}

  async findAll(courseId: string): Promise<SourceDocument[]> {
    await this.ensureCourse(courseId);

    return this.prismaService.sourceDocument.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(
    courseId: string,
    file: Express.Multer.File | undefined,
  ): Promise<SourceDocument> {
    await this.ensureCourse(courseId);
    this.validateFile(file);

    const validFile = file as Express.Multer.File;
    const extension = extname(validFile.originalname).toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    const createdDocument = await this.prismaService.sourceDocument.create({
      data: {
        courseId,
        originalName: validFile.originalname,
        storedName,
        mimeType: validFile.mimetype,
        sizeBytes: validFile.size,
        storagePath: '',
        status: SourceDocumentStatus.PROCESSING,
      },
    });

    let storagePath = '';

    try {
      storagePath = await this.storageService.write(
        courseId,
        storedName,
        validFile.buffer,
      );
      const extractedText = await this.extractText(validFile, extension);

      return await this.prismaService.sourceDocument.update({
        where: { id: createdDocument.id },
        data: {
          storagePath,
          extractedText,
          status: SourceDocumentStatus.READY,
          errorMessage: null,
        },
      });
    } catch (error) {
      return this.prismaService.sourceDocument.update({
        where: { id: createdDocument.id },
        data: {
          storagePath,
          status: SourceDocumentStatus.FAILED,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Document processing failed.',
        },
      });
    }
  }

  async remove(courseId: string, documentId: string): Promise<SourceDocument> {
    await this.ensureCourse(courseId);
    const document = await this.prismaService.sourceDocument.findFirst({
      where: {
        id: documentId,
        courseId,
      },
    });

    if (!document) {
      throw new NotFoundException(
        `Source document with id "${documentId}" was not found.`,
      );
    }

    if (document.storagePath) {
      await this.storageService.remove(document.storagePath);
    }

    return this.prismaService.sourceDocument.delete({
      where: { id: document.id },
    });
  }

  private async ensureCourse(courseId: string): Promise<void> {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        ownerId: LOCAL_DEV_OWNER_ID,
      },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with id "${courseId}" was not found.`,
      );
    }
  }

  private validateFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException('A source document is required.');
    }

    const extension = extname(file.originalname).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      throw new BadRequestException(
        'Only PDF, Markdown, and plain-text documents are supported.',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Documents must be 10 MB or smaller.');
    }

    if (file.size === 0) {
      throw new BadRequestException('The selected document is empty.');
    }

    if (
      extension === '.pdf' &&
      file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
    ) {
      throw new BadRequestException('The selected file is not a valid PDF.');
    }

    if (extension !== '.pdf' && file.buffer.includes(0)) {
      throw new BadRequestException(
        'The selected file does not appear to contain plain text.',
      );
    }
  }

  private async extractText(
    file: Express.Multer.File,
    extension: string,
  ): Promise<string> {
    if (extension !== '.pdf') {
      return sanitizeExtractedText(file.buffer.toString('utf8'));
    }

    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      return sanitizeExtractedText(result.text);
    } finally {
      await parser.destroy();
    }
  }
}
