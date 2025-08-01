import { BadRequestException, Injectable } from '@nestjs/common';
import { Country } from '../entities/country.entity';
import { LocationValidator } from '../interfaces/ILocationValidator.interface';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CountryExistsValidator implements LocationValidator {
  private nextValidator: LocationValidator;

  setNext(validator: LocationValidator): LocationValidator {
    this.nextValidator = validator;
    return validator;
  }

  async validate(
    country: Country,
    i18n: I18nService,
    repository: Repository<Country>,
  ): Promise<void> {
    const existing = await repository.findOne({
      where: { name: country.name },
    });
    if (existing) {
      throw new BadRequestException(
        await i18n.t('location.EXISTED_COUNTRY', {
          args: { name: country.name },
        }),
      );
    }

    if (this.nextValidator) {
      await this.nextValidator.validate(country, i18n, repository);
    }
  }
}
