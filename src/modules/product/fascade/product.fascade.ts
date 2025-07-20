import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductInput } from '../inputs/createProduct.input';
import { UpdateProductInput } from '../inputs/updateProduct.input';
import { ProductResponse } from '../dtos/productResponse.dto';
import { ProductService } from '../product.service';
import { ProductAction, ProductInput } from '../constant/product.constant';

@Injectable()
export class ProductFacadeService {
  constructor(private readonly productService: ProductService) {}

  async manageProduct(
    action: ProductAction,
    input: ProductInput,
    userId?: string,
  ): Promise<ProductResponse> {
    switch (action) {
      case 'create':
        return this.productService.create(input as CreateProductInput, userId!);
      case 'update':
        return this.productService.update(input as UpdateProductInput);
      case 'delete':
        return this.productService.remove(input as string, userId!);
      default:
        throw new BadRequestException('Invalid action');
    }
  }
}
