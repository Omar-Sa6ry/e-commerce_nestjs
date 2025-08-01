import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { UserModule } from '../users/users.module';
import { CountryLoader } from './loaders/country.loader';
import { CityLoader } from './loaders/city.loader';
import { CityResolver, CountryResolver } from './location.resolver';
import { RedisModule } from 'src/common/redis/redis.module';
import { CountryExistsValidator } from './chains/country.chain';
import { CityExistsValidator } from './chains/city.chain';
import { BasicLocationFactory } from './strategy/location.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City]), RedisModule, UserModule],
  providers: [
    LocationService,
    CountryExistsValidator,
    CityExistsValidator,
    CountryLoader,
    CityLoader,
    CityResolver,
    CountryResolver,
    { provide: 'LocationFactory', useClass: BasicLocationFactory },
  ],
  exports: [LocationService],
})
export class LocationModule {}
