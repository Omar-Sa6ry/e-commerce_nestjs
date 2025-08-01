import { CompanyResponse } from '../dto/companyResponse.dto';

export interface ICompanyCommand {
  execute(): Promise<CompanyResponse>;
}
