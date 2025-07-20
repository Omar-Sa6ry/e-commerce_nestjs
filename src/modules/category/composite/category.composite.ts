import { I18nService } from "nestjs-i18n";
import { ICategoryOperationValidator } from "../interfaces/ICategoryOperation.interface";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Category } from "../entity/category.entity";
import { Repository } from "typeorm";


export class CategoryExistsValidator implements ICategoryOperationValidator {
  constructor(
    private readonly i18n: I18nService,
    private readonly id: string,
  ) {}

  async validate(category: Category | null): Promise<void> {
    if (!category) {
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', { args: { id: this.id } }),
      );
    }
  }
}

export class CategoryNameValidator implements ICategoryOperationValidator {
  constructor(
    private readonly i18n: I18nService,
    private readonly name: string,
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async validate(category: Category | null): Promise<void> {
    const existing = await this.categoryRepository.findOneBy({
      name: this.name,
    });
    if (existing) {
      throw new BadRequestException(
        await this.i18n.t('category.EXISTED', { args: { name: this.name } }),
      );
    }
  }
}

export class CategoryValidatorComposite implements ICategoryOperationValidator {
  private validators: ICategoryOperationValidator[] = [];

  add(validator: ICategoryOperationValidator): void {
    this.validators.push(validator);
  }

  async validate(category: Category | null): Promise<void> {
    for (const validator of this.validators) {
      await validator.validate(category);
    }
  }
}
