import { Category } from '../entity/category.entity';
import { CreateCategoryInput } from '../inputs/createCategoryr.input';
import { UpdateCategoryInput } from '../inputs/updateColor.input';

export class CategoryFactory {
  static async create(input: CreateCategoryInput): Promise<Category> {
    const category = new Category();
    category.name = input.name;
    return category;
  }

  static async update(
    category: Category,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    category.name = input.name
    return category;
  }
}
