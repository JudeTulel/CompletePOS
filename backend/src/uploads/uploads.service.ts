import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadsService {
  getImagePath(filename: string): string {
    const filePath = join(__dirname, '../../uploads', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }
    return filePath;
  }
}
