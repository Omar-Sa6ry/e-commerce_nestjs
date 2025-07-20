import { Repository } from 'typeorm';
import { Category } from '../entity/category.entity';
import { ICategoryValidator } from '../interfaces/ICategoryValidate.interface';
import { I18nService } from 'nestjs-i18n';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class CategoryValidatorAdapter implements ICategoryValidator {
  constructor(
    private readonly categoryRepository: Repository<Category>,
    private readonly i18n: I18nService,
  ) {}

  async validateExists(name: string): Promise<void> {
    const existedCategory = await this.categoryRepository.findOneBy({ name });
    if (existedCategory) {
      throw new BadRequestException(
        await this.i18n.t('category.EXISTED', { args: { name } }),
      );
    }
  }

  async validateNotExists(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', { args: { id } }),
      );
    }
    return category;
  }
}
