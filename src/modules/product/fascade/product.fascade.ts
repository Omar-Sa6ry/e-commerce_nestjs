import { Injectable } from '@nestjs/common';
import { ProductResponse } from '../dtos/productResponse.dto';
import { ProductAction, ProductInput } from '../constant/product.constant';
import { ProductCommandFactory } from '../command/product.command';

@Injectable()
export class ProductFacadeService {
  constructor(private readonly commandFactory: ProductCommandFactory) {}

  async manageProduct(
    action: ProductAction,
    input: ProductInput,
    userId?: string,
  ): Promise<ProductResponse> {
    const command = this.commandFactory.createCommand(action, input, userId);
    return command.execute();
  }
}
