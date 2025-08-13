import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryOperation } from './template/category.template';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryInput } from './inputs/createCategoryr.input';
import { UpdateCategoryInput } from './inputs/updateColor.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { Category } from './entity/category.entity';
import { I18nService } from 'nestjs-i18n';
import {
  CategoriesResponse,
  CategoryResponse,
} from './dto/categoryResponse.dto';
import {
  CreateCategoryStrategy,
  UpdateCategoryStrategy,
} from './strategy/category.stategy';
import {
  CategoryExistsHandler,
  CategoryExistsHandlerByName,
  CategoryNameHandler,
} from './chain/category.chain';

@Injectable()
export class CategoryService {
  constructor(
    private readonly i18n: I18nService,
    private readonly createStrategy: CreateCategoryStrategy,
    private readonly updateStrategy: UpdateCategoryStrategy,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  @Transactional()
  async create(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CategoryResponse> {
    const nameHandler = new CategoryNameHandler(
      createCategoryInput.name,
      this.categoryRepository,
    );

    const operation = new CreateCategoryOperation(
      this.i18n,
      createCategoryInput,
      this.createStrategy,
      nameHandler,
    );

    return operation.execute();
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CategoriesResponse> {
    const categories = await this.categoryRepository.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (categories.length === 0) {
      throw new NotFoundException(await this.i18n.t('category.NOT_FOUNDS'));
    }

    return { items: categories };
  }

  async findById(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });

    const existsHandler = new CategoryExistsHandler(id);
    await existsHandler.handle(category, this.i18n);

    return { data: category };
  }

  async findByName(name: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ name });

    const existsHandler = new CategoryExistsHandlerByName(name);
    await existsHandler.handle(category, this.i18n);

    return { data: category };
  }

  @Transactional()
  async update(
    id: string,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });

    const existsHandler = new CategoryExistsHandler(id);
    const nameHandler = new CategoryNameHandler(
      updateCategoryInput.name,
      this.categoryRepository,
    );

    existsHandler.setNext(nameHandler);
    await existsHandler.handle(category, this.i18n);

    const updatedCategory = await this.updateStrategy.execute(
      updateCategoryInput,
      category!,
    );
    await this.categoryRepository.save(updatedCategory);

    return {
      data: updatedCategory,
      message: await this.i18n.t('category.UPDATED', {
        args: { name: updatedCategory.name },
      }),
    };
  }

  @Transactional()
  async remove(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });

    const existsHandler = new CategoryExistsHandler(id);
    await existsHandler.handle(category, this.i18n);

    await this.categoryRepository.remove(category!);
    return {
      data: null,
      message: await this.i18n.t('category.DELETED', { args: { id } }),
    };
  }
}
