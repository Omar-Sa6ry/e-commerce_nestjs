import { Product } from "../entities/product.entity";

export interface ICacheObserver {
  onProductUpdated(product: Product): Promise<void>;
}
