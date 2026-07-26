import { Module } from '@nestjs/common';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SourceDocumentsModule } from '../source-documents/source-documents.module';

@Module({
  imports: [SourceDocumentsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
