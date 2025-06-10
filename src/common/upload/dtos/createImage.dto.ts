import { Field, InputType } from '@nestjs/graphql';
import { FileUpload } from './fileUpload';
import { IsOptional } from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class CreateImagDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  breed?: string;

  @IsOptional()
  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<FileUpload>;
}
