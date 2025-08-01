import { ProductResponse } from "../dtos/productResponse.dto";

export interface IProductCommand {
  execute(): Promise<ProductResponse>;
}
