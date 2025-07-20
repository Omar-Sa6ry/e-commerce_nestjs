import { I18nService } from 'nestjs-i18n';
import { CategoryService } from '../category.service';
import { CategoryResponse } from '../dto/categoryResponse.dto';
import { CategoryFactory } from '../factory/ctegory.factory';
import { CreateCategoryInput } from '../inputs/createCategoryr.input';
import { ICategoryValidator } from '../interfaces/ICategoryValidate.interface';
import { UpdateCategoryInput } from '../inputs/updateColor.input';

export class CategoryFacade {
  constructor(
    private readonly validator: ICategoryValidator,
    private readonly i18n: I18nService,
  ) {}

  async createCategory(input: CreateCategoryInput): Promise<CategoryResponse> {
    await this.validator.validateExists(input.name);
    const category = await CategoryFactory.create(input);

    return {
      data: category,
      statusCode: 201,
      message: await this.i18n.t('category.CREATED', {
        args: { name: input.name },
      }),
    };
  }

  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    const category = await this.validator.validateNotExists(id);
    const updatedCategory = await CategoryFactory.update(category, input);

    Object.assign(category, updatedCategory);
    return {
      data: updatedCategory,
      message: await this.i18n.t('category.UPDATED', {
        args: { name: updatedCategory.name },
      }),
    };
  }
}
