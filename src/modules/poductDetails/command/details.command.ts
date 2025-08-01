import { ProductDetailResponse } from '../dto/productDetailsResponse.dto';
import { CreateDetailInput } from '../inputs/createProductDetails.input';
import { UpdateProductDetailsInput } from '../inputs/updateProductDetails.input';
import { IProductDetailsCommand } from '../interfaces/IProductDetailsCommand.interface';
import { ProductDetailsService } from '../productDetails.service';

export class CreateDetailCommand implements IProductDetailsCommand {
  constructor(
    private service: ProductDetailsService,
    private input: CreateDetailInput,
    private userId: string,
  ) {}

  async execute(): Promise<ProductDetailResponse> {
    return this.service.add(this.input, this.userId);
  }
}

export class UpdateDetailCommand implements IProductDetailsCommand {
  constructor(
    private service: ProductDetailsService,
    private input: UpdateProductDetailsInput,
    private userId: string,
  ) {}

  async execute(): Promise<ProductDetailResponse> {
    return this.service.update(this.input, this.userId);
  }
}

export class DeleteDetailCommand implements IProductDetailsCommand {
  constructor(
    private service: ProductDetailsService,
    private id: string,
    private userId: string,
  ) {}

  async execute(): Promise<ProductDetailResponse> {
    return this.service.remove(this.id, this.userId);
  }
}
