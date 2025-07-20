import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../location/entities/city.entity';
import { Address } from './entity/address.entity';
import { UserAddress } from '../userAdress/entity/userAddress.entity';
import { CreateAddressInput } from './inputs/createAddress.dto';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { AddressResponse } from './dto/addressResponse.dto';
import { AddressFactory } from './factories/address.factory';
import { I18nService } from 'nestjs-i18n';
import { AddressProxy } from './proxy/address.proxy';
import { UpdateAddressInput } from './inputs/updateAddress.input';

@Injectable()
export class AddressService {
  private proxy: AddressProxy;

  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(City)
    private readonly locationRepository: Repository<City>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
  ) {
    this.proxy = new AddressProxy(
      this.i18n,
      this.addressRepository,
      this.userAddressRepository,
    );
  }

  @Transactional()
  async createAddress(
    createAddressInput: CreateAddressInput,
  ): Promise<AddressResponse> {
    const city = await this.locationRepository.findOne({
      where: { id: createAddressInput.locationId },
      relations: ['country'],
    });

    if (!city) {
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND', {
          args: { id: createAddressInput.locationId },
        }),
      );
    }

    const address = AddressFactory.create(createAddressInput);
    await this.addressRepository.save(address);

    return {
      data: address,
      statusCode: 201,
      message: await this.i18n.t('address.CREATED'),
    };
  }

  async getAddressById(id: string): Promise<AddressResponse> {
    return this.proxy.getAddressById(id);
  }

  @Transactional()
  async updateAddress(
    id: string,
    updateData: UpdateAddressInput,
  ): Promise<AddressResponse> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['city', 'city.country'],
    });

    if (!address) {
      throw new NotFoundException(
        await this.i18n.t('address.NOT_FOUND', { args: { id } }),
      );
    }

    let city: City | undefined;
    if (updateData.locationId) {
      city = await this.locationRepository.findOne({
        where: { id: updateData.locationId },
        relations: ['country'],
      });

      if (!city) {
        throw new NotFoundException(
          await this.i18n.t('location.NOT_FOUND', {
            args: { id: updateData.locationId },
          }),
        );
      }
    }

    const updated = AddressFactory.update(address, updateData);
    await this.addressRepository.save(updated);

    return {
      data: updated,
      message: await this.i18n.t('address.UPDATED', { args: { id } }),
    };
  }

  @Transactional()
  async deleteAddress(id: string): Promise<AddressResponse> {
    const address = await this.addressRepository.findOne({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(
        await this.i18n.t('address.NOT_FOUND', { args: { id } }),
      );
    }

    await this.addressRepository.remove(address);

    return {
      data: null,
      message: await this.i18n.t('address.DELETED', { args: { id } }),
    };
  }

  async getUserAddressesByAddressId(id: string): Promise<UserAddress[]> {
    return this.proxy.getUserAddressesByAddressId(id);
  }
}
