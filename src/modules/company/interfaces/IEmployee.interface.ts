import { User } from "src/modules/users/entity/user.entity";
import { Company } from "../entity/company.entity";
import { CompanyResponse } from "../dto/companyResponse.dto";

export interface IEmployeeOperation {
  execute(user: User, company: Company): Promise<CompanyResponse>;
}
