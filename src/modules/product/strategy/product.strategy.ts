import { Between, FindOptionsWhere, ILike } from "typeorm";
import { IProductSearchStrategy } from "../interfaces/IProductsearch.interface";
import { FindProductInput } from "../inputs/findProduct.input";
import { Product } from "../entities/product.entity";

export class NameSearchStrategy implements IProductSearchStrategy {
  buildWhereClause(input: FindProductInput): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};
    if (input.name) {
      where.name = ILike(`%${input.name.trim()}%`);
    }
    return where;
  }
}

export class CategorySearchStrategy implements IProductSearchStrategy {
  buildWhereClause(input: FindProductInput): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};
    if (input.categoryId) {
      where.category = { id: input.categoryId };
    }
    return where;
  }
}

export class PriceRangeSearchStrategy implements IProductSearchStrategy {
  buildWhereClause(input: FindProductInput): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};
    if (
      typeof input.priceMin === 'number' ||
      typeof input.priceMax === 'number'
    ) {
      const min = input.priceMin ?? 0;
      const max = input.priceMax ?? Number.MAX_SAFE_INTEGER;
      where.price = Between(min, max);
    }
    return where;
  }
}

export class ProductSearchContext {
  private strategies: IProductSearchStrategy[] = [];

  addStrategy(strategy: IProductSearchStrategy): void {
    this.strategies.push(strategy);
  }

  buildWhereClause(input?: FindProductInput): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};
    if (!input) return where;

    for (const strategy of this.strategies) {
      Object.assign(where, strategy.buildWhereClause(input));
    }

    return where;
  }
}
