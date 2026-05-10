import { Injectable, NotFoundException } from '@nestjs/common';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadsService {
  getImagePath(filename: string): string {
    const isPkg = (process as any).pkg;
    const uploadDir = isPkg
      ? join(dirname(process.execPath), 'uploads')
      : join(__dirname, '../../uploads');

    const filePath = join(uploadDir, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }
    return filePath;
  }
}
