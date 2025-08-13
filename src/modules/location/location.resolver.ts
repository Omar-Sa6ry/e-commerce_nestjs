import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { LocationService } from './location.service';
import { CreateCountryInput } from './inputs/createCountry.input';
import { CreateCityInput } from './inputs/createCity.input';
import { CountryResponse, CountrysResponse } from './dtos/countryResponse.dto';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decorator/auth.decorator';
import { CityResponse, CitysResponse } from './dtos/cityResponse.dto';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { CityLoader } from './loaders/city.loader';
import { CountryLoader } from './loaders/country.loader';
import { LocationIdInput, LocationNameInput } from './inputs/location.input';

@Resolver(() => City)
export class CityResolver {
  constructor(
    private readonly countryLoader: CountryLoader,
    private readonly locationService: LocationService,
  ) {}

  @Mutation(() => CityResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_CITY])
  async createCity(
    @Args('createCityInput') createCityInput: CreateCityInput,
  ): Promise<CityResponse> {
    return this.locationService.createCity(createCityInput);
  }

  @Query(() => CitysResponse)
  async findAllCities(
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<CitysResponse> {
    return this.locationService.findAllCities(page, limit);
  }

  @Query(() => CityResponse)
  async findCityById(@Args('id') id: LocationIdInput): Promise<CityResponse> {
    return this.locationService.findCityById(id.LocationId);
  }

  @Query(() => CitysResponse)
  async findCitiesByCountryId(
    @Args('countryId') countryId: LocationIdInput,
  ): Promise<CitysResponse> {
    return this.locationService.findCitiesByCountryId(countryId.LocationId);
  }

  @Mutation(() => CityResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_CITY])
  async updateCity(
    @Args('id') id: LocationIdInput,
    @Args('name') name: LocationNameInput,
  ): Promise<CityResponse> {
    return this.locationService.updateCity(id.LocationId, name.name);
  }

  @Mutation(() => CityResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_CITY])
  async deleteCity(@Args('id') id: LocationIdInput): Promise<CityResponse> {
    return this.locationService.deleteCity(id.LocationId);
  }

  @ResolveField(() => Country || null)
  async country(@Parent() city: City): Promise<Country | null> {
    return await this.countryLoader.load(city.countryId);
  }
}

@Resolver(() => Country)
export class CountryResolver {
  constructor(
    private readonly cityLoader: CityLoader,
    private readonly locationService: LocationService,
  ) {}

  @Mutation(() => CountryResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COUNTRY])
  async createCountry(
    @Args('createCountryInput') createCountryInput: CreateCountryInput,
  ): Promise<CountryResponse> {
    return this.locationService.createCountry(createCountryInput);
  }

  @Query(() => CountrysResponse)
  async findAllCountries(
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<CountrysResponse> {
    return this.locationService.findAllCountries(page, limit);
  }

  @Query(() => CountryResponse)
  async findCountryById(
    @Args('id') id: LocationIdInput,
  ): Promise<CountryResponse> {
    return this.locationService.findCountryById(id.LocationId);
  }

  @Mutation(() => CountryResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COUNTRY])
  async updateCountry(
    @Args('id') id: LocationIdInput,
    @Args('name') name: LocationNameInput,
  ): Promise<CountryResponse> {
    return this.locationService.updateCountry(id.LocationId, name.name);
  }

  @Mutation(() => CountryResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COUNTRY])
  async deleteCountry(
    @Args('id') id: LocationIdInput,
  ): Promise<CountryResponse> {
    return this.locationService.deleteCountry(id.LocationId);
  }

  @ResolveField(() => City || null)
  async cities(@Parent() country: Country): Promise<City | null> {
    return this.cityLoader.load(country.id);
  }
}
