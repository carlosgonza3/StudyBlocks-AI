import { Module } from '@nestjs/common';

import { SourceDocumentStorageService } from './source-document-storage.service';
import { SourceDocumentsController } from './source-documents.controller';
import { SourceDocumentsService } from './source-documents.service';

@Module({
  controllers: [SourceDocumentsController],
  providers: [SourceDocumentsService, SourceDocumentStorageService],
  exports: [SourceDocumentStorageService],
})
export class SourceDocumentsModule {}
