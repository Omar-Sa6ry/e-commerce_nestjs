import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { Address } from './entity/address.entity';
import { UserAddress } from '../userAdress/entity/userAddress.entity';
import { AddressResolver } from './address.resolver';
import { UserModule } from '../users/users.module';
import { City } from '../location/entities/city.entity';
import { AddressFacadeService } from './fascade/address.fascade';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, City, UserAddress]),
    forwardRef(() => UserModule),
  ],
  providers: [AddressService, AddressFacadeService, AddressResolver],
  exports: [AddressService, TypeOrmModule],
})
export class AddressModule {}
