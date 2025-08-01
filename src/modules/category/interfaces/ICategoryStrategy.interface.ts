import { Category } from '../entity/category.entity';
import { CreateCategoryInput } from '../inputs/createCategoryr.input';
import { UpdateCategoryInput } from '../inputs/updateColor.input';

export interface ICategoryStrategy {
  execute(
    input: CreateCategoryInput | UpdateCategoryInput,
    category?: Category,
  ): Promise<Category>;
}
