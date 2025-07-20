import { Injectable, NotFoundException } from '@nestjs/common';
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
import { ICompanyValidator } from './interfaces/ICompany.interface';
import { CompanyFacade } from './fascade/company.fascade';
import { CompanyRepositoryProxy } from './proxy/company.proxy';
import { CompanyValidatorAdapter } from './adapter/company.adapter';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { AddEmployeeOperation } from './bridge/addEmployee.bridge';
import { RemoveEmployeeOperation } from './bridge/removeEmployee.bridge';
import {
  CompanyExistsValidator,
  EmployeeExistsValidator,
  EmployeeValidatorComposite,
  ManagerValidator,
} from './composite/employee.composite';

@Injectable()
export class CompanyService {
  private validator: ICompanyValidator;
  private facade: CompanyFacade;
  private repositoryProxy: CompanyRepositoryProxy;
  private employeeValidator: EmployeeValidatorComposite;

  constructor(
    private readonly i18n: I18nService,
    private readonly addressService: AddressService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    this.validator = new CompanyValidatorAdapter(companyRepository, i18n);
    this.facade = new CompanyFacade(
      this.validator,
      this.companyRepository,
      this.addressService,
    );
    this.repositoryProxy = new CompanyRepositoryProxy(companyRepository);

    this.employeeValidator = new EmployeeValidatorComposite();
    this.employeeValidator.add(new EmployeeExistsValidator(i18n));
    this.employeeValidator.add(new CompanyExistsValidator(i18n));
    this.employeeValidator.add(new ManagerValidator(i18n));
  }

  @Transactional()
  async create(
    createCompanyDto: CreateCompanyDto,
    userId: string,
    createAddressInput?: CreateAddressInput,
    queryRunner?: any,
  ): Promise<CompanyResponse> {
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(
          await this.i18n.t('user.NOT_FOUND', { args: { id: userId } }),
        );
      }

      const company = await this.facade.createCompany(
        createCompanyDto,
        createAddressInput,
      );

      user.companyId = company.id;
      user.role = Role.COMPANY;
      await queryRunner.manager.save(User, user);

      return {
        statusCode: 201,
        data: company,
        message: await this.i18n.t('company.CREATED', {
          args: { name: createCompanyDto.name },
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async find(name: string): Promise<CompanyResponse> {
    const company = await this.repositoryProxy.findOneByName(name);
    if (!company) {
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND_BY_NAME', {
          args: { name },
        }),
      );
    }
    return { data: company };
  }

  async findById(id: string): Promise<CompanyResponse> {
    const company = await this.repositoryProxy.findOneById(id);
    if (!company) {
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', {
          args: { id },
        }),
      );
    }
    return { data: company };
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<CompanysResponse> {
    const companies = await this.repositoryProxy.findAllPaginated(page, limit);
    if (companies.length > 0) return { items: companies };

    throw new NotFoundException(await this.i18n.t('company.NOT_FOUNDS'));
  }

  async addEmployee(id: string, userId: string, managerId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id } });

    await this.employeeValidator.validate(user, company, managerId);

    const operation = new AddEmployeeOperation(this.userRepository, this.i18n);
    return operation.execute(user, company);
  }

  async removeEmployee(id: string, userId: string, managerId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id } });

    await this.employeeValidator.validate(user, company, managerId);

    const operation = new RemoveEmployeeOperation(
      this.userRepository,
      this.i18n,
    );
    return operation.execute(user, company);
  }

  async getAllEmployees(id: string): Promise<User[]> {
    return this.userRepository.find({
      where: { companyId: id },
    });
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    const company = await this.facade.updateCompany(id, updateCompanyDto);
    return {
      data: company,
      message: await this.i18n.t('company.UPDATED', { args: { id } }),
    };
  }

  async delete(id: string): Promise<CompanyResponse> {
    const company = await this.validator.validateExists(id);
    await this.companyRepository.remove(company);
    return {
      data: null,
      message: await this.i18n.t('company.DELETED', { args: { id } }),
    };
  }

  async editUserToCompany(
    userId: string,
    companyId: string,
  ): Promise<UserResponse> {
    const company = await this.validator.validateExists(companyId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));
    }

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
    return this.addressRepository.findOne({ where: { id } });
  }
}
