import { Injectable } from "@nestjs/common";
import { ProductDetailsService } from "../productDetails.service";
import { CreateDetailInput } from "../inputs/createProductDetails.input";
import { ProductDetailResponse } from "../dto/productDetailsResponse.dto";
import { UpdateProductDetailsInput } from "../inputs/updateProductDetails.input";
import { IProductDetailsCommand } from "../interfaces/IProductDetailsCommand.interface";
import { CreateDetailCommand, DeleteDetailCommand, UpdateDetailCommand } from "../command/details.command";

@Injectable()
export class ProductDetailsFacade {
  constructor(private readonly productDetailsService: ProductDetailsService) {}

  async manageProductDetails(
    action: 'create' | 'update' | 'delete',
    input: CreateDetailInput | UpdateProductDetailsInput | string,
    userId: string,
  ): Promise<ProductDetailResponse> {
    let command: IProductDetailsCommand


    switch (action) {
      case 'create':
        command = new CreateDetailCommand(
          this.productDetailsService,
          input as CreateDetailInput,
          userId,
        );
        break;
      case 'update':
        command = new UpdateDetailCommand(
          this.productDetailsService,
          input as UpdateProductDetailsInput,
          userId,
        );
        break;
      case 'delete':
        command = new DeleteDetailCommand(
          this.productDetailsService,
          input as string,
          userId,
        );
        break;
      default:
        throw new Error('Invalid action');
    }

    return command.execute();
  }
}
