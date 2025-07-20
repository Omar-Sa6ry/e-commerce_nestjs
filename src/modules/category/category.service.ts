import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryInput } from './inputs/createCategoryr.input';
import { UpdateCategoryInput } from './inputs/updateColor.input';
import { ICategoryValidator } from './interfaces/ICategoryValidate.interface';
import { CategoryFacade } from './fascade/category.fascade';
import { CategoryValidatorAdapter } from './adapter/category.adapter';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CategoryRepositoryProxy } from './proxy/category.proxy';
import { Category } from './entity/category.entity';
import { I18nService } from 'nestjs-i18n';
import {
  CategoriesResponse,
  CategoryResponse,
} from './dto/categoryResponse.dto';
import {
  CategoryExistsValidator,
  CategoryValidatorComposite,
} from './composite/category.composite';



@Injectable()
export class CategoryService {
  private validator: ICategoryValidator;
  private facade: CategoryFacade;
  private repositoryProxy: CategoryRepositoryProxy;

  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    this.validator = new CategoryValidatorAdapter(categoryRepository, i18n);
    this.facade = new CategoryFacade(this.validator, this.i18n);
    this.repositoryProxy = new CategoryRepositoryProxy(categoryRepository);
  }

  async create(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CategoryResponse> {
    return this.facade.createCategory(createCategoryInput);
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CategoriesResponse> {
    const categories = await this.repositoryProxy.findAllPaginated(page, limit);

    if (categories.length === 0)
      throw new NotFoundException(await this.i18n.t('category.NOT_FOUNDS'));

    return { items: categories };
  }

  async findById(id: string): Promise<CategoryResponse> {
    const category = await this.repositoryProxy.findOneById(id);

    const validator = new CategoryValidatorComposite();
    validator.add(new CategoryExistsValidator(this.i18n, id));
    await validator.validate(category);

    return { data: category };
  }

  async findByName(name: string): Promise<CategoryResponse> {
    const category = await this.repositoryProxy.findOneByName(name);

    const validator = new CategoryValidatorComposite();
    validator.add(new CategoryExistsValidator(this.i18n, name));
    await validator.validate(category);

    return { data: category };
  }

  async update(
    id: string,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    return this.facade.updateCategory(id, updateCategoryInput);
  }

  async remove(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category)
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', { args: { id } }),
      );
    await this.categoryRepository.remove(category);
    return {
      data: null,
      message: await this.i18n.t('category.DELETED', { args: { id } }),
    };
  }
}
