import { Field, InputType } from '@nestjs/graphql';
import { IsHexColor } from 'class-validator';

@InputType()
export class CreateColorInput {
  @Field()
  @IsHexColor()
  name: string;
}
