import { User } from "src/modules/users/entity/user.entity";
import { Company } from "../entity/company.entity";

export interface IEmployeeValidator {
  validate(user: User, company: Company, managerId: string): Promise<void>;
}
