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
import { UserResponse } from '../users/dto/UserResponse.dto';
import { UserProxy } from '../users/proxy/user.proxy';
import { RedisService } from 'src/common/redis/redis.service';
import { AddressService } from '../address/address.service';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { CompanyFacade } from './fascade/company.fascade';
import { CompanyRepositoryProxy } from './proxy/company.proxy';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { Address } from '../address/entity/address.entity';
import { CompanyExistsHandler } from './chain/company.chain';
import {
  CreateCompanyCommand,
  UpdateCompanyCommand,
} from './commands/company.command';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { RemoveEmployeeOperation } from './bridge/removeEmployee.bridge';
import { AddEmployeeOperation } from './bridge/addEmployee.bridge';
import {
  AddEmployeeCommand,
  RemoveEmployeeCommand,
} from './commands/employee.command';
import {
  CompanyExistsValidator,
  EmployeeExistsValidator,
  EmployeeValidatorComposite,
  ManagerValidator,
} from './composite/employee.composite';
import {
  EmployeeActiveState,
  EmployeeInactiveState,
} from './state/company.state';

@Injectable()
export class CompanyService {
  private companyProxy: CompanyRepositoryProxy;
  private userProxy: UserProxy;
  private employeeValidator: EmployeeValidatorComposite;

  constructor(
    private readonly i18n: I18nService,
    private readonly addressService: AddressService,
    private readonly redisService: RedisService,
    private readonly employeeActiveState: EmployeeActiveState,
    private readonly employeeInactiveState: EmployeeInactiveState,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.employeeValidator = new EmployeeValidatorComposite();
    this.employeeValidator.add(new EmployeeExistsValidator(i18n));
    this.employeeValidator.add(new CompanyExistsValidator(i18n));
    this.employeeValidator.add(new ManagerValidator(i18n));
    this.companyProxy = new CompanyRepositoryProxy(companyRepository);
    this.userProxy = new UserProxy(
      this.i18n,
      this.redisService,
      this.userRepository,
    );
  }

  @Transactional()
  async create(
    createCompanyDto: CreateCompanyDto,
    userId: string,
    createAddressInput?: CreateAddressInput,
  ): Promise<CompanyResponse> {
    try {
      const user = (await this.userProxy.findById(userId)!)?.data;

      const command = new CreateCompanyCommand(
        new CompanyFacade(
          this.companyRepository,
          this.addressService,
          this.i18n,
        ),
        createCompanyDto,
        this.i18n,
        createAddressInput,
      );

      const result = await command.execute();

      user.companyId = result.data.id;
      user.role = Role.COMPANY;
      await this.userRepository.save(user);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async find(name: string): Promise<CompanyResponse> {
    const company = await this.companyProxy.findOneByName(name);

    const existsHandler = new CompanyExistsHandler(name);
    await existsHandler.handle(company, this.i18n);

    return { data: company };
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    const command = new UpdateCompanyCommand(
      new CompanyFacade(this.companyRepository, this.addressService, this.i18n),
      id,
      updateCompanyDto,
      this.i18n,
    );

    const result = await command.execute();

    return result;
  }

  async delete(id: string): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({ where: { id } });

    const existsHandler = new CompanyExistsHandler(id);
    await existsHandler.handle(company, this.i18n);

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
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    const existsHandler = new CompanyExistsHandler(companyId);
    await existsHandler.handle(company, this.i18n);

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

  async findById(id: string): Promise<CompanyResponse> {
    const company = await this.companyProxy.findOneById(id);
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
    const companies = await this.companyProxy.findAllPaginated(page, limit);
    if (companies.length > 0) return { items: companies };

    throw new NotFoundException(await this.i18n.t('company.NOT_FOUNDS'));
  }

  async addEmployee(id: string, userId: string, managerId: string) {
    const user = (await this.userProxy.findById(userId)!)?.data;
    const company = await this.companyProxy.findOneById(id);

    await this.employeeValidator.validate(user, company, managerId);

    const command = new AddEmployeeCommand(
      company,
      user,
      this.i18n,
      this.employeeActiveState,
      this.userRepository,
    );
    const result = await command.execute();
    await this.userRepository.save(user);
    return result;
  }

  async removeEmployee(id: string, userId: string, managerId: string) {
    const user = (await this.userProxy.findById(userId)!)?.data;
    const company = await this.companyProxy.findOneById(id);

    await this.employeeValidator.validate(user, company, managerId);

    const command = new RemoveEmployeeCommand(
      user,
      company,
      this.i18n,
      this.employeeInactiveState,
      this.userRepository,
    );
    const result = await command.execute();
    await this.userRepository.save(user);
    return result;
  }

  async getAllEmployees(id: string): Promise<User[]> {
    return this.userRepository.find({
      where: { companyId: id },
    });
  }
}
