import { ProductDetailResponse } from "../dto/productDetailsResponse.dto";

export interface IProductDetailsCommand {
  execute(): Promise<ProductDetailResponse>;
}
