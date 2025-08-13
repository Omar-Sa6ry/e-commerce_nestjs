import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import {
  IsAlphanumeric,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CapitalizeWords } from '../WordsTransform.decorator';

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
    IsAlphanumeric(),
    Length(min, max, {
      message,
    }),
    Matches(
      /^(?!.*(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|EXEC|TRUNCATE|ALTER|CREATE)\b|--|;)).*$/i,
      {
        message: `${text} contains forbidden SQL keywords or patterns`,
      },
    ),
    Transform(({ value }) => CapitalizeWords(value)),
  );
}
