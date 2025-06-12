import * as DataLoader from 'dataloader';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CountryLoader {
  private loader: DataLoader<string, Country>;

  constructor(
    @InjectRepository(Country) private countryRepo: Repository<Country>,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, Country>(async (ids: string[]) => {
      const countries = await this.countryRepo.find({
        where: { id: In(ids) },
      });

      const countryMap = new Map(countries.map((c) => [c.id, c]));

      return await Promise.all(
        ids.map(async (id) => {
          const country = countryMap.get(id);
          if (!country) {
            throw new NotFoundException(
              await this.i18n.t('location.NOT_FOUND_COUNTRY', {
                args: { id },
              }),
            );
          }
          return country;
        }),
      );
    });
  }

  load(id: string): Promise<Country> {
    return this.loader.load(id);
  }

  async loadMany(ids: string[]): Promise<Country[]> {
    const results = await this.loader.loadMany(ids);
    return results.filter((r) => !(r instanceof Error)) as Country[];
  }
}
