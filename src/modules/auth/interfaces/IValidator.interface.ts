import { User } from 'src/modules/users/entity/user.entity';

export interface IValidator {
  validate(user: User): Promise<void>;
}
