import { Matches, IsString, Length } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';

export function password(
  message = 'Password must contain uppercase, lowercase, number and special character',
) {
  return Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/, { message });
}

export function PasswordField(): PropertyDecorator {
  return applyDecorators(
    Field(),
    IsString(),
    Length(8, 16, { message: 'Password must be between 8 and 16 characters' }),
    password(),
  );
}
