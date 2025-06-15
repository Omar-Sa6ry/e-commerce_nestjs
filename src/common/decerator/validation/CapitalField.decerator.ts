import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { CapitalizeWords } from '../WordsTransform.decerator';

const min = 1;
export function CapitalTextField(
  text: string,
  max = 255,
  nullable: boolean = false,
): PropertyDecorator {
  const message = `${text} must be between ${min} and ${max} characters`;

  return applyDecorators(
    Field(() => String, { nullable }),
    IsOptional(),
    IsString({ message }),
    Length(min, max, {
      message,
    }),
    Transform(({ value }) => CapitalizeWords(value)),
  );
}
