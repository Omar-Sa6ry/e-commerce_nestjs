import { Image } from '../entities/image.entity';

export class ImageFactory {
  static create(path: string, productId: string): Image {
    const image = new Image();
    image.path = path;
    image.productId = productId;
    return image;
  }
}
