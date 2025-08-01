import { User } from 'src/modules/users/entity/user.entity';
import { EmployeeState } from '../interfaces/IEmployeeState.interface';
import { Company } from '../entity/company.entity';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from 'src/common/constant/enum.constant';

@Injectable()
export class EmployeeActiveState implements EmployeeState {
  async handle(
    user: User,
    company: Company,
    i18n: I18nService,
    userRepository: Repository<User>,
  ): Promise<void> {
    if (user.companyId && user.companyId !== company.id) {
      throw new BadRequestException(
        await i18n.t('company.NOT_MANAGER', {
          args: { userId: user.id },
        }),
      );
    }

    if (user.companyId === company.id) {
      throw new BadRequestException(await i18n.t('company.NOT_MANAGER'));
    }

    user.companyId = company.id;
    user.role = Role.COMPANY;

    await userRepository.save(user);
  }
}

@Injectable()
export class EmployeeInactiveState implements EmployeeState {
  async handle(
    user: User,
    company: Company,
    i18n: I18nService,
    userRepository: Repository<User>,
  ): Promise<void> {
    if (user.companyId !== company.id) {
      throw new BadRequestException(await i18n.t('employee.NOT_IN_COMPANY'));
    }

    user.companyId = null;
    user.role = Role.USER;

    await userRepository.save(user);
  }
}
