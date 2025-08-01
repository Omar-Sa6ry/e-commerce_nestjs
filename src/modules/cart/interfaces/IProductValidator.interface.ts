import { Details } from "src/modules/poductDetails/entity/productDetails.entity";
import { Product } from "src/modules/product/entities/product.entity";

export interface IProductValidator {
  validate(
    productId: string,
    detailsId: string,
  ): Promise<{ product: Product; detail: Details }>;
}