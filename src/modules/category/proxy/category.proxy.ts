import { Repository } from "typeorm";
import { Category } from "../entity/category.entity";

export class CategoryRepositoryProxy {
  constructor(private readonly categoryRepository: Repository<Category>) {}

  async findOneById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ id });
  }

  async findOneByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ name });
  }

  async findAllPaginated(page: number, limit: number): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}