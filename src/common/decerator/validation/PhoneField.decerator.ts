import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { IsOptional, IsPhoneNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export function ValidatePhoneNumber() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[^\d+]/g, '') : value,
  );
}

export function PhoneField(nullable: boolean = false): PropertyDecorator {
  return applyDecorators(
    Field(),
    IsOptional(),
    Transform(({ value }) => value.replace(/[^\d+]/g, '')),
    IsPhoneNumber('EG', {
      message: ' "Phone number must be a valid Egyptian number"',
    }),
  );
}
