import { ColorResponse } from "../dto/colorResponse.dto";
import { ColorFacade } from "../fascade/color.fascade";
import { CreateColorInput } from "../inputs/createColor.input";
import { I18nService } from "nestjs-i18n";
import { IColorCommand } from "../interfaces/IColorCommand.interface";
import { UpdateColorInput } from "../inputs/updateColor.input";

export class CreateColorCommand implements IColorCommand{
  constructor(
    private readonly facade: ColorFacade,
    private readonly input: CreateColorInput,
    private readonly i18n: I18nService,
  ) {}

  async execute(): Promise<ColorResponse> {
    const color = await this.facade.createColor(this.input);
    return {
      data: color,
      statusCode: 201,
      message: await this.i18n.t('color.CREATED'),
    };
  }
}

export class UpdateColorCommand implements IColorCommand {
  constructor(
    private readonly facade: ColorFacade,
    private readonly input: UpdateColorInput,
    private readonly i18n: I18nService,
  ) {}

  async execute(): Promise<ColorResponse> {
    const color = await this.facade.updateColor(this.input);
    return {
      data: color,
      message: await this.i18n.t('color.UPDATED', {
        args: { id: this.input.id },
      }),
    };
  }
}
