import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { User } from 'src/modules/users/entity/user.entity';

@InputType()
export class UserInputResponse extends BaseResponse {
  @Field(() => User, { nullable: true })
  data: User;
}
