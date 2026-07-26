import { Injectable } from '@nestjs/common';
import { mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

@Injectable()
export class SourceDocumentStorageService {
  private readonly uploadRoot = resolve(process.cwd(), 'uploads');

  async write(
    courseId: string,
    storedName: string,
    buffer: Buffer,
  ): Promise<string> {
    const courseDirectory = join(this.uploadRoot, courseId);
    const absolutePath = join(courseDirectory, storedName);

    await mkdir(courseDirectory, { recursive: true });
    await writeFile(absolutePath, buffer, { flag: 'wx' });

    return join(courseId, storedName);
  }

  async remove(storagePath: string): Promise<void> {
    try {
      await unlink(join(this.uploadRoot, storagePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async removeCourseDirectory(courseId: string): Promise<void> {
    await rm(join(this.uploadRoot, courseId), {
      recursive: true,
      force: true,
    });
  }
}
