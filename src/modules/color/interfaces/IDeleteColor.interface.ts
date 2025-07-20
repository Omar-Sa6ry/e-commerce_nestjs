import { ColorResponse } from "../dto/colorResponse.dto";

export interface IDeleteOperation {
  execute(id: string): Promise<ColorResponse>;
}
