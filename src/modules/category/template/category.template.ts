import { I18nService } from 'nestjs-i18n';
import { CategoryResponse } from '../dto/categoryResponse.dto';
import { Category } from '../entity/category.entity';
import { CreateCategoryInput } from '../inputs/createCategoryr.input';
import { CreateCategoryStrategy } from '../strategy/category.stategy';
import { ICategoryHandler } from '../interfaces/ICategoryHandler.interface';

export abstract class CategoryOperationTemplate {
  constructor(protected readonly i18n: I18nService) {}

  async execute(): Promise<CategoryResponse> {
    await this.validate();
    const category = await this.process();
    return this.createResponse(category);
  }

  protected abstract validate(): Promise<void>;
  protected abstract process(): Promise<Category>;
  protected abstract createResponse(
    category: Category,
  ): Promise<CategoryResponse>;
}

export class CreateCategoryOperation extends CategoryOperationTemplate {
  constructor(
    i18n: I18nService,
    private readonly input: CreateCategoryInput,
    private readonly strategy: CreateCategoryStrategy,
    private readonly handler: ICategoryHandler,
  ) {
    super(i18n);
  }

  protected async validate(): Promise<void> {
    await this.handler.handle(null, this.i18n);
  }

  protected async process(): Promise<Category> {
    return this.strategy.execute(this.input);
  }

  protected async createResponse(
    category: Category,
  ): Promise<CategoryResponse> {
    return {
      data: category,
      statusCode: 201,
      message: await this.i18n.t('category.CREATED', {
        args: { name: category.name },
      }),
    };
  }
}
