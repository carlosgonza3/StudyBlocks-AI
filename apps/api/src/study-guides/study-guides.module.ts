import { Module } from '@nestjs/common';

import { StudyGuidesController } from './study-guides.controller';
import { StudyGuidesService } from './study-guides.service';

@Module({
  controllers: [StudyGuidesController],
  providers: [StudyGuidesService],
})
export class StudyGuidesModule {}
