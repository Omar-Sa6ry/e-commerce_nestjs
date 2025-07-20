import {
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
import { IColorValidator } from './interfaces/IColorValidator.interface';
import { ColorFacade } from './fascade/color.fascade';
import { ColorRepositoryProxy } from './proxy/color.proxy';
import { ColorValidatorAdapter } from './adapter/color.adapter';
import {
  ColorExistsValidator,
  ColorValidatorComposite,
} from './composite/color.composite';
import { DeleteColorOperation } from './bridge/deleteColor.bridge';

@Injectable()
export class ColorService {
  private validator: IColorValidator;
  private facade: ColorFacade;
  private repositoryProxy: ColorRepositoryProxy;

  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {
    this.validator = new ColorValidatorAdapter(colorRepository, i18n);
    this.facade = new ColorFacade(this.validator, colorRepository);
    this.repositoryProxy = new ColorRepositoryProxy(colorRepository);
  }

  async create(createColorInput: CreateColorInput): Promise<ColorResponse> {
    const color = await this.facade.createColor(createColorInput);
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
    const { items, total } = await this.repositoryProxy.findAllPaginated(
      page,
      limit,
    );

    if (items.length === 0) {
      throw new NotFoundException(await this.i18n.t('color.NOT_FOUNDS'));
    }

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ColorResponse> {
    const color = await this.repositoryProxy.findOneById(id);

    const validator = new ColorValidatorComposite();
    validator.add(new ColorExistsValidator(this.i18n, id));
    await validator.validate(color);

    return { data: color };
  }

  async findByName(name: string): Promise<ColorResponse> {
    const color = await this.repositoryProxy.findOneByName(name);

    const validator = new ColorValidatorComposite();
    validator.add(new ColorExistsValidator(this.i18n, name));
    await validator.validate(color);

    return { data: color };
  }

  async update(updateColorInput: UpdateColorInput): Promise<ColorResponse> {
    const color = await this.facade.updateColor(updateColorInput);
    return {
      data: color,
      message: await this.i18n.t('color.UPDATED', {
        args: { id: updateColorInput.id },
      }),
    };
  }

  async remove(id: string): Promise<ColorResponse> {
    const operation = new DeleteColorOperation(this.colorRepository, this.i18n);
    return operation.execute(id);
  }
}
