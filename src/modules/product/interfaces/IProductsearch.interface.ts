import { FindOptionsWhere } from "typeorm";
import { FindProductInput } from "../inputs/findProduct.input";
import { Product } from "../entities/product.entity";

export interface IProductSearchStrategy {
  buildWhereClause(input?: FindProductInput): FindOptionsWhere<Product>;
}
