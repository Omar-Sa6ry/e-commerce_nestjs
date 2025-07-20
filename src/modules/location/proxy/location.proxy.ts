import { RedisService } from 'src/common/redis/redis.service';
import { CountryResponse } from '../dtos/countryResponse.dto';
import { Country } from '../entities/country.entity';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CityResponse } from '../dtos/cityResponse.dto';
import { City } from '../entities/city.entity';

export class LocationProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
  ) {}

  async findCountryById(id: string): Promise<CountryResponse> {
    const cacheKey = `country:${id}`;

    const cachedCountry = await this.redisService.get<Country | null>(cacheKey);
    if (cachedCountry instanceof Country) return { data: cachedCountry };

    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND_COUNTRY'),
      );

    this.redisService.set(cacheKey, country);
    return { data: country };
  }

  async findCountryByName(name: string): Promise<CountryResponse> {
    const country = await this.countryRepository.findOne({ where: { name } });
    if (!country)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND_COUNTRY'),
      );

    const cacheKey = `country:${country.id}`;
    this.redisService.set(cacheKey, country);
    return { data: country };
  }

  async findCityById(id: string): Promise<CityResponse> {
    const cacheKey = `city:${id}`;

    const cachedcity = await this.redisService.get<City | null>(cacheKey);
    if (cachedcity instanceof City) return { data: cachedcity };

    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND_City'));

    this.redisService.set(cacheKey, city);
    return { data: city };
  }

  async findCityByName(name: string): Promise<CityResponse> {
    const city = await this.cityRepository.findOne({ where: { name } });
    if (!city)
      throw new NotFoundException(await this.i18n.t('location.NOT_FOUND_City'));

    const cacheKey = `city:${city.id}`;
    this.redisService.set(cacheKey, city);
    return { data: city };
  }
}
