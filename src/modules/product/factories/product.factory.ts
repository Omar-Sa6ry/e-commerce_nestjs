import { Product } from '../entities/product.entity';
import { CreateProductInput } from '../inputs/createProduct.input';

export class ProductFactory {
  static create(
    input: CreateProductInput,
    companyId: string,
    userId: string,
  ): Product {
    const product = new Product();
    Object.assign(product, input);
    product.companyId = companyId;
    product.userId = userId;
    return product;
  }
}
