import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Color } from '../entity/color.entity';
import { CreateColorInput } from '../inputs/createColor.input';
import { UpdateColorInput } from '../inputs/updateColor.input';
import { ColorFactory } from '../factories/color.factory';
import { ColorExistsHandler, ColorNameHandler } from '../chain/color.chain';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ColorFacade {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async createColor(input: CreateColorInput): Promise<Color> {
    const nameHandler = new ColorNameHandler(input.name, this.colorRepository);
    await nameHandler.handle(null, this.i18n);

    const color = ColorFactory.create(input);
    await this.colorRepository.save(color);
    return color;
  }

  async updateColor(input: UpdateColorInput): Promise<Color> {
    const color = await this.colorRepository.findOne({
      where: { id: input.id },
    });

    const existsHandler = new ColorExistsHandler(input.id);
    const nameHandler = new ColorNameHandler(input.name, this.colorRepository);
    existsHandler.setNext(nameHandler);
    await existsHandler.handle(color, this.i18n);

    ColorFactory.update(color!, input);
    await this.colorRepository.save(color!);
    return color!;
  }
}
