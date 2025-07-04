import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
import { UploadServiceFactory } from './factories/upload.factory';

@Injectable()
export class UploadService {
  private readonly cloudinary;

  constructor(private configService: ConfigService) {
    this.cloudinary = UploadServiceFactory.create(this.configService);
  }

  async uploadImage(
    createImageInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<string> {
    if (!createImageInput.image) return null;

    const uploadedFile = await createImageInput.image;
    if (!uploadedFile || !uploadedFile.createReadStream) {
      throw new HttpException('Invalid image file', HttpStatus.BAD_REQUEST);
    }

    const { createReadStream, filename } = uploadedFile;
    const stream = createReadStream();

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: dirUpload,
          public_id: `${Date.now()}-${filename}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new HttpException('Upload failed', HttpStatus.BAD_REQUEST));
          } else {
            resolve(result);
          }
        },
      );
      stream.pipe(uploadStream);
    });

    if (!result?.secure_url) {
      throw new HttpException(
        'Cloudinary response invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result.secure_url;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = imageUrl?.split('/').pop()?.split('.')[0];
    if (!publicId)
      throw new HttpException('Invalid image URL', HttpStatus.BAD_REQUEST);

    const result = await this.cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new HttpException(
        `Failed to delete image. Reason: ${result.result}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
