import { Repository } from "typeorm";
import { IColorValidator } from "../interfaces/IColorValidator.interface";
import { Color } from "../entity/color.entity";
import { UpdateColorInput } from "../inputs/updateColor.input";
import { CreateColorInput } from "../inputs/createColor.input";
import { ColorFactory } from "../factories/color.factory";

export class ColorFacade {
  constructor(
    private readonly validator: IColorValidator,
    private readonly colorRepository: Repository<Color>,
  ) {}

  async createColor(input: CreateColorInput): Promise<Color> {
    await this.validator.validateNotExists(input.name);
    const color = ColorFactory.create(input);
    await this.colorRepository.save(color);
    return color;
  }

  async updateColor(input: UpdateColorInput): Promise<Color> {
    const color = await this.validator.validateExists(input.id);
    ColorFactory.update(color, input);
    await this.colorRepository.save(color);
    return color;
  }
}
