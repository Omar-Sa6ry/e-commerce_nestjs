import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsGmail', async: false })
export class IsEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    return (
      typeof email === 'string' && email.toLowerCase().endsWith('@gmail.com')
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email must be a valid gmail.com address';
  }
}

export function EmailField(nullable: boolean = false): PropertyDecorator {
  return applyDecorators(
    Field(() => String, { nullable }),
    IsOptional(),
    IsEmail(),
    Validate(IsEmailConstraint),
    Matches(
      /^(?!.*(\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|EXEC|TRUNCATE|ALTER|CREATE)\b|--|;)).*$/i,
      {
        message: 'Email contains forbidden SQL keywords or patterns',
      },
    ),
    Transform(({ value }) => value?.toLowerCase()),
  );
}
