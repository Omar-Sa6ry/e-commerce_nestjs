import { User } from 'src/modules/users/entity/user.entity';
import { IEmployeeCommand } from '../interfaces/IEmployeeCommand';
import { Company } from '../entity/company.entity';
import { CompanyResponse } from '../dto/companyResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import {
  EmployeeActiveState,
  EmployeeInactiveState,
} from '../state/company.state';

export class AddEmployeeCommand implements IEmployeeCommand {
  constructor(
    private readonly company: Company,
    private readonly user: User,
    private readonly i18n: I18nService,
    private readonly state: EmployeeActiveState,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(): Promise<CompanyResponse> {
    await this.state.handle(
      this.user,
      this.company,
      this.i18n,
      this.userRepository,
    );
    return {
      data: this.company,
      message: await this.i18n.t('company.ADD_EMPLOYEE', {
        args: { name: this.company.name },
      }),
    };
  }
}

export class RemoveEmployeeCommand implements IEmployeeCommand {
  constructor(
    private readonly user: User,
    private readonly company: Company,
    private readonly i18n: I18nService,
    private readonly state: EmployeeInactiveState,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(): Promise<CompanyResponse> {
    await this.state.handle(
      this.user,
      this.company,
      this.i18n,
      this.userRepository,
    );
    return {
      data: this.company,
      message: await this.i18n.t('company.REMOVE_EMPLOYEE', {
        args: { name: this.company.name },
      }),
    };
  }
}
