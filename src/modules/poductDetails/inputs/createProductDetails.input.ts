import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsHexColor } from 'class-validator';
import { Size } from 'src/common/constant/enum.constant';

@InputType()
export class CreateDetailInput {
  @Field()
  @IsHexColor()
  color: string;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  size?: Size;

  @Field()
  productId: string;
}
