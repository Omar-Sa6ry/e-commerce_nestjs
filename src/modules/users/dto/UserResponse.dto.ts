import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';

@ObjectType()
export class UserResponse extends BaseResponse {
  @Field(() => User, { nullable: true })
  @Expose()
  data: User;
}
