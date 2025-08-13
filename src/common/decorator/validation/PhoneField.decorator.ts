import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsPhoneNumber, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export function ValidatePhoneNumber() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[^\d+]/g, '') : value,
  );
}

export function PhoneField(nullable: boolean = false): PropertyDecorator {
  return applyDecorators(
    Field(() => String, { nullable }),
    IsOptional(),
    Transform(({ value }) => value.replace(/[^\d+]/g, '')),
    Matches(
      /^(?!.*(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|EXEC|TRUNCATE|ALTER|CREATE)\b|--|;)).*$/i,
      {
        message: 'Phone contains forbidden SQL keywords or patterns',
      },
    ),
    IsPhoneNumber('EG', {
      message: ' "Phone number must be a valid Egyptian number"',
    }),
  );
}
