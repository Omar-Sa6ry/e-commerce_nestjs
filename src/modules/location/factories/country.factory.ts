import { Injectable } from '@nestjs/common';
import { CreateCountryInput } from '../inputs/createCountry.input';
import { Country } from '../entities/country.entity';

@Injectable()
export class CountryFactory {
  static create(input: CreateCountryInput): Country {
    const country = new Country();
    country.name = input.name;
    return country;
  }
}
