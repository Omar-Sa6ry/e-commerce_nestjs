
import { I18nService } from "nestjs-i18n";
import { IValidator } from "../interfaces/IValidator.interface";
import { User } from "src/modules/users/entity/user.entity";
import { IPasswordStrategy } from "../interfaces/IPassword.interface";
import { Role } from "src/common/constant/enum.constant";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { IValidatorChain } from "../interfaces/IVaild.interface";

abstract class AbstractValidator implements IValidatorChain {
  private nextValidator: IValidator;

  constructor(protected readonly i18n: I18nService) {}

  setNext(validator: IValidator): IValidator {
    this.nextValidator = validator;
    return validator;
  }

  async validate(user: User, data?: any): Promise<void> {
    if (this.nextValidator) {
      await this.nextValidator.validate(user, data);
    }
  }
}

export class PasswordValidator extends AbstractValidator {
  constructor(
    i18n: I18nService,
    private readonly passwordService: IPasswordStrategy,
    private readonly password: string,
  ) {
    super(i18n);
  }

  async validate(user: User): Promise<void> {
    const isValid = await this.passwordService.compare(
      this.password,
      user.password,
    );
    if (!isValid)
      throw new BadRequestException(await this.i18n.t('user.OLD_IS_EQUAL_NEW'));

    await super.validate(user);
  }
}

export class RoleValidator extends AbstractValidator {
  constructor(
    i18n: I18nService,
    private readonly requiredRole: Role
  ) {
    super(i18n);
  }

  async validate(user: User): Promise<void> {
    if (user.role !== this.requiredRole) {
      throw new UnauthorizedException(await this.i18n.t('user.NOT_ADMIN'));
    }
    await super.validate(user);
  }
}