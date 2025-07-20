import { I18nService } from 'nestjs-i18n';
import { IColorOperationValidator } from '../interfaces/colorOperation.interface';
import { Color } from '../entity/color.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class ColorExistsValidator implements IColorOperationValidator {
  constructor(
    private readonly i18n: I18nService,
    private readonly id: string,
  ) {}

  async validate(color: Color | null): Promise<void> {
    if (!color) {
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id: this.id } }),
      );
    }
  }
}

export class ColorNameValidator implements IColorOperationValidator {
  constructor(
    private readonly i18n: I18nService,
    private readonly name: string,
    private readonly colorRepository: Repository<Color>,
  ) {}

  async validate(color: Color | null): Promise<void> {
    const existing = await this.colorRepository.findOne({
      where: { name: this.name },
    });
    if (existing) {
      throw new BadRequestException(
        await this.i18n.t('color.EXISTED', { args: { name: this.name } }),
      );
    }
  }
}

export class ColorValidatorComposite implements IColorOperationValidator {
  private validators: IColorOperationValidator[] = [];

  add(validator: IColorOperationValidator): void {
    this.validators.push(validator);
  }

  async validate(color: Color | null): Promise<void> {
    for (const validator of this.validators) {
      await validator.validate(color);
    }
  }
}
