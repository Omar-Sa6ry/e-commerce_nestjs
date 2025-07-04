import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateColorInput } from './inputs/updateColor.input';
import { Color } from './entity/color.entity';
import { ColorResponse, ColorsResponse } from './dto/colorResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CreateColorInput } from './inputs/createColor.input';
import { ColorFactory } from './factories/color.factory';

@Injectable()
export class ColorService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async create(createColorInput: CreateColorInput): Promise<ColorResponse> {
    const existingColor = await this.colorRepository.findOne({
      where: { name: createColorInput.name },
    });
    if (existingColor)
      throw new BadRequestException(
        await this.i18n.t('color.EXISTED', {
          args: { name: createColorInput.name },
        }),
      );

    const color = ColorFactory.create(createColorInput);
    await this.colorRepository.save(color);

    return {
      data: color,
      statusCode: 201,
      message: await this.i18n.t('color.CREATED'),
    };
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<ColorsResponse> {
    const [colors, total] = await this.colorRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (colors.length === 0)
      throw new NotFoundException(
        await this.i18n.t(await this.i18n.t('color.NOT_FOUNDS')),
      );

    return {
      items: colors,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color)
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id } }),
      );

    return { data: color };
  }

  async findByName(name: string): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({ where: { name } });
    if (!color)
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND_BY_NAME', { args: { name } }),
      );

    return { data: color };
  }

  async update(updateColorInput: UpdateColorInput): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({
      where: { id: updateColorInput.id },
    });
    if (!color)
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', {
          args: { id: updateColorInput.id },
        }),
      );

    ColorFactory.update(color, updateColorInput);
    await this.colorRepository.save(color);

    return {
      data: color,
      message: await this.i18n.t('color.UPDATED', {
        args: { id: updateColorInput.id },
      }),
    };
  }

  async remove(id: string): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({
      where: { id },
    });
    if (!color)
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', {
          args: { id },
        }),
      );

    await this.colorRepository.remove(color);
    return {
      data: null,
      message: await this.i18n.t('color.DELETED', { args: { id } }),
    };
  }
}
