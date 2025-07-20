import { Injectable } from '@nestjs/common';
import { CreateDetailInput } from '../inputs/createProductDetails.input';
import { ProductDetailResponse } from '../dto/productDetailsResponse.dto';
import { UpdateProductDetailsInput } from '../inputs/updateProductDetails.input';
import { ProductDetailsService } from '../productDetails.service';

@Injectable()
export class ProductDetailsFacade {
  constructor(private readonly productDetailsService: ProductDetailsService) {}

  async manageProductDetails(
    action: 'create' | 'update' | 'delete',
    input: CreateDetailInput | UpdateProductDetailsInput | string,
    userId: string,
  ): Promise<ProductDetailResponse> {
    switch (action) {
      case 'create':
        return this.productDetailsService.add(
          input as CreateDetailInput,
          userId,
        );
      case 'update':
        return this.productDetailsService.update(
          input as UpdateProductDetailsInput,
          userId,
        );
      case 'delete':
        return this.productDetailsService.remove(input as string, userId);
      default:
        throw new Error('Invalid action');
    }
  }
}
