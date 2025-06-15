import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Size } from 'src/common/constant/enum.constant';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CreateDetailInput {
  @IdField('Color')
  colorId: string;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @IsOptional()
  @Field(() => Size, { nullable: true })
  size?: Size;

  @IdField('Product', true)
  productId?: string;
}
