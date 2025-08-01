import { City } from '../entities/city.entity';
import { Country } from '../entities/country.entity';
import { CreateCityInput } from '../inputs/createCity.input';
import { CreateCountryInput } from '../inputs/createCountry.input';

export interface LocationFactory {
  createCountry(input: CreateCountryInput): Country;
  createCity(input: CreateCityInput, countryId: string, country: Country): City;
}
