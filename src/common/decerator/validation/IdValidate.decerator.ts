import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export function IdField(
  id: string,
  nullable: boolean = false,
): PropertyDecorator {
  const message = `${id} ID must be exactly 26 characters`;

  return applyDecorators(
    Field(() => String, { nullable }),
    IsOptional(),
    IsString({ message }),
    Length(26, 26, {
      message,
    }),
    Matches(
      /^(?!.*(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|EXEC|TRUNCATE|ALTER|CREATE)\b|--|;)).*$/i,
      {
        message: `${id} Id contains forbidden SQL keywords or patterns`,
      },
    ),
  );
}
