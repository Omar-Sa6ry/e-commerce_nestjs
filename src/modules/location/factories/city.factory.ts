import { Injectable } from '@nestjs/common';
import { CreateCityInput } from '../inputs/createCity.input';
import { City } from '../entities/city.entity';
import { Country } from '../entities/country.entity';

@Injectable()
export class CityFactory {
 static create(input: CreateCityInput, countryId: string, country: Country): City {
    const city = new City();
    city.name = input.name;
    city.country = country;
    city.countryId = countryId;
    return city;
  }
}
