import { Color } from '../entity/color.entity';
import { CreateColorInput } from '../inputs/createColor.input';
import { UpdateColorInput } from '../inputs/updateColor.input';

export class ColorFactory {
  static create(input: CreateColorInput): Color {
    const color = new Color();
    Object.assign(Color, input);
    return color;
  }

  static update(Color: Color, input: UpdateColorInput): Color {
    Object.assign(Color, input);
    return Color;
  }
}
