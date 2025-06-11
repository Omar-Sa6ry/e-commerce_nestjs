import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsString } from 'class-validator';
import { TypeCoupon } from 'src/common/constant/enum.constant';

@InputType()
export class CreateCouponInput {
  @Field()
  @IsDate()
  expiryDate: Date;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  categoryId: string;

  @Field(() => TypeCoupon)
  type: TypeCoupon;

  @Field()
  discount: number;
}
