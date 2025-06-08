import { Field, InputType } from '@nestjs/graphql'
import { FileUpload } from './fileUpload'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { IsOptional } from 'class-validator'

@InputType()
export class CreateImagDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  breed?: string

  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>
}
