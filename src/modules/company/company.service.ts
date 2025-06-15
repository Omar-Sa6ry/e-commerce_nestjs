import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { CreateCompanyDto } from './inputs/createCompany.input';
import { UpdateCompanyDto } from './inputs/updateCompany.input';
import { CompanyResponse, CompanysResponse } from './dto/companyResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { User } from '../users/entity/user.entity';
import { Role } from 'src/common/constant/enum.constant';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UserResponse } from '../users/dto/UserResponse.dto';
import { AddressService } from '../address/address.service';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { Address } from '../address/entity/address.entity';

@Injectable()
export class CompanyService {
  constructor(
    private readonly i18n: I18nService,
    private addressService: AddressService,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    userId: string,
    createAddressInput?: CreateAddressInput,
  ): Promise<CompanyResponse> {
    const queryRunner =
      this.companyRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user)
        throw new NotFoundException(
          await this.i18n.t('user.NOT_FOUND', { args: { id: userId } }),
        );

      const exitedCompany = await queryRunner.manager.findOne(Company, {
        where: { email: createCompanyDto.email },
      });

      if (exitedCompany)
        throw new BadRequestException(
          await this.i18n.t('company.EXISTED', {
            args: { email: createCompanyDto.email },
          }),
        );

      const exitedCompanyByName = await queryRunner.manager.findOne(Company, {
        where: { name: createCompanyDto.name },
      });

      if (exitedCompanyByName)
        throw new BadRequestException(
          await this.i18n.t('company.EXISTED', {
            args: { name: createCompanyDto.name },
          }),
        );

      const company = this.companyRepository.create(createCompanyDto);

      if (createAddressInput) {
        const address =
          await this.addressService.createAddress(createAddressInput);

        company.addressId = address.data.id;
        company.address = address.data;
      }

      const savedCompany = await queryRunner.manager.save(Company, company);

      user.companyId = savedCompany.id;
      user.role = Role.COMPANY;
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        data: savedCompany,
        message: await this.i18n.t('company.CREATED', {
          args: { name: createCompanyDto.name },
        }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async find(name: string): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({ where: { name } });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND_BY_NAME', {
          args: { name },
        }),
      );

    return { data: company };
  }

  async findById(id: string): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );

    return { data: company };
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CompanysResponse> {
    const companys = await this.companyRepository.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (companys.length > 0) return { items: companys };

    throw new NotFoundException(await this.i18n.t('company.NOT_FOUNDS'));
  }

  async addEmployee(id: string, userId: string, managerId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );

    if (user.companyId === managerId)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_MANAGER', {
          args: { id },
        }),
      );

    user.companyId = company.id;
    user.role = Role.COMPANY;
    await this.userRepository.save(user);

    return {
      data: company,
      message: await this.i18n.t('company.ADD_EMPLOYEE', {
        args: { name: company.name },
      }),
    };
  }

  async removeEmployee(id: string, userId: string, managerId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );

    if (user.companyId === managerId)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_MANAGER', {
          args: { id },
        }),
      );

    user.companyId = null;
    user.role = Role.USER;
    await this.userRepository.save(user);

    return {
      data: company,
      message: await this.i18n.t('company.REMOVE_EMPLOYEE', {
        args: { name: company.name },
      }),
    };
  }

  async getAllEmployees(id: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { companyId: id },
    });

    return users;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    // const { addressId } = updateCompanyDto;
    const existingCompanyById = await this.companyRepository.findOne({
      where: { id },
    });
    if (!existingCompanyById)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );

    // if (!addressId) {
    //   throw new BadRequestException(AddressRequire);
    // }

    Object.assign(existingCompanyById, updateCompanyDto);
    await this.companyRepository.save(existingCompanyById);

    return {
      data: existingCompanyById,
      message: await this.i18n.t('company.UPDATED', { args: { id } }),
    };
  }

  async delete(id: string): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );

    await this.companyRepository.remove(company);
    return {
      data: null,
      message: await this.i18n.t('company.DELETED', { args: { id } }),
    };
  }

  async editUserToCompany(
    userId: string,
    componyId: string,
  ): Promise<UserResponse> {
    const company = await this.companyRepository.findOne({
      where: { id: componyId },
    });
    if (!company)
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { componyId },
        }),
      );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    user.role = Role.COMPANY;
    user.companyId = company.id;
    await this.userRepository.save(user);

    return {
      data: user,
      message: await this.i18n.t('company.UPDATE_USER', {
        args: { name: user.fullName },
      }),
    };
  }

  async getAddress(id: string): Promise<Address | null> {
    const address = await this.addressRepository.findOne({ where: { id } });
    return address || null;
  }
}
