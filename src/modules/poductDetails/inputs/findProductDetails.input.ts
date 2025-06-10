import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateDetailInput } from './createProductDetails.input';

@InputType()
export class FindProductDetailsInput extends PartialType(CreateDetailInput) {}
