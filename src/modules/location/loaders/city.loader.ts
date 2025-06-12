import * as DataLoader from 'dataloader';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { City } from '../entities/city.entity';

@Injectable()
export class CityLoader {
  private loader: DataLoader<string, City>;

  constructor(
    @InjectRepository(City) private cityRepo: Repository<City>,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, City>(async (countryIds: string[]) => {
      const cities = await this.cityRepo.find({
        where: { countryId: In(countryIds) },
      });

      const cityMap = new Map<string, City>();
      for (const city of cities) {
        cityMap.set(city.countryId, city);
      }

      const results: City[] = [];
      for (const countryId of countryIds) {
        const city = cityMap.get(countryId);
        results.push(city);
      }

      return results;
    });
  }

  load(countryId: string): Promise<City> {
    return this.loader.load(countryId);
  }

  async loadMany(countryIds: string[]): Promise<City[]> {
    const results = await this.loader.loadMany(countryIds);
    return results.filter((r) => !(r instanceof Error)) as City[];
  }
}
