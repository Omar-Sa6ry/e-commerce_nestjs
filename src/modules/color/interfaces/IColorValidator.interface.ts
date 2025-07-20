import { Color } from "../entity/color.entity";

export interface IColorValidator {
  validateNotExists(name: string): Promise<void>;
  validateExists(id: string): Promise<Color>;
}
