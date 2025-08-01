import { Repository } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Company } from '../entity/company.entity';
import { I18nService } from 'nestjs-i18n';

export interface EmployeeState {
  handle(
    user: User,
    company: Company,
    i18n: I18nService,
    userRepository: Repository<User>,
  ): Promise<void>;
}
