import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
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
