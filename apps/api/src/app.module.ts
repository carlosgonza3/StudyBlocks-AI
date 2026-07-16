import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnvironment } from './config/environment.validation';
import { CoursesModule } from './courses/courses.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StudyGuidesModule } from './study-guides/study-guides.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    DatabaseModule,
    HealthModule,
    CoursesModule,
    StudyGuidesModule,
  ],
})
export class AppModule {}
