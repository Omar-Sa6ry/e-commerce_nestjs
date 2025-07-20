import { Repository } from 'typeorm';
import { Color } from '../entity/color.entity';
import { IColorValidator } from '../interfaces/IColorValidator.interface';
import { I18nService } from 'nestjs-i18n';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class ColorValidatorAdapter implements IColorValidator {
  constructor(
    private readonly colorRepository: Repository<Color>,
    private readonly i18n: I18nService,
  ) {}

  async validateNotExists(name: string): Promise<void> {
    const existingColor = await this.colorRepository.findOne({
      where: { name },
    });
    if (existingColor) {
      throw new BadRequestException(
        await this.i18n.t('color.EXISTED', { args: { name } }),
      );
    }
  }

  async validateExists(id: string): Promise<Color> {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id } }),
      );
    }
    return color;
  }
}
