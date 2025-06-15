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
    Field(),
    IsOptional(),
    IsEmail(),
    Validate(IsEmailConstraint),
    Transform(({ value }) => value?.toLowerCase()),
  );
}
