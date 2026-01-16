import {
  Controller,
  Post,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { createFileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    createFileUploadInterceptor({
      fieldName: 'file',
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      destination: './uploads/avatars',
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadAvatar(file);
  }

  @Post('thumbnail')
  @ApiOperation({ summary: 'Upload course/challenge thumbnail' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    createFileUploadInterceptor({
      fieldName: 'file',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      destination: './uploads/thumbnails',
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadThumbnail(file);
  }

  @Post('document')
  @ApiOperation({ summary: 'Upload document file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    createFileUploadInterceptor({
      fieldName: 'file',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      destination: './uploads/documents',
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadDocument(file);
  }
}

