import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';

@Injectable()
export class ProductDetailsLoader {
  private loader: DataLoader<string, Details[]>;

  constructor(
    @InjectRepository(Details)
    private readonly pDetailsRepository: Repository<Details>,
  ) {
    this.loader = new DataLoader<string, Details[]>(
      async (productIds: string[]) => {
        const details = await this.pDetailsRepository.find({
          where: {
            productId: In(productIds),
          },
          relations: ['product'],
        });

        const detailMap = new Map<string, Details[]>();
        for (const detail of details) {
          const productId = detail.product.id;
          if (!detailMap.has(productId)) {
            detailMap.set(productId, []);
          }
          detailMap.get(productId)!.push(detail);
        }

        return productIds.map((id) => detailMap.get(id) ?? []);
      },
    );
  }

  load(productId: string): Promise<Details[]> {
    return this.loader.load(productId);
  }

  async loadMany(productIds: string[]): Promise<Details[][]> {
    const results = await this.loader.loadMany(productIds);
    return results.filter(
      (result) => !(result instanceof Error),
    ) as Details[][];
  }
}
