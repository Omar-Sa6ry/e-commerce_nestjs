import { Color } from '../entity/color.entity';
import { I18nService } from 'nestjs-i18n';

export interface IColorHandler {
  setNext(handler: IColorHandler): IColorHandler;
  handle(color: Color | null, i18n: I18nService): Promise<void>;
}
