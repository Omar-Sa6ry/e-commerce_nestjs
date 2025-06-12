import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Address } from '../address/entity/address.entity';
import { UserAddress } from './entity/userAddress.entity';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { CreateUserAddressInput } from './inputs/createUserAddress.input';
import { I18nService } from 'nestjs-i18n';
import { UserAddressResponse } from './dto/userAddressResponse.dto';
import { AddressService } from '../address/address.service';
import { User } from '../users/entity/user.entity';
import { UpdateUserAddressInput } from './inputs/updateUserAddress.input';
import { UpdateAddressInput } from '../address/inputs/updateAddress.input';
import { City } from '../location/entities/city.entity';

@Injectable()
export class UserAddressService {
  constructor(
    private readonly i18n: I18nService,
    private readonly addressService: AddressService,
    private readonly dataSource: DataSource,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    @InjectRepository(City)
    private locationRepository: Repository<City>,
  ) {}

  async createUserAddress(
    userId: string,
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
    try {
      const address = await queryRunner.manager.create(Address, {
        ...createUserAddressInput.createAddress,
      });
      await queryRunner.manager.save(address);

      const userAddress = await queryRunner.manager.create(UserAddress, {
        ...createUserAddressInput,
        userId,
        addressId: address.id,
        address,
      });

      if (createUserAddressInput?.isDefault)
        await this.setDefaultAddress(userId, address.id);

      await queryRunner.manager.save(userAddress);
      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: await this.i18n.t('address.CREATED'),
        data: {
          ...userAddress,
          address: { ...address, city: location },
        } as unknown as UserAddress,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUserAddress(
    userId: string,
    id: string,
  ): Promise<UserAddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAddress = await queryRunner.manager.findOne(UserAddress, {
        where: { id, userId },
      });

      if (!userAddress) {
        throw new NotFoundException(
          await this.i18n.t('userAddress.NOT_FOUND', {
            args: { id },
          }),
        );
      }

      await queryRunner.manager.remove(userAddress);
      await queryRunner.commitTransaction();

      return {
        data: null,
        message: await this.i18n.t('userAddress.DELETED', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setDefaultAddress(
    userId: string,
    id: string,
  ): Promise<UserAddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAddress = await queryRunner.manager.findOne(UserAddress, {
        where: { userId, id },
      });

      if (!userAddress)
        throw new NotFoundException(await this.i18n.t('userAddress.NOT_FOUND'));

      await queryRunner.manager.update(
        UserAddress,
        { userId, isDefault: true },
        { isDefault: false },
      );

      userAddress.isDefault = true;
      await queryRunner.manager.save(userAddress);
      await queryRunner.commitTransaction();

      return {
        data: userAddress,
        message: await this.i18n.t('userAddress.SET_DEFAULT', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUserAddress(
    userId: string,
    addressId: string,
    updateAddressDto?: UpdateAddressInput,
    updateUserAddressDto?: UpdateUserAddressInput,
  ): Promise<UserAddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAddress = await queryRunner.manager.findOne(UserAddress, {
        where: { userId, id: addressId },
        relations: ['address'],
      });

      if (!userAddress) {
        throw new NotFoundException(
          await this.i18n.t('userAddress.NOT_FOUND', { args: { addressId } }),
        );
      }

      if (updateAddressDto && Object.keys(updateAddressDto).length > 0) {
        Object.assign(userAddress.address, updateAddressDto);
        await queryRunner.manager.save(userAddress.address);
      }

      if (updateUserAddressDto?.isDefault) {
        await this.setDefaultAddress(userId, addressId);
      }

      await queryRunner.commitTransaction();

      return {
        data: userAddress,
        message: await this.i18n.t('userAddress.UPDATED', {
          args: { addressId },
        }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getById(id: string): Promise<UserAddressResponse> {
    const address = await this.userAddressRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!address)
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', {
          args: { id },
        }),
      );

    return { data: address };
  }

  async connectAddressToUser(
    userId: string,
    createAddressInput: CreateAddressInput,
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddress> {
    const address = await this.addressService.createAddress(createAddressInput);

    const existingAddresses = await this.getUserAddresses(userId);

    const userAddress = await this.userAddressRepository.create({
      userId,
      addressId: address.data.id,
      isDefault:
        existingAddresses.length === 0 || createUserAddressInput.isDefault,
    });

    return userAddress;
  }

  async getUserDefaultAddress(userId: string): Promise<UserAddress | null> {
    return this.userAddressRepository.findOne({
      where: { userId, isDefault: true },
      relations: ['address'],
    });
  }

  private async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return await this.userAddressRepository.find({
      where: { userId },
      relations: ['address'],
    });
  }

  async getUserByUserAddressId(userAddressId: string): Promise<User> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id: userAddressId },
      relations: ['user'],
    });

    if (!userAddress)
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', {
          args: { id: userAddressId },
        }),
      );

    return userAddress.user;
  }

  async getAddressByUserAddressId(userAddressId: string): Promise<Address> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id: userAddressId },
      relations: ['address'],
    });

    if (!userAddress)
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', {
          args: { id: userAddressId },
        }),
      );

    return userAddress.address;
  }
}
