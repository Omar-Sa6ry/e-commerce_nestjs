import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductAction, ProductInput } from '../constant/product.constant';
import { ProductResponse } from '../dtos/productResponse.dto';
import { CreateProductInput } from '../inputs/createProduct.input';
import { UpdateProductInput } from '../inputs/updateProduct.input';
import { IProductCommand } from '../interfaces/IProductCommand.interface';
import { ProductService } from '../product.service';

export class CreateProductCommand implements IProductCommand {
  constructor(
    private readonly productService: ProductService,
    private readonly input: CreateProductInput,
    private readonly userId: string,
  ) {}

  async execute(): Promise<ProductResponse> {
    return this.productService.create(this.input, this.userId);
  }
}

export class UpdateProductCommand implements IProductCommand {
  constructor(
    private readonly productService: ProductService,
    private readonly input: UpdateProductInput,
  ) {}

  async execute(): Promise<ProductResponse> {
    return this.productService.update(this.input);
  }
}

export class DeleteProductCommand implements IProductCommand {
  constructor(
    private readonly productService: ProductService,
    private readonly input: string,
    private readonly userId: string,
  ) {}

  async execute(): Promise<ProductResponse> {
    return this.productService.remove(this.input, this.userId);
  }
}

@Injectable()
export class ProductCommandFactory {
  constructor(private readonly productService: ProductService) {}

  createCommand(action: ProductAction, input: ProductInput, userId?: string) {
    switch (action) {
      case 'create':
        return new CreateProductCommand(
          this.productService,
          input as CreateProductInput,
          userId!,
        );
      case 'update':
        return new UpdateProductCommand(
          this.productService,
          input as UpdateProductInput,
        );
      case 'delete':
        return new DeleteProductCommand(
          this.productService,
          input as string,
          userId!,
        );
      default:
        throw new BadRequestException('Invalid action');
    }
  }
}
