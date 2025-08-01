import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
import { UploadServiceFactory } from './factories/upload.factory';
import { IUploadStrategy } from './interfaces/IUpload.interface';
import { IDeleteStrategy } from './interfaces/IDaeleteStrategy.interface';
import { IUploadObserver } from './interfaces/IUploadObserver.interface';
import { CloudinaryUploadStrategy } from './strategies/upload.strategy';
import { CloudinaryDeleteStrategy } from './strategies/delete.strategy';
import { UploadImageCommand } from './commands/upload.command';
import { DeleteImageCommand } from './commands/delete.command';
import { LoggingObserver } from './observer/upload.observer';

@Injectable()
export class UploadService {
  private readonly cloudinary;
  private uploadStrategy: IUploadStrategy;
  private deleteStrategy: IDeleteStrategy;
  private observers: IUploadObserver[] = [];

  constructor(private configService: ConfigService) {
    this.cloudinary = UploadServiceFactory.create(this.configService);
    this.uploadStrategy = new CloudinaryUploadStrategy(this.cloudinary);
    this.deleteStrategy = new CloudinaryDeleteStrategy(this.cloudinary);
    this.observers.push(new LoggingObserver());
  }

  addObserver(observer: IUploadObserver): void {
    this.observers.push(observer);
  }

  private notifyUploadSuccess(result: any): void {
    this.observers.forEach((observer) => observer.onUploadSuccess(result));
  }

  private notifyUploadError(error: Error): void {
    this.observers.forEach((observer) => observer.onUploadError(error));
  }

  private notifyDeleteSuccess(result: any): void {
    this.observers.forEach((observer) => observer.onDeleteSuccess(result));
  }

  private notifyDeleteError(error: Error): void {
    this.observers.forEach((observer) => observer.onDeleteError(error));
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

    const options = {
      folder: dirUpload,
      public_id: `${Date.now()}-${filename}`,
      resource_type: 'auto',
    };

    const command = new UploadImageCommand(
      this.uploadStrategy,
      stream,
      options,
    );

    try {
      const result: UploadApiResponse = await command.execute();

      if (!result?.secure_url) {
        throw new HttpException(
          'Cloudinary response invalid',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.notifyUploadSuccess(result);
      return result.secure_url;
    } catch (error) {
      this.notifyUploadError(error);
      throw new HttpException('Upload failed', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = imageUrl?.split('/').pop()?.split('.')[0];
    if (!publicId) {
      throw new HttpException('Invalid image URL', HttpStatus.BAD_REQUEST);
    }

    const command = new DeleteImageCommand(this.deleteStrategy, publicId);

    try {
      const result = await command.execute();

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new HttpException(
          `Failed to delete image. Reason: ${result.result}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.notifyDeleteSuccess(result);
    } catch (error) {
      this.notifyDeleteError(error);
      throw new HttpException('Delete failed', HttpStatus.BAD_REQUEST);
    }
  }
}
