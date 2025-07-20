import { I18nService } from 'nestjs-i18n';
import { IEmployeeOperation } from '../interfaces/IEmployee.interface';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Company } from '../entity/company.entity';
import { CompanyResponse } from '../dto/companyResponse.dto';
import { Role } from 'src/common/constant/enum.constant';

export class AddEmployeeOperation implements IEmployeeOperation {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async execute(user: User, company: Company): Promise<CompanyResponse> {
    user.companyId = company.id;
    user.role = Role.COMPANY;
    await this.userRepository.save(user);

    return {
      data: company,
      message: await this.i18n.t('company.ADD_EMPLOYEE', {
        args: { name: company.name },
      }),
    };
  }
}
