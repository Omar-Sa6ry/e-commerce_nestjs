import { ColorResponse } from '../dto/colorResponse.dto';

export interface IColorCommand {
  execute(): Promise<ColorResponse>;
}
