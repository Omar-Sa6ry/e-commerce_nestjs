import { CompanyResponse } from "../dto/companyResponse.dto";

export interface IEmployeeCommand {
  execute(): Promise<CompanyResponse>;
}
