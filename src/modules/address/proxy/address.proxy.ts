import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Address } from '../entity/address.entity';
import { Repository } from 'typeorm';
import { AddressResponse } from '../dto/addressResponse.dto';
import { UserAddress } from 'src/modules/userAdress/entity/userAddress.entity';

export class AddressProxy {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async getAddressById(id: string): Promise<AddressResponse> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['city', 'city.country'],
    });

    if (!address)
      throw new NotFoundException(
        await this.i18n.t('address.NOT_FOUND', { args: { id } }),
      );

    return { data: address };
  }

  async getUserAddressesByAddressId(id: string): Promise<UserAddress[]> {
    const address = await this.addressRepository.findOne({
      where: { id },
    });

    if (!address)
      throw new NotFoundException(
        await this.i18n.t('address.NOT_FOUND', { args: { id } }),
      );

    const userAddresses = await this.userAddressRepository.find({
      where: { addressId: id },
    });

    return userAddresses;
  }
}
