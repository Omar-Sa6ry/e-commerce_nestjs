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
import { CreateCompanyDto } from './inputs/createCompany.dto';
import { UpdateCompanyDto } from './inputs/updateCompany.dto';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { CompanyResponse, CompanysResponse } from './dto/companyResponse.dto';
import { Auth } from 'src/common/decerator/auth.decerator';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { UserResponse } from '../users/dto/UserResponse.dto';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { Address } from '../address/entity/address.entity';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COMPANY])
  async createCompany(
    @Args('userId') userId: string,
    @Args('createCompanyDto') createCompanyDto: CreateCompanyDto,
    @Args('createAddressInput', { nullable: true })
    createAddressInput?: CreateAddressInput,
  ): Promise<CompanyResponse> {
    console.log("minuu")
    return this.companyService.create(
      createCompanyDto,
      userId,
      createAddressInput,
    );
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.COMPANY], [Permission.ADD_EMPLOYEE])
  async addEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Args('companyId') companyId: string,
    @Args('userId') userId: string,
  ): Promise<CompanyResponse> {
    return this.companyService.addEmployee(companyId, userId, user.id);
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.COMPANY], [Permission.DELETE_EMPLOYEE])
  async deleteEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Args('companyId') companyId: string,
    @Args('userId') userId: string,
  ): Promise<CompanyResponse> {
    return this.companyService.removeEmployee(companyId, userId, user.id);
  }

  @Query(() => CompanyResponse, { nullable: true })
  getCompanyById(@Args('id') id: string): Promise<CompanyResponse> {
    return this.companyService.findById(id);
  }

  @Query(() => CompanyResponse, { nullable: true })
  getCompanyByName(@Args('name') name: string): Promise<CompanyResponse> {
    return this.companyService.find(name);
  }

  @Query(() => CompanysResponse, { nullable: true })
  @Auth([Role.ADMIN], [Permission.VIEW_COMPANY])
  getAllCompanys(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CompanysResponse> {
    return this.companyService.findAll();
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COMPANY])
  async updateCompany(
    @Args('id') id: string,
    @Args('updateCompanyDto') updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Mutation(() => CompanyResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COMPANY])
  async deleteCompany(@Args('id') id: string): Promise<CompanyResponse> {
    return this.companyService.delete(id);
  }

  @Mutation(() => UserResponse)
  @Auth([Role.ADMIN], [Permission.EDIT_USER_ROLE])
  async editUserRole(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
  ): Promise<UserResponse> {
    return this.companyService.editUserToCompany(userId, companyId);
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
