import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => {
        const isPkg = (process as any).pkg;
        const uploadDir = isPkg
          ? join(require('path').dirname(process.execPath), 'uploads')
          : join(__dirname, '../../uploads');

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              const ext = file.originalname.split('.').pop();
              cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
            },
          }),
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule { }
