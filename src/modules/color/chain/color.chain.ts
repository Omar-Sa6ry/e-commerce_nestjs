import { I18nService } from 'nestjs-i18n';
import { Color } from '../entity/color.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IColorHandler } from '../interfaces/IColorHandler.interface';
import { Repository } from 'typeorm';

export class ColorExistsHandlerByName implements IColorHandler {
  private nextHandler: IColorHandler;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  setNext(handler: IColorHandler): IColorHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(color: Color | null, i18n: I18nService): Promise<void> {
    if (!color) {
      throw new NotFoundException(
        await i18n.t('color.NOT_FOUND_BY_NAME', { args: { name: this.name } }),
      );
    }

    if (this.nextHandler) {
      await this.nextHandler.handle(color, i18n);
    }
  }
}

export class ColorExistsHandler implements IColorHandler {
  private nextHandler: IColorHandler;
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  setNext(handler: IColorHandler): IColorHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(color: Color | null, i18n: I18nService): Promise<void> {
    if (!color) {
      throw new NotFoundException(
        await i18n.t('color.NOT_FOUND', { args: { id: this.id } }),
      );
    }

    if (this.nextHandler) {
      await this.nextHandler.handle(color, i18n);
    }
  }
}

export class ColorNameHandler implements IColorHandler {
  private nextHandler: IColorHandler;
  private name: string;
  private repository: Repository<Color>;

  constructor(name: string, repository: Repository<Color>) {
    this.name = name;
    this.repository = repository;
  }

  setNext(handler: IColorHandler): IColorHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(color: Color | null, i18n: I18nService): Promise<void> {
    const existing = await this.repository.findOne({
      where: { name: this.name },
    });
    if (existing)
      throw new BadRequestException(
        await i18n.t('color.EXISTED', { args: { name: this.name } }),
      );

    if (this.nextHandler) await this.nextHandler.handle(color, i18n);
  }
}
