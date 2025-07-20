import { Repository } from 'typeorm';
import { Color } from '../entity/color.entity';

export class ColorRepositoryProxy {
  constructor(private readonly colorRepository: Repository<Color>) {}

  async findOneById(id: string): Promise<Color | null> {
    return this.colorRepository.findOne({ where: { id } });
  }

  async findOneByName(name: string): Promise<Color | null> {
    return this.colorRepository.findOne({ where: { name } });
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ items: Color[]; total: number }> {
    const [items, total] = await this.colorRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }
}
