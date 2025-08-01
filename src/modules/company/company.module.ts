import { User } from 'src/modules/users/entity/user.entity';
import { Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { UserModule } from '../users/users.module';
import { AddressModule } from '../address/address.module';
import { RedisModule } from 'src/common/redis/redis.module';
import {
  EmployeeActiveState,
  EmployeeInactiveState,
} from './state/company.state';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    AddressModule,
    UserModule,
    RedisModule,
  ],
  providers: [
    CompanyResolver,
    CompanyService,
    EmployeeInactiveState,
    EmployeeActiveState,
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
