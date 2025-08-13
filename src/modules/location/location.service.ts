import {
  BadRequestException,
  Inject,
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
import { CityResponse, CitysResponse } from './dtos/cityResponse.dto';
import { CapitalizeWords } from 'src/common/decorator/WordsTransform.decorator';
import { LocationProxy } from './proxy/location.proxy';
import { RedisService } from 'src/common/redis/redis.service';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { LocationValidator } from './interfaces/ILocationValidator.interface';
import { LocationFactory } from './interfaces/ILocationFactory';
import { CountryExistsValidator } from './chains/country.chain';
import { CityExistsValidator } from './chains/city.chain';

@Injectable()
export class LocationService {
  private proxy: LocationProxy;
  private countryValidator: LocationValidator;
  private cityValidator: LocationValidator;

  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @Inject('LocationFactory')
    private readonly locationFactory: LocationFactory,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {
    this.proxy = new LocationProxy(
      this.i18n,
      this.redisService,
      this.cityRepository,
      this.countryRepository,
    );

    this.countryValidator = new CountryExistsValidator();
    this.cityValidator = new CityExistsValidator();
  }

  // =================== Country ==========================

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
    return this.proxy.findCountryById(id);
  }

  @Transactional()
  async createCountry(
    createCountryInput: CreateCountryInput,
  ): Promise<CountryResponse> {
    const country = this.locationFactory.createCountry(createCountryInput);

    await this.countryValidator.validate(
      country,
      this.i18n,
      this.countryRepository,
    );

    await this.countryRepository.save(country);

    return {
      data: country,
      statusCode: 201,
      message: await this.i18n.t('location.CREATED_COUNTRY', {
        args: { name: createCountryInput.name },
      }),
    };
  }

  @Transactional()
  async updateCountry(id: string, name: string): Promise<CountryResponse> {
    const country = (await this.proxy.findCountryById(id))?.data;

    await this.countryValidator.validate(
      country,
      this.i18n,
      this.countryRepository,
    );

    country.name = await CapitalizeWords(name);
    await this.countryRepository.save(country);

    return {
      data: country,
      message: await this.i18n.t('location.UPDATED_COUNTRY', {
        args: { name },
      }),
    };
  }

  @Transactional()
  async deleteCountry(id: string): Promise<CountryResponse> {
    const country = (await this.proxy.findCountryById(id)).data;

    await this.countryRepository.remove(country);
    this.redisService.del(`country:${country.id}`);

    return {
      data: null,
      message: await this.i18n.t('location.DELETED_COUNTRY', {
        args: { name: country.name },
      }),
    };
  }

  // =================== City ==========================

  @Transactional()
  async createCity(createCityInput: CreateCityInput): Promise<CityResponse> {
    const country = (await this.findCountryById(createCityInput.countryId))
      .data;
    const city = this.locationFactory.createCity(
      createCityInput,
      createCityInput.countryId,
      country,
    );

    await this.cityValidator.validate(city, this.i18n, this.cityRepository);

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
    return this.proxy.findCityById(id);
  }

  @Transactional()
  async updateCity(id: string, name: string): Promise<CityResponse> {
    const city = await this.proxy.findCityById(id);

    const existingCity = await this.proxy.findCityByName(name);

    if (existingCity)
      throw new BadRequestException(
        await this.i18n.t('location.EXISTED_CITY', {
          args: { name },
        }),
      );

    const cityName = await CapitalizeWords(name);
    city.data.name = cityName;

    await this.cityRepository.save(city.data);

    return {
      data: city.data,
      message: await this.i18n.t('location.UPDATED_CITY', {
        args: { name },
      }),
    };
  }

  @Transactional()
  async deleteCity(id: string): Promise<CityResponse> {
    const city = await this.proxy.findCityById(id);

    if (!city)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND_CITY'));

    await this.cityRepository.remove(city.data);

    return {
      data: null,
      message: await this.i18n.t('location.DELETED_CITY', {
        args: { name: city.data.name },
      }),
    };
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
}
