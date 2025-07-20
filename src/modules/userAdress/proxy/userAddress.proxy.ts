import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserAddress } from '../entity/userAddress.entity';
import { UserAddressResponse } from '../dto/userAddressResponse.dto';
import { User } from 'src/modules/users/entity/user.entity';
import { Address } from 'src/modules/address/entity/address.entity';

export class UserAddressProxy {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
  ) {}

  async getById(id: string): Promise<UserAddressResponse> {
    const address = await this.userAddressRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!address) {
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', { args: { id } }),
      );
    }

    return { data: address };
  }

  async getUserDefaultAddress(userId: string): Promise<UserAddress | null> {
    return this.userAddressRepository.findOne({
      where: { userId, isDefault: true },
      relations: ['address'],
    });
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.userAddressRepository.find({
      where: { userId },
      relations: ['address'],
    });
  }

  async getUserByUserAddressId(userAddressId: string): Promise<User> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id: userAddressId },
      relations: ['user'],
    });

    if (!userAddress) {
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', {
          args: { id: userAddressId },
        }),
      );
    }

    return userAddress.user;
  }

  async getAddressByUserAddressId(userAddressId: string): Promise<Address> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id: userAddressId },
      relations: ['address'],
    });

    if (!userAddress) {
      throw new NotFoundException(
        await this.i18n.t('userAddress.NOT_FOUND', {
          args: { id: userAddressId },
        }),
      );
    }

    return userAddress.address;
  }
}
