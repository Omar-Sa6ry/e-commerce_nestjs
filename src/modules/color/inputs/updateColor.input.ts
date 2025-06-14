import { Field, InputType } from '@nestjs/graphql';
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateColorInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field()
  @IsString()
  @IsHexColor()
  name: string;
}
