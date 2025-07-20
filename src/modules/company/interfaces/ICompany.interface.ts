import { Company } from "../entity/company.entity";

export interface ICompanyValidator {
  validateNotExistsByEmail(email: string): Promise<void>;
  validateNotExistsByName(name: string): Promise<void>;
  validateExists(id: string): Promise<Company>;
}
