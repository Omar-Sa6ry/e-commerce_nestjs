import { IDeleteStrategy } from '../interfaces/IDaeleteStrategy.interface';

export class CloudinaryDeleteStrategy implements IDeleteStrategy {
  constructor(private cloudinary: any) {}

  async delete(publicId: string): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
