import { Color } from '../entity/color.entity';

export interface IColorOperationValidator {
  validate(color: Color | null): Promise<void>;
}
