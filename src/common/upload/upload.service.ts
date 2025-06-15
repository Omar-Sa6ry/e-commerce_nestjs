import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from './config/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    configureCloudinary(this.configService);
  }

  async uploadImage(
    createImageInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<string> {
    try {
      if (!createImageInput.image) return null;
      const uploadedFile = await createImageInput.image;

      if (
        !uploadedFile ||
        typeof uploadedFile.createReadStream !== 'function' ||
        !uploadedFile.filename
      ) {
        throw new HttpException('Invalid image file', HttpStatus.BAD_REQUEST);
      }

      const { createReadStream, filename } = uploadedFile;
      const stream = createReadStream();

      console.log('Uploading image...');

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: dirUpload,
            public_id: `${Date.now()}-${filename}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(
                new HttpException(
                  'Image upload failed',
                  HttpStatus.BAD_REQUEST,
                ),
              );
            } else {
              resolve(result);
            }
          },
        );

        stream.pipe(uploadStream);
      });

      if (!result || !result.secure_url) {
        throw new HttpException(
          'Cloudinary response invalid',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result.secure_url;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = imageUrl?.split('/').pop()?.split('.')[0];

      if (!publicId)
        throw new HttpException('Invalid Image URL', HttpStatus.BAD_REQUEST);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new HttpException(
          `Failed to delete image. Reason: ${result.result}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Deleted Image:', imageUrl);
    } catch (error) {
      console.error('Delete Image Error:', error);
      throw new HttpException(
        error?.message || 'Error deleting image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
