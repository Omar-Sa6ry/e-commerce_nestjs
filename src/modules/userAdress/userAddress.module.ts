import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../address/entity/address.entity';
import { User } from '../users/entity/user.entity';
import { UserAddress } from './entity/userAddress.entity';
import { UserAddressService } from './userAddress.service';
import { UserAddressResolver } from './userAddress.resolver';
import { AddressModule } from '../address/address.module';
import { City } from '../location/entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, User, UserAddress, City]),
    AddressModule,
  ],
  providers: [UserAddressService, UserAddressResolver],
  exports: [UserAddressService, TypeOrmModule],
})
export class UserAddressModule {}
