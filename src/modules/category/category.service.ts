import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { Category } from './entity/category.entity';
import { I18nService } from 'nestjs-i18n';
import {
  CategoriesResponse,
  CategoryResponse,
} from './dto/categoryResponse.dto';
import { CapitalizeWords } from 'src/common/constant/CapitalizeWords';

@Injectable()
export class CategoryService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(name: string): Promise<CategoryResponse> {
    const existedCategory = await this.categoryRepository.findOneBy({ name });
    if (existedCategory)
      throw new BadRequestException(
        await this.i18n.t('category.EXISTED', { args: { name } }),
      );

    const categoryName = await CapitalizeWords(name);

    const category = this.categoryRepository.create({ name: categoryName });
    await this.categoryRepository.save(category);

    return {
      data: category,
      statusCode: 201,
      message: await this.i18n.t('category.CREATED', { args: { name } }),
    };
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

    if (categories.length === 0)
      throw new NotFoundException(await this.i18n.t('category.NOT_FOUNDS'));

    return { items: categories };
  }

  async findById(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category)
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', { args: { id } }),
      );

    return { data: category };
  }

  async findByName(name: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ name });
    if (!category)
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', { args: { name } }),
      );

    return { data: category };
  }

  async update(id: string, name: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });

    const categoryName = await CapitalizeWords(name);
    category.name = categoryName;

    await this.categoryRepository.save(category);

    return {
      data: category,
      message: await this.i18n.t('category.UPDATED', { args: { name } }),
    };
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
