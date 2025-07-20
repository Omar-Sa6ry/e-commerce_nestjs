import { I18nService } from "nestjs-i18n";
import { IEmployeeOperation } from "../interfaces/IEmployee.interface";
import { Repository } from "typeorm";
import { User } from "src/modules/users/entity/user.entity";
import { Company } from "../entity/company.entity";
import { CompanyResponse } from "../dto/companyResponse.dto";
import { Role } from "src/common/constant/enum.constant";

export class RemoveEmployeeOperation implements IEmployeeOperation{
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async execute(user: User, company: Company): Promise<CompanyResponse> {
    user.companyId = null;
    user.role = Role.USER;
    await this.userRepository.save(user);

    return {
      data: company,
      message: await this.i18n.t('company.REMOVE_EMPLOYEE', {
        args: { name: company.name },
      }),
    };
  }
}