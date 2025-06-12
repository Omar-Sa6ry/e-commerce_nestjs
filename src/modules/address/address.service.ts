import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Address } from './entity/address.entity';
import { CreateAddressInput } from './inputs/createAddress.dto';
import { I18nService } from 'nestjs-i18n';
import { AddressResponse } from './dto/addressResponse.dto';
import { UserAddress } from '../userAdress/entity/userAddress.entity';
import { UpdateAddressInput } from './inputs/updateAddress.input';
import { City } from '../location/entities/city.entity';

@Injectable()
export class AddressService {
  constructor(
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    @InjectRepository(City)
    private locationRepository: Repository<City>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async createAddress(
    createAddressInput: CreateAddressInput,
  ): Promise<AddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const existedLocation = await this.locationRepository.findOne({
      where: {
        id: createAddressInput.locationId,
      },
      relations: ['country'],
    });

    if (!existedLocation)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND', {
          args: { id: createAddressInput.locationId },
        }),
      );

    try {
      const address = queryRunner.manager.create(Address, createAddressInput);
      await queryRunner.manager.save(address);
      await queryRunner.commitTransaction();

      return {
        data: { ...address, city: existedLocation } as Address,
        statusCode: 201,
        message: await this.i18n.t('address.CREATED'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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

  async updateAddress(
    id: string,
    updateData: UpdateAddressInput,
  ): Promise<AddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(Address, {
        where: { id },
        relations: ['city', 'city.country'],
      });

      if (!address)
        throw new NotFoundException(
          await this.i18n.t('address.NOT_FOUND', { args: { id } }),
        );

      if (updateData.locationId) {
        const location = await this.locationRepository.findOne({
          where: {
            id: updateData.locationId,
          },
          relations: ['country'],
        });

        if (!location)
          throw new NotFoundException(
            await this.i18n.t('location.NOT_FOUND', {
              args: { id: updateData.locationId },
            }),
          );

        address.locationId = location.id;
        address.city = location;
        await queryRunner.manager.save(address);
      }

      Object.assign(address, updateData);
      await queryRunner.manager.save(address);
      await queryRunner.commitTransaction();

      return {
        data: address,
        message: await this.i18n.t('address.UPDATED', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAddress(id: string): Promise<AddressResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(Address, {
        where: { id },
      });

      if (!address)
        throw new NotFoundException(
          await this.i18n.t('address.NOT_FOUND', { args: { id } }),
        );

      await queryRunner.manager.remove(address);
      await queryRunner.commitTransaction();

      return {
        data: null,
        message: await this.i18n.t('address.DELETED', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
