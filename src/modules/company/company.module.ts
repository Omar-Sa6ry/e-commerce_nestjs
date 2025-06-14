import { User } from 'src/modules/users/entity/user.entity';
import { Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { UserModule } from '../users/users.module';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    AddressModule,
    UserModule,
  ],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
