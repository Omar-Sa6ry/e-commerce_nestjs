import { I18nService } from "nestjs-i18n";
import { IDeleteOperation } from "../interfaces/IDeleteColor.interface";
import { Repository } from "typeorm";
import { Color } from "../entity/color.entity";
import { ColorResponse } from "../dto/colorResponse.dto";
import { NotFoundException } from "@nestjs/common";

export class DeleteColorOperation implements IDeleteOperation {
  constructor(
    private readonly colorRepository: Repository<Color>,
    private readonly i18n: I18nService,
  ) {}

  async execute(id: string): Promise<ColorResponse> {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id } }),
      );
    }
    await this.colorRepository.remove(color);
    return {
      data: null,
      message: await this.i18n.t('color.DELETED', { args: { id } }),
    };
  }
}