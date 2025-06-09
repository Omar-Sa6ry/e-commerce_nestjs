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

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Auth([Role.ADMIN], [Permission.CREATE_COMPANY])
  @Mutation(() => CompanyResponse)
  async createCompany(
    @Args('createCompanyDto') createCompanyDto: CreateCompanyDto,
    @Args('userId') userId: string,
  ): Promise<CompanyResponse> {
    return this.companyService.create(createCompanyDto, userId);
  }

  @Auth([Role.COMPANY], [Permission.ADD_EMPLOYEE])
  @Mutation(() => CompanyResponse)
  async addEmployee(
    @CurrentUser() user: CurrentUserDto,
    @Args('companyId') companyId: string,
    @Args('userId') userId: string,
  ): Promise<CompanyResponse> {
    return this.companyService.addEmployee(companyId, userId, user.id);
  }

  @Auth([Role.COMPANY], [Permission.DELETE_EMPLOYEE])
  @Mutation(() => CompanyResponse)
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

  @Auth([Role.ADMIN], [Permission.VIEW_COMPANY])
  @Query(() => CompanysResponse, { nullable: true })
  getAllCompanys(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CompanysResponse> {
    return this.companyService.findAll();
  }

  @Auth([Role.ADMIN], [Permission.UPDATE_COMPANY])
  @Mutation(() => CompanyResponse)
  async updateCompany(
    @Args('id') id: string,
    @Args('updateCompanyDto') updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Auth([Role.ADMIN], [Permission.DELETE_COMPANY])
  @Mutation(() => CompanyResponse)
  async deleteCompany(@Args('id') id: string): Promise<CompanyResponse> {
    return this.companyService.delete(id);
  }

  @ResolveField(() => [User], { nullable: true })
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.VIEW_COMPANY])
  async employees(@Parent() company: Company): Promise<User[] | null> {
    return this.companyService.getAllEmployees(company.id);
  }
}
