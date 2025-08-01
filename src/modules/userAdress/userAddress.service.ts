import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AddressService } from '../address/address.service';
import { UserAddress } from './entity/userAddress.entity';
import { City } from '../location/entities/city.entity';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { CreateUserAddressInput } from './inputs/createUserAddress.input';
import { UserAddressFactory } from './factories/userAddress.factory';
import { UserAddressResponse } from './dto/userAddressResponse.dto';
import { UpdateAddressInput } from '../address/inputs/updateAddress.input';
import { UpdateUserAddressInput } from './inputs/updateUserAddress.input';
import { Address } from '../address/entity/address.entity';
import { User } from '../users/entity/user.entity';
import { UserAddressProxy } from './proxy/userAddress.proxy';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';

@Injectable()
export class UserAddressService {
  private proxy: UserAddressProxy;

  constructor(
    private readonly i18n: I18nService,
    private readonly addressService: AddressService,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
    @InjectRepository(City)
    private readonly locationRepository: Repository<City>,
  ) {
    this.proxy = new UserAddressProxy(this.i18n, this.userAddressRepository);
  }

  @Transactional()
  async setDefaultAddress(
    userId: string,
    id: string,
  ): Promise<UserAddressResponse> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { userId, id },
    });

    if (!userAddress) {
      throw new NotFoundException(await this.i18n.t('userAddress.NOT_FOUND'));
    }

    await this.userAddressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    userAddress.isDefault = true;
    await this.userAddressRepository.save(userAddress);

    return {
      data: userAddress,
      message: await this.i18n.t('userAddress.SET_DEFAULT', { args: { id } }),
    };
  }

  @Transactional()
  async createUserAddress(
    userId: string,
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddressResponse> {
    const location = await this.locationRepository.findOne({
      where: { id: createUserAddressInput.createAddress.locationId },
      relations: ['country'],
    });

    if (!location) {
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND', {
          args: { id: createUserAddressInput.createAddress.locationId },
        }),
      );
    }

    const address = await this.addressService.createAddress(
      createUserAddressInput.createAddress,
    );

    const existingAddresses = await this.getUserAddresses(userId);
    const isDefault =
      existingAddresses.length === 0 || createUserAddressInput.isDefault;

    const userAddress = UserAddressFactory.create(
      createUserAddressInput,
      userId,
      address.data,
      isDefault,
    );

    await this.userAddressRepository.save(userAddress);

    if (isDefault) {
      await this.setDefaultAddress(userId, userAddress.id);
    }

    return {
      statusCode: 201,
      message: await this.i18n.t('address.CREATED'),
      data: {
        ...userAddress,
        address: { ...address.data, city: location },
      } as unknown as UserAddress,
    };
  }

  @Transactional()
  async deleteUserAddress(
    userId: string,
    id: string,
  ): Promise<UserAddressResponse> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id, userId },
    });

    if (!userAddress) {
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', { args: { id } }),
      );
    }

    await this.userAddressRepository.remove(userAddress);

    return {
      data: null,
      message: await this.i18n.t('userAddress.DELETED', { args: { id } }),
    };
  }

  @Transactional()
  async updateUserAddress(
    userId: string,
    addressId: string,
    updateAddressDto?: UpdateAddressInput,
    updateUserAddressDto?: UpdateUserAddressInput,
  ): Promise<UserAddressResponse> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { userId, id: addressId },
      relations: ['address'],
    });

    if (!userAddress) {
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', { args: { addressId } }),
      );
    }

    if (updateAddressDto) {
      Object.assign(userAddress.address, updateAddressDto);
      await this.userAddressRepository.save(userAddress.address);
    }

    if (updateUserAddressDto?.isDefault) {
      await this.setDefaultAddress(userId, addressId);
    }

    return {
      data: userAddress,
      message: await this.i18n.t('userAddress.UPDATED', {
        args: { addressId },
      }),
    };
  }

  async getById(id: string): Promise<UserAddressResponse> {
    return this.proxy.getById(id);
  }

  async getUserDefaultAddress(userId: string): Promise<UserAddress | null> {
    return this.proxy.getUserDefaultAddress(userId);
  }

  private async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.proxy.getUserAddresses(userId);
  }

  async getUserByUserAddressId(userAddressId: string): Promise<User> {
    return this.proxy.getUserByUserAddressId(userAddressId);
  }

  async getAddressByUserAddressId(userAddressId: string): Promise<Address> {
    return this.proxy.getAddressByUserAddressId(userAddressId);
  }

  async connectAddressToUser(
    userId: string,
    createAddressInput: CreateAddressInput,
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddress> {
    const address = await this.addressService.createAddress(createAddressInput);

    const existingAddresses = await this.getUserAddresses(userId);

    const userAddress = UserAddressFactory.create(
      createUserAddressInput,
      userId,
      address.data,
      existingAddresses.length === 0,
    );

    return userAddress;
  }
}
