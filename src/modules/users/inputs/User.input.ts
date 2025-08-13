import { InputType } from '@nestjs/graphql';
import { EmailField } from 'src/common/decorator/validation/EmailField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
