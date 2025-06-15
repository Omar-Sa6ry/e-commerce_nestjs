import { InputType } from '@nestjs/graphql';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UserIdInput {
  @IdField('User')
  UserId: string;
}

@InputType()
export class EmailInput {
  @EmailField()
  email: string;
}
