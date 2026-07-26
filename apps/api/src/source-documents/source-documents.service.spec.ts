import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { SourceDocumentStatus, type SourceDocument } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { SourceDocumentStorageService } from './source-document-storage.service';
import {
  sanitizeExtractedText,
  SourceDocumentsService,
} from './source-documents.service';

const currentDate = new Date('2026-07-26T00:00:00.000Z');
const courseId = '2b2f4c6a-8d52-4d50-8e5b-5f9c4a0a1b25';

function createDocumentFixture(
  overrides: Partial<SourceDocument> = {},
): SourceDocument {
  return {
    id: '3b2f4c6a-8d52-4d50-8e5b-5f9c4a0a1b26',
    courseId,
    originalName: 'lecture.md',
    storedName: 'stored.md',
    mimeType: 'text/markdown',
    sizeBytes: 17,
    storagePath: `${courseId}/stored.md`,
    extractedText: '# Lecture notes',
    status: SourceDocumentStatus.READY,
    errorMessage: null,
    createdAt: currentDate,
    updatedAt: currentDate,
    ...overrides,
  };
}

function createTextFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  const buffer = Buffer.from('# Lecture notes');

  return {
    fieldname: 'file',
    originalname: 'lecture.md',
    encoding: '7bit',
    mimetype: 'text/markdown',
    size: buffer.length,
    buffer,
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('SourceDocumentsService', () => {
  let service: SourceDocumentsService;
  let prismaService: {
    course: {
      findFirst: jest.Mock;
    };
    sourceDocument: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let storageService: {
    write: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    prismaService = {
      course: {
        findFirst: jest.fn().mockResolvedValue({ id: courseId }),
      },
      sourceDocument: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    storageService = {
      write: jest.fn(),
      remove: jest.fn(),
    };
    service = new SourceDocumentsService(
      prismaService as unknown as PrismaService,
      storageService as unknown as SourceDocumentStorageService,
    );
  });

  it('lists documents for a course newest first', async () => {
    const documents = [createDocumentFixture()];
    prismaService.sourceDocument.findMany.mockResolvedValue(documents);

    await expect(service.findAll(courseId)).resolves.toEqual(documents);
    expect(prismaService.sourceDocument.findMany).toHaveBeenCalledWith({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('stores and extracts a Markdown document', async () => {
    const processingDocument = createDocumentFixture({
      status: SourceDocumentStatus.PROCESSING,
      storagePath: '',
      extractedText: '',
    });
    const readyDocument = createDocumentFixture();
    prismaService.sourceDocument.create.mockResolvedValue(processingDocument);
    storageService.write.mockResolvedValue(`${courseId}/stored.md`);
    prismaService.sourceDocument.update.mockResolvedValue(readyDocument);

    await expect(service.upload(courseId, createTextFile())).resolves.toEqual(
      readyDocument,
    );

    expect(storageService.write).toHaveBeenCalledWith(
      courseId,
      expect.stringMatching(/\.md$/),
      Buffer.from('# Lecture notes'),
    );
    expect(prismaService.sourceDocument.update).toHaveBeenCalledWith({
      where: { id: processingDocument.id },
      data: {
        storagePath: `${courseId}/stored.md`,
        extractedText: '# Lecture notes',
        status: SourceDocumentStatus.READY,
        errorMessage: null,
      },
    });
  });

  it('rejects unsupported file types', async () => {
    await expect(
      service.upload(
        courseId,
        createTextFile({
          originalname: 'script.js',
          mimetype: 'text/javascript',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.sourceDocument.create).not.toHaveBeenCalled();
  });

  it('removes null bytes before saving extracted text', () => {
    expect(sanitizeExtractedText('Receipt\u0000 text\r\n')).toBe(
      'Receipt text',
    );
  });

  it('removes the stored file and database record', async () => {
    const document = createDocumentFixture();
    prismaService.sourceDocument.findFirst.mockResolvedValue(document);
    storageService.remove.mockResolvedValue(undefined);
    prismaService.sourceDocument.delete.mockResolvedValue(document);

    await expect(service.remove(courseId, document.id)).resolves.toEqual(
      document,
    );
    expect(storageService.remove).toHaveBeenCalledWith(document.storagePath);
    expect(prismaService.sourceDocument.delete).toHaveBeenCalledWith({
      where: { id: document.id },
    });
  });
});
