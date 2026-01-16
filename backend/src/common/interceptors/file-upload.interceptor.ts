import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export function createFileUploadInterceptor(options: {
  fieldName?: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
}) {
  const {
    fieldName = 'file',
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    destination = './uploads',
  } = options;

  // Create upload directory if it doesn't exist
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    }),
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`),
          false,
        );
      }
    },
  });
}

