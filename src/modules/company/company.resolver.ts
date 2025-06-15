import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { CreateCompanyDto } from './inputs/createCompany.input';
import { UpdateCompanyDto } from './inputs/updateCompany.input';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { CompanyResponse, CompanysResponse } from './dto/companyResponse.dto';
import { Auth } from 'src/common/decerator/auth.decerator';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { UserResponse } from '../users/dto/UserResponse.dto';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { Address } from '../address/entity/address.entity';
import { AddEmployeeInput } from './inputs/addEmployee.input';
import {
  CompanyIdInput,
  CompanyNameInput,
  CompanyUserIdInput,
} from './inputs/company.input';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COMPANY])
  async createCompany(
    @Args('companyUserIdInput') companyUserIdInput: CompanyUserIdInput,
    @Args('createCompanyDto') createCompanyDto: CreateCompanyDto,
    @Args('createAddressInput', { nullable: true })
    createAddressInput?: CreateAddressInput,
  ): Promise<CompanyResponse> {
    return this.companyService.create(
      createCompanyDto,
      companyUserIdInput.userId,
      createAddressInput,
    );
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.COMPANY], [Permission.ADD_EMPLOYEE])
  async addEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Args('addEmployeeInput') addEmployeeInput: AddEmployeeInput,
  ): Promise<CompanyResponse> {
    return this.companyService.addEmployee(
      addEmployeeInput.companyId,
      addEmployeeInput.userId,
      user.id,
    );
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.COMPANY], [Permission.DELETE_EMPLOYEE])
  async deleteEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Args('addEmployeeInput') addEmployeeInput: AddEmployeeInput,
  ): Promise<CompanyResponse> {
    return this.companyService.removeEmployee(
      addEmployeeInput.companyId,
      addEmployeeInput.userId,
      user.id,
    );
  }

  @Query(() => CompanyResponse, { nullable: true })
  getCompanyById(@Args('id') id: CompanyIdInput): Promise<CompanyResponse> {
    return this.companyService.findById(id.companyId);
  }

  @Query(() => CompanyResponse, { nullable: true })
  getCompanyByName(
    @Args('name') name: CompanyNameInput,
  ): Promise<CompanyResponse> {
    return this.companyService.find(name.name);
  }

  @Query(() => CompanysResponse, { nullable: true })
  @Auth([Role.ADMIN], [Permission.VIEW_COMPANY])
  getAllCompanys(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CompanysResponse> {
    return this.companyService.findAll(page, limit);
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COMPANY])
  async updateCompany(
    @Args('updateCompanyDto') updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    return this.companyService.update(updateCompanyDto.id, updateCompanyDto);
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COMPANY])
  async deleteCompany(
    @Args('id') id: CompanyIdInput,
  ): Promise<CompanyResponse> {
    return this.companyService.delete(id.companyId);
  }

  @Mutation(() => UserResponse)
  @Auth([Role.ADMIN], [Permission.EDIT_USER_ROLE])
  async editUserRole(
    @Args('addEmployeeInput') addEmployeeInput: AddEmployeeInput,
  ): Promise<UserResponse> {
    return this.companyService.editUserToCompany(
      addEmployeeInput.userId,
      addEmployeeInput.companyId,
    );
  }

  @ResolveField(() => [User], { nullable: true })
  @Auth([Role.ADMIN], [Permission.VIEW_COMPANY])
  async employees(@Parent() company: Company): Promise<User[] | null> {
    return this.companyService.getAllEmployees(company.id);
  }

  @ResolveField(() => Address, { nullable: true })
  async address(@Parent() company: Company): Promise<Address | null> {
    return this.companyService.getAddress(company?.addressId);
  }
}
