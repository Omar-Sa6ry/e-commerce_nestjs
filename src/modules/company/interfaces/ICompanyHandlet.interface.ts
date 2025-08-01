import { Company } from '../entity/company.entity';
import { I18nService } from 'nestjs-i18n';

export interface ICompanyHandler {
  setNext(handler: ICompanyHandler): ICompanyHandler;
  handle(company: Company | null, i18n: I18nService): Promise<void>;
}
