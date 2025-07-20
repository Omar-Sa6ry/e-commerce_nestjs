import { I18nService } from 'nestjs-i18n';
import { IEmployeeValidator } from '../interfaces/IEmployeeValidator.interface';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/modules/users/entity/user.entity';
import { Company } from '../entity/company.entity';

export class EmployeeExistsValidator implements IEmployeeValidator {
  constructor(private readonly i18n: I18nService) {}

  async validate(user: User): Promise<void> {
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));
  }
}

export class CompanyExistsValidator implements IEmployeeValidator {
  constructor(private readonly i18n: I18nService) {}

  async validate(user: User, company: Company): Promise<void> {
    if (!company)
      throw new NotFoundException(await this.i18n.t('company.NOT_FOUND'));
  }
}

export class ManagerValidator implements IEmployeeValidator {
  constructor(private readonly i18n: I18nService) {}

  async validate(user: User, _: Company, managerId: string): Promise<void> {
    if (user.companyId === managerId)
      throw new NotFoundException(await this.i18n.t('company.NOT_MANAGER'));
  }
}

export class EmployeeValidatorComposite implements IEmployeeValidator {
  private validators: IEmployeeValidator[] = [];

  add(validator: IEmployeeValidator): void {
    this.validators.push(validator);
  }

  async validate(
    user: User,
    company: Company,
    managerId: string,
  ): Promise<void> {
    for (const validator of this.validators) {
      await validator.validate(user, company, managerId);
    }
  }
}
