import { Controller, Post, UploadedFile, UseInterceptors, Res, Param, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.uploadsService.getImagePath(filename);
    const stream = createReadStream(filePath);
    stream.pipe(res);
  }
}
