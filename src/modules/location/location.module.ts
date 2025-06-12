import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { UserModule } from '../users/users.module';
import { CountryLoader } from './loaders/country.loader';
import { CityLoader } from './loaders/city.loader';
import { CityResolver, CountryResolver } from './location.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City]), UserModule],
  providers: [
    LocationService,
    CityResolver,
    CountryResolver,
    CountryLoader,
    CityLoader,
  ],
  exports: [LocationService],
})
export class LocationModule {}
