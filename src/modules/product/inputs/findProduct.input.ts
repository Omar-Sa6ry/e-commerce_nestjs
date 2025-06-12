import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { CapitalizeWords } from 'src/common/constant/WordsTransform';

@InputType()
export class FindProductInput {
  @Field({ nullable: true })
  @Transform(({ value }) => CapitalizeWords(value))
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  priceMax?: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  companyId?: string;
}
