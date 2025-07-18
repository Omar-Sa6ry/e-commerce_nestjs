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
import { AddressFactory } from './factories/address.factory';

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

    const city = await this.locationRepository.findOne({
      where: { id: createAddressInput.locationId },
      relations: ['country'],
    });

    if (!city)
      throw new NotFoundException(
        await this.i18n.t('location.NOT_FOUND', {
          args: { id: createAddressInput.locationId },
        }),
      );

    try {
      const address = AddressFactory.create(createAddressInput);
      await queryRunner.manager.save(address);
      await queryRunner.commitTransaction();

      return {
        data: address,
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

      let city: City | undefined = undefined;
      if (updateData.locationId) {
        city = await this.locationRepository.findOne({
          where: { id: updateData.locationId },
          relations: ['country'],
        });

        if (!city)
          throw new NotFoundException(
            await this.i18n.t('location.NOT_FOUND', {
              args: { id: updateData.locationId },
            }),
          );
      }

      const updated = AddressFactory.update(address, updateData);
      await queryRunner.manager.save(updated);
      await queryRunner.commitTransaction();

      return {
        data: updated,
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
