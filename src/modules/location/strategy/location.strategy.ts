import { Injectable } from "@nestjs/common";
import { CreateCountryInput } from "../inputs/createCountry.input";
import { Country } from "../entities/country.entity";
import { LocationFactory } from "../interfaces/ILocationFactory";
import { City } from "../entities/city.entity";
import { CreateCityInput } from "../inputs/createCity.input";

@Injectable()
export class BasicLocationFactory implements LocationFactory {
  createCountry(input: CreateCountryInput): Country {
    const country = new Country();
    country.name = input.name;
    return country;
  }

  createCity(
    input: CreateCityInput,
    countryId: string,
    country: Country,
  ): City {
    const city = new City();
    city.name = input.name;
    city.country = country;
    city.countryId = countryId;
    return city;
  }
}
