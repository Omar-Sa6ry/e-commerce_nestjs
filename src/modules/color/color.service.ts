import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateColorInput } from './inputs/updateColor.input';
import { Color } from './entity/color.entity';
import { ColorResponse, ColorsResponse } from './dto/colorResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CreateColorInput } from './inputs/createColor.input';
import { ColorFacade } from './fascade/color.fascade';
import { ColorRepositoryProxy } from './proxy/color.proxy';
import {
  CreateColorCommand,
  UpdateColorCommand,
} from './command/color.command';
import {
  ColorExistsHandler,
  ColorExistsHandlerByName,
} from './chain/color.chain';

@Injectable()
export class ColorService {
  private repositoryProxy: ColorRepositoryProxy;

  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    private readonly facade: ColorFacade,
  ) {
    this.repositoryProxy = new ColorRepositoryProxy(colorRepository);
  }

  async create(createColorInput: CreateColorInput): Promise<ColorResponse> {
    const command = new CreateColorCommand(
      this.facade,
      createColorInput,
      this.i18n,
    );
    return command.execute();
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<ColorsResponse> {
    const { items, total } = await this.repositoryProxy.findAllPaginated(
      page,
      limit,
    );

    if (items.length === 0)
      throw new NotFoundException(await this.i18n.t('color.NOT_FOUNDS'));

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByName(name: string): Promise<ColorResponse> {
    const color = await this.repositoryProxy.findOneByName(name);

    const existsHandler = new ColorExistsHandlerByName(name);
    await existsHandler.handle(color, this.i18n);

    return { data: color };
  }

  async findById(id: string): Promise<ColorResponse> {
    const color = await this.repositoryProxy.findOneById(id);

    const existsHandler = new ColorExistsHandler(id);
    await existsHandler.handle(color, this.i18n);

    return { data: color };
  }

  async update(updateColorInput: UpdateColorInput): Promise<ColorResponse> {
    const command = new UpdateColorCommand(
      this.facade,
      updateColorInput,
      this.i18n,
    );
    const result = await command.execute();

    return result;
  }

  async remove(id: string): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({ where: { id } });

    const existsHandler = new ColorExistsHandler(id);
    await existsHandler.handle(color, this.i18n);

    await this.colorRepository.remove(color!);

    return {
      data: null,
      message: await this.i18n.t('color.DELETED', { args: { id } }),
    };
  }
}
