import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationValidator } from '../interfaces/ILocationValidator.interface';
import { I18nService } from 'nestjs-i18n';
import { City } from '../entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityExistsValidator implements LocationValidator {
  private nextValidator: LocationValidator;

  setNext(validator: LocationValidator): LocationValidator {
    this.nextValidator = validator;
    return validator;
  }

  async validate(
    city: City,
    i18n: I18nService,
    repository: Repository<City>,
  ): Promise<void> {
    const existing = await repository.findOne({
      where: { name: city.name, countryId: city.countryId },
    });
    if (existing) {
      throw new BadRequestException(
        await i18n.t('location.EXISTED_CITY', { args: { name: city.name } }),
      );
    }

    if (this.nextValidator) {
      await this.nextValidator.validate(city, i18n, repository);
    }
  }
}
