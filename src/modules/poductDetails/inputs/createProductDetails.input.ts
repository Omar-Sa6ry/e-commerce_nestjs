import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt } from 'class-validator';
import { Size } from 'src/common/constant/enum.constant';

@InputType()
export class CreateDetailInput {
  @Field()
  colorId: string;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  size?: Size;

  @Field({ nullable: true })
  productId?: string;
}
