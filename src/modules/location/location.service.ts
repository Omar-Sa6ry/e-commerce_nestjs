import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { CreateCountryInput } from './inputs/createCountry.input';
import { CreateCityInput } from './inputs/createCity.input';
import { I18nService } from 'nestjs-i18n';
import { CountryResponse, CountrysResponse } from './dtos/countryResponse.dto';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CityResponse, CitysResponse } from './dtos/cityResponse.dto copy';
import { CapitalizeWords } from 'src/common/decerator/WordsTransform.decerator';
import { CityFactory } from './factories/city.factory';
import { CountryFactory } from './factories/country.factory';

@Injectable()
export class LocationService {
  constructor(
    private readonly i18n: I18nService,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  // =================== Country ==========================

  async createCountry(
    createCountryInput: CreateCountryInput,
  ): Promise<CountryResponse> {
    const existingCountry = await this.countryRepository.findOne({
      where: { name: createCountryInput.name },
    });
    if (existingCountry)
      throw new BadRequestException(
        await this.i18n.t('location.EXISTED_COUNTRY', {
          args: { name: createCountryInput.name },
        }),
      );

    const country = CountryFactory.create(createCountryInput);
    await this.countryRepository.save(country);

    return {
      data: country,
      statusCode: 201,
      message: await this.i18n.t('location.CREATED_COUNTRY', {
        args: { name: createCountryInput.name },
      }),
    };
  }

  async findAllCountries(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CountrysResponse> {
    const [countries, total] = await this.countryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (countries.length === 0)
      throw new NotFoundException(
        await this.i18n.t(await this.i18n.t('location.NOT_FOUNDS_COUNTIES')),
      );

    return {
      items: countries,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCountryById(id: string): Promise<CountryResponse> {
    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND_COUNTRY'),
      );

    return { data: country };
  }

  async updateCountry(id: string, name: string): Promise<CountryResponse> {
    const country = await this.countryRepository.findOneBy({ id });

    const existingCountry = await this.countryRepository.findOne({
      where: { name },
    });

    if (existingCountry)
      throw new BadRequestException(
        await this.i18n.t('location.EXISTED_COUNTRY', {
          args: { name },
        }),
      );

    const countryName = await CapitalizeWords(name);
    country.name = countryName;

    await this.countryRepository.save(country);

    return {
      data: country,
      message: await this.i18n.t('location.UPDATED_COUNTRY', {
        args: { name },
      }),
    };
  }

  async deleteCountry(id: string): Promise<CountryResponse> {
    const country = await this.countryRepository.findOneBy({ id });

    if (!country)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND_COUNTRY'),
      );

    await this.countryRepository.remove(country);

    return {
      data: null,
      message: await this.i18n.t('location.DELETED_COUNTRY', {
        args: { name: country.name },
      }),
    };
  }

  // =================== City ==========================

  async createCity(createCityInput: CreateCityInput): Promise<CityResponse> {
    const country = (await this.findCountryById(createCityInput.countryId))
      .data;

    const existingCity = await this.cityRepository.findOne({
      where: { name: createCityInput.name },
    });
    if (existingCity)
      throw new BadRequestException(
        await this.i18n.t('location.EXISTED_CITY', {
          args: { name: createCityInput.name },
        }),
      );

    const city = CityFactory.create(
      createCityInput,
      createCityInput.countryId,
      country,
    );
    await this.cityRepository.save(city);

    return {
      data: city,
      statusCode: 201,
      message: await this.i18n.t('location.CREATED_CITY', {
        args: { name: createCityInput.name },
      }),
    };
  }

  async findAllCities(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CitysResponse> {
    const [cities, total] = await this.cityRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['country'],
    });

    if (cities.length === 0)
      throw new NotFoundException(
        await this.i18n.t(await this.i18n.t('location.NOT_FOUNDS_CITIES')),
      );

    return {
      items: cities,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCityById(id: string): Promise<CityResponse> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['country'],
    });

    if (!city)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND_CITY'));

    return { data: city };
  }

  async findCitiesByCountryId(countryId: string): Promise<CitysResponse> {
    const [cities, total] = await this.cityRepository.findAndCount({
      where: { country: { id: countryId } },
      relations: ['country'],
    });

    if (cities.length === 0)
      throw new NotFoundException(
        await this.i18n.t(await this.i18n.t('location.NOT_FOUNDS_CITIES')),
      );

    return {
      items: cities,
      pagination: {
        totalItems: total,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }

  async updateCity(id: string, name: string): Promise<CityResponse> {
    const city = await this.cityRepository.findOneBy({ id });

    const existingCity = await this.cityRepository.findOne({
      where: { name },
    });

    if (existingCity)
      throw new BadRequestException(
        await this.i18n.t('location.EXISTED_CITY', {
          args: { name },
        }),
      );

    const cityName = await CapitalizeWords(name);
    city.name = cityName;

    await this.cityRepository.save(city);

    return {
      data: city,
      message: await this.i18n.t('location.UPDATED_CITY', {
        args: { name },
      }),
    };
  }

  async deleteCity(id: string): Promise<CityResponse> {
    const city = await this.cityRepository.findOneBy({ id });

    if (!city)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND_CITY'));

    await this.cityRepository.remove(city);

    return {
      data: null,
      message: await this.i18n.t('location.DELETED_CITY', {
        args: { name: city.name },
      }),
    };
  }
}
